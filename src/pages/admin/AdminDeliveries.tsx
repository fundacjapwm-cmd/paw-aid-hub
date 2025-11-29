import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Package, Calendar, CheckCircle2, Clock, Truck } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface Shipment {
  id: string;
  organizationId: string;
  organizationName: string;
  producerName: string | null;
  status: "shipped" | "delivered" | "confirmed";
  trackingNumber: string | null;
  shippedAt: string;
  confirmedAt: string | null;
  itemCount: number;
}

export default function AdminDeliveries() {
  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ["admin-deliveries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shipments')
        .select(`
          id,
          organization_id,
          producer_id,
          status,
          tracking_number,
          shipped_at,
          confirmed_at,
          organizations (name),
          producers (name)
        `)
        .order('shipped_at', { ascending: false });

      if (error) throw error;

      // Get item counts for each shipment
      const result: Shipment[] = [];
      
      for (const shipment of data || []) {
        const { count } = await supabase
          .from('order_items')
          .select('*', { count: 'exact', head: true })
          .eq('shipment_id', shipment.id);

        result.push({
          id: shipment.id,
          organizationId: shipment.organization_id,
          organizationName: (shipment.organizations as any)?.name || 'N/A',
          producerName: (shipment.producers as any)?.name || null,
          status: shipment.status as "shipped" | "delivered" | "confirmed",
          trackingNumber: shipment.tracking_number,
          shippedAt: shipment.shipped_at,
          confirmedAt: shipment.confirmed_at,
          itemCount: count || 0,
        });
      }

      return result;
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'shipped':
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            W drodze
          </Badge>
        );
      case 'delivered':
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
            <Truck className="h-3 w-3 mr-1" />
            Dostarczona
          </Badge>
        );
      case 'confirmed':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Potwierdzona
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingCount = shipments.filter(s => s.status === 'shipped').length;
  const confirmedCount = shipments.filter(s => s.status === 'confirmed').length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl p-6 border border-border/50 shadow-card">
          <h2 className="text-xl font-semibold text-foreground mb-2">Dostawy</h2>
          <p className="text-muted-foreground">Ładowanie danych...</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl p-6 border border-border/50 shadow-card">
        <h2 className="text-xl font-semibold text-foreground mb-2">Dostawy</h2>
        <p className="text-muted-foreground">Śledzenie paczek wysłanych do organizacji</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{shipments.length}</p>
            <p className="text-xs text-muted-foreground">Wszystkie</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">W drodze</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{confirmedCount}</p>
            <p className="text-xs text-muted-foreground">Potwierdzone</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {confirmedCount > 0 ? Math.round((confirmedCount / shipments.length) * 100) : 0}%
            </p>
            <p className="text-xs text-muted-foreground">Skuteczność</p>
          </CardContent>
        </Card>
      </div>

      {/* Shipments list */}
      {shipments.length === 0 ? (
        <Card className="rounded-3xl shadow-card border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Truck className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Brak dostaw
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              Historia dostaw pojawi się tutaj po złożeniu pierwszego zamówienia.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {shipments.map((shipment) => (
            <Card key={shipment.id} className="rounded-2xl shadow-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                    shipment.status === 'confirmed' 
                      ? 'bg-green-100' 
                      : shipment.status === 'shipped' 
                      ? 'bg-blue-100' 
                      : 'bg-amber-100'
                  }`}>
                    <Building2 className={`h-6 w-6 ${
                      shipment.status === 'confirmed' 
                        ? 'text-green-600' 
                        : shipment.status === 'shipped' 
                        ? 'text-blue-600' 
                        : 'text-amber-600'
                    }`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{shipment.organizationName}</h3>
                      {getStatusBadge(shipment.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(shipment.shippedAt), "dd.MM.yyyy", { locale: pl })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {shipment.itemCount} produktów
                      </span>
                      {shipment.trackingNumber && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">
                          {shipment.trackingNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  {shipment.status === 'confirmed' && shipment.confirmedAt && (
                    <div className="text-right text-sm">
                      <p className="text-green-600 font-medium">Odebrano</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(shipment.confirmedAt), "dd.MM.yyyy HH:mm", { locale: pl })}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
