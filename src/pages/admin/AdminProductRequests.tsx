import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ExternalLink, Check, X, Eye } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

export default function AdminProductRequests() {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  const { data: requests, refetch } = useQuery({
    queryKey: ["admin-product-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_requests")
        .select(`
          *,
          organizations (
            name,
            contact_email
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleStatusChange = async (requestId: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("product_requests")
      .update({ 
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zmienić statusu zgłoszenia",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sukces",
      description: `Zgłoszenie zostało ${status === "approved" ? "zaakceptowane" : "odrzucone"}`,
    });

    refetch();
    setViewDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
    };

    const labels: Record<string, string> = {
      pending: "Oczekuje",
      approved: "Zaakceptowano",
      rejected: "Odrzucono",
    };

    return (
      <Badge variant={variants[status] || "secondary"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const pendingRequests = requests?.filter(r => r.status === "pending") || [];
  const processedRequests = requests?.filter(r => r.status !== "pending") || [];

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl shadow-card">
        <CardHeader>
          <CardTitle>Oczekujące zgłoszenia</CardTitle>
          <CardDescription>
            Zgłoszenia produktów wymagające weryfikacji ({pendingRequests.length})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Brak oczekujących zgłoszeń
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Organizacja</TableHead>
                  <TableHead>Nazwa produktu</TableHead>
                  <TableHead>Producent</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead className="text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(request.created_at), "d MMM yyyy", { locale: pl })}
                    </TableCell>
                    <TableCell>
                      {(request.organizations as any)?.name || "-"}
                    </TableCell>
                    <TableCell className="font-medium">{request.product_name}</TableCell>
                    <TableCell>{request.producer_name || "-"}</TableCell>
                    <TableCell>
                      {request.product_link ? (
                        <a
                          href={request.product_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Link
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setAdminNotes(request.notes || "");
                            setViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Szczegóły
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleStatusChange(request.id, "approved")}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Zatwierdź
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleStatusChange(request.id, "rejected")}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Odrzuć
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-card">
        <CardHeader>
          <CardTitle>Zarchiwizowane zgłoszenia</CardTitle>
          <CardDescription>
            Historia przetworzonych zgłoszeń ({processedRequests.length})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {processedRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Brak zarchiwizowanych zgłoszeń
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Organizacja</TableHead>
                  <TableHead>Nazwa produktu</TableHead>
                  <TableHead>Producent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead className="text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(request.created_at), "d MMM yyyy", { locale: pl })}
                    </TableCell>
                    <TableCell>
                      {(request.organizations as any)?.name || "-"}
                    </TableCell>
                    <TableCell className="font-medium">{request.product_name}</TableCell>
                    <TableCell>{request.producer_name || "-"}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {request.product_link ? (
                        <a
                          href={request.product_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Link
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setAdminNotes(request.notes || "");
                          setViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Szczegóły
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Szczegóły zgłoszenia produktu</DialogTitle>
            <DialogDescription>
              Informacje o zgłoszonym produkcie
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Organizacja</Label>
                  <p className="font-medium">{(selectedRequest.organizations as any)?.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data zgłoszenia</Label>
                  <p className="font-medium">
                    {format(new Date(selectedRequest.created_at), "d MMMM yyyy, HH:mm", { locale: pl })}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Nazwa produktu</Label>
                  <p className="font-medium">{selectedRequest.product_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Producent</Label>
                  <p className="font-medium">{selectedRequest.producer_name || "-"}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Link do produktu</Label>
                  {selectedRequest.product_link ? (
                    <a
                      href={selectedRequest.product_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-2 mt-1"
                    >
                      {selectedRequest.product_link}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    <p>Brak linku</p>
                  )}
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Dodatkowe uwagi</Label>
                  <p className="mt-1 text-sm whitespace-pre-wrap">
                    {selectedRequest.notes || "Brak dodatkowych uwag"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
              </div>
            </div>
          )}
          {selectedRequest?.status === "pending" && (
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setViewDialogOpen(false)}
              >
                Anuluj
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleStatusChange(selectedRequest.id, "rejected")}
              >
                <X className="h-4 w-4 mr-2" />
                Odrzuć
              </Button>
              <Button
                onClick={() => handleStatusChange(selectedRequest.id, "approved")}
              >
                <Check className="h-4 w-4 mr-2" />
                Zatwierdź
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
