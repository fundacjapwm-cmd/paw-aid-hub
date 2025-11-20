import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import OrgLayout from "@/components/organization/OrgLayout";
import ProductRequestDialog from "@/components/organization/ProductRequestDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

export default function OrgRequests() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (profile?.role !== "ORG") {
      navigate("/");
      return;
    }

    fetchOrganization();
  }, [user, profile, navigate]);

  const fetchOrganization = async () => {
    const { data: orgUser } = await supabase
      .from("organization_users")
      .select("organization_id, organizations(name)")
      .eq("user_id", user?.id)
      .single();

    if (orgUser) {
      setOrganizationId(orgUser.organization_id);
      setOrganizationName((orgUser.organizations as any).name);
      fetchRequests(orgUser.organization_id);
    }
  };

  const fetchRequests = async (orgId: string) => {
    const { data } = await supabase
      .from("product_requests")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });

    setRequests(data || []);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
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
      <Badge variant={variants[status] || "outline"}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <OrgLayout organizationName={organizationName}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Zgłoszenia produktów</h2>
            <p className="text-muted-foreground">
              Zgłoś braki w katalogu produktów
            </p>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            className="rounded-2xl shadow-soft hover:scale-105 transition-transform"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nowe zgłoszenie
          </Button>
        </div>

        <Card className="rounded-3xl shadow-card">
          <CardHeader>
            <CardTitle>Twoje zgłoszenia</CardTitle>
            <CardDescription>
              Historia zgłoszeń brakujących produktów
            </CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nie masz jeszcze żadnych zgłoszeń
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Produkt</TableHead>
                    <TableHead>Producent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        {format(new Date(request.created_at), "d MMM yyyy", { locale: pl })}
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
                            className="text-primary hover:underline"
                          >
                            Zobacz
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <ProductRequestDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </OrgLayout>
  );
}
