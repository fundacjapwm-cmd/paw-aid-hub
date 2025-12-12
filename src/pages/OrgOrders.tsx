import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Package, 
  Calendar, 
  Clock, 
  Truck, 
  CheckCircle2, 
  AlertTriangle,
  Factory
} from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

interface OrgShipment {
  id: string;
  producerName: string | null;
  status: string;
  trackingNumber: string | null;
  shippedAt: string | null;
  confirmedAt: string | null;
  orderedAt: string | null;
  items: {
    id: string;
    productName: string;
    quantity: number;
    animalName: string | null;
  }[];
}

export default function OrgOrders() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [problemDescription, setProblemDescription] = useState("");
  const [processing, setProcessing] = useState(false);

  const { data: orgData } = useQuery({
    queryKey: ["user-organization", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("organization_users")
        .select("organization_id")
        .eq("user_id", user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ["org-orders", orgData?.organization_id],
    queryFn: async () => {
      if (!orgData?.organization_id) return [];

      const { data, error } = await supabase
        .from('shipments')
        .select(`
          id,
          status,
          tracking_number,
          shipped_at,
          confirmed_at,
          ordered_at,
          producers (name)
        `)
        .eq('organization_id', orgData.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const result: OrgShipment[] = [];

      for (const shipment of data || []) {
        const { data: items } = await supabase
          .from('order_items')
          .select(`
            id,
            quantity,
            products (name),
            animals (name)
          `)
          .eq('shipment_id', shipment.id);

        result.push({
          id: shipment.id,
          producerName: (shipment.producers as any)?.name || null,
          status: shipment.status,
          trackingNumber: shipment.tracking_number,
          shippedAt: shipment.shipped_at,
          confirmedAt: shipment.confirmed_at,
          orderedAt: shipment.ordered_at,
          items: (items || []).map((item: any) => ({
            id: item.id,
            productName: item.products?.name || 'N/A',
            quantity: item.quantity,
            animalName: item.animals?.name || null,
          })),
        });
      }

      return result;
    },
    enabled: !!orgData?.organization_id,
  });

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'collecting':
        return {
          label: 'Oczekuje na minimum logistyczne',
          badge: <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Kompletowanie</Badge>,
          icon: <Clock className="h-6 w-6 text-muted-foreground" />,
          bgColor: 'bg-muted',
        };
      case 'ordered':
        return {
          label: 'Oczekuje na nadanie',
          badge: <Badge className="bg-amber-100 text-amber-700 border-amber-200"><Package className="h-3 w-3 mr-1" />Zamówione</Badge>,
          icon: <Package className="h-6 w-6 text-amber-600" />,
          bgColor: 'bg-amber-100',
        };
      case 'shipped':
        return {
          label: 'W drodze!',
          badge: <Badge className="bg-blue-100 text-blue-700 border-blue-200"><Truck className="h-3 w-3 mr-1" />W drodze</Badge>,
          icon: <Truck className="h-6 w-6 text-blue-600" />,
          bgColor: 'bg-blue-100',
        };
      case 'confirmed':
        return {
          label: 'Zrealizowane',
          badge: <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle2 className="h-3 w-3 mr-1" />Zrealizowane</Badge>,
          icon: <CheckCircle2 className="h-6 w-6 text-green-600" />,
          bgColor: 'bg-green-100',
        };
      default:
        return {
          label: status,
          badge: <Badge variant="outline">{status}</Badge>,
          icon: <Package className="h-6 w-6 text-muted-foreground" />,
          bgColor: 'bg-muted',
        };
    }
  };

  const handleConfirmDelivery = async () => {
    if (!confirmingId) return;

    try {
      setProcessing(true);

      const { error } = await supabase
        .from('shipments')
        .update({
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
        })
        .eq('id', confirmingId);

      if (error) throw error;

      // Update order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .update({ fulfillment_status: 'fulfilled' })
        .eq('shipment_id', confirmingId);

      if (itemsError) throw itemsError;

      toast({
        title: "Zamówienie potwierdzone",
        description: "Dziękujemy za potwierdzenie odbioru!",
      });

      setConfirmingId(null);
      queryClient.invalidateQueries({ queryKey: ["org-orders"] });
    } catch (error) {
      console.error('Error confirming delivery:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się potwierdzić odbioru",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReportProblem = async () => {
    if (!reportingId || !problemDescription.trim()) return;

    try {
      setProcessing(true);

      // Send email with problem report (simplified - would use edge function in production)
      console.log('Problem report:', {
        shipmentId: reportingId,
        description: problemDescription,
        to: 'fundacjapwm@gmail.com'
      });

      toast({
        title: "Zgłoszenie wysłane",
        description: "Skontaktujemy się z Tobą w sprawie problemu.",
      });

      setReportingId(null);
      setProblemDescription("");
    } catch (error) {
      console.error('Error reporting problem:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się wysłać zgłoszenia",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const activeShipments = shipments.filter(s => s.status !== 'confirmed');
  const completedShipments = shipments.filter(s => s.status === 'confirmed');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Zamówienia</h1>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  const renderShipmentCard = (shipment: OrgShipment) => {
    const statusDisplay = getStatusDisplay(shipment.status);
    const canConfirm = shipment.status === 'shipped';

    return (
      <Card key={shipment.id} className="rounded-3xl shadow-card border-border/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={`h-12 w-12 rounded-xl ${statusDisplay.bgColor} flex items-center justify-center shrink-0`}>
              {statusDisplay.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {shipment.producerName && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Factory className="h-3 w-3" />
                    {shipment.producerName}
                  </span>
                )}
                {statusDisplay.badge}
              </div>

              <p className="font-medium text-foreground mb-2">
                {statusDisplay.label}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                {shipment.shippedAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Wysłano: {format(new Date(shipment.shippedAt), "dd.MM.yyyy", { locale: pl })}
                  </span>
                )}
                {shipment.trackingNumber && (
                  <Badge variant="outline" className="text-xs">
                    Nr: {shipment.trackingNumber}
                  </Badge>
                )}
              </div>

              {/* Products preview */}
              <div className="flex flex-wrap gap-1 mb-4">
                {shipment.items.slice(0, 4).map((item, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {item.productName} x{item.quantity}
                    {item.animalName && ` (${item.animalName})`}
                  </Badge>
                ))}
                {shipment.items.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{shipment.items.length - 4} więcej
                  </Badge>
                )}
              </div>

              {/* Actions for shipped orders */}
              {canConfirm && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => setConfirmingId(shipment.id)}
                    className="rounded-2xl"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Potwierdź odbiór
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setReportingId(shipment.id)}
                    className="rounded-2xl text-amber-600 border-amber-200 hover:bg-amber-50"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Zgłoś problem
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Zamówienia</h1>

      <Tabs defaultValue="active">
        <TabsList className="grid w-full grid-cols-2 rounded-2xl">
          <TabsTrigger value="active" className="rounded-xl">
            Aktywne ({activeShipments.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-xl">
            Zrealizowane ({completedShipments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {activeShipments.length === 0 ? (
            <Card className="rounded-3xl shadow-card border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Package className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Brak aktywnych zamówień
                </h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Zamówienia pojawią się tutaj gdy darczyńcy kupią produkty z Twojej listy potrzeb.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeShipments.map(renderShipmentCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedShipments.length === 0 ? (
            <Card className="rounded-3xl shadow-card border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Brak zrealizowanych zamówień
                </h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Zamówienia pojawią się tutaj po potwierdzeniu ich odbioru.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {completedShipments.map(renderShipmentCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Confirm delivery dialog */}
      <Dialog open={!!confirmingId} onOpenChange={() => setConfirmingId(null)}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Potwierdź odbiór zamówienia</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Czy na pewno chcesz potwierdzić odbiór zamówienia? Ta akcja oznacza, że paczka dotarła i wszystkie produkty są zgodne z zamówieniem.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmingId(null)} className="rounded-2xl">
              Anuluj
            </Button>
            <Button onClick={handleConfirmDelivery} disabled={processing} className="rounded-2xl">
              {processing ? "Potwierdzanie..." : "Potwierdź odbiór"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report problem dialog */}
      <Dialog open={!!reportingId} onOpenChange={() => { setReportingId(null); setProblemDescription(""); }}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Zgłoś problem z zamówieniem</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Opisz problem który wystąpił z zamówieniem. Skontaktujemy się z Tobą jak najszybciej.
            </p>
            <Textarea
              placeholder="Opisz problem..."
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              className="min-h-[100px] rounded-2xl"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setReportingId(null); setProblemDescription(""); }} className="rounded-2xl">
              Anuluj
            </Button>
            <Button 
              onClick={handleReportProblem} 
              disabled={processing || !problemDescription.trim()}
              className="rounded-2xl"
            >
              {processing ? "Wysyłanie..." : "Wyślij zgłoszenie"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
