import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Package, Calendar, CheckCircle2, Factory } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface CompletedShipment {
  id: string;
  organizationName: string;
  producerName: string | null;
  confirmedAt: string;
  trackingNumber: string | null;
  itemCount: number;
  totalValue: number;
}

export default function AdminLogisticsCompleted() {
  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ["admin-logistics-completed"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shipments')
        .select(`
          id,
          tracking_number,
          confirmed_at,
          total_value,
          organizations (name),
          producers (name)
        `)
        .eq('status', 'confirmed')
        .order('confirmed_at', { ascending: false });

      if (error) throw error;

      const result: CompletedShipment[] = [];

      for (const shipment of data || []) {
        const { count } = await supabase
          .from('order_items')
          .select('*', { count: 'exact', head: true })
          .eq('shipment_id', shipment.id);

        result.push({
          id: shipment.id,
          organizationName: (shipment.organizations as any)?.name || 'N/A',
          producerName: (shipment.producers as any)?.name || null,
          confirmedAt: shipment.confirmed_at || '',
          trackingNumber: shipment.tracking_number,
          itemCount: count || 0,
          totalValue: shipment.total_value || 0,
        });
      }

      return result;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-100 via-accent/10 to-green-100 rounded-3xl p-6 border border-border/50 shadow-card">
          <h2 className="text-xl font-semibold text-foreground mb-2">Zakończone</h2>
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
      <div className="bg-gradient-to-r from-green-100 via-accent/10 to-green-100 rounded-3xl p-6 border border-border/50 shadow-card">
        <h2 className="text-xl font-semibold text-foreground mb-2">Zakończone</h2>
        <p className="text-muted-foreground">
          Zamówienia potwierdzone przez organizacje jako odebrane.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="rounded-2xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{shipments.length}</p>
            <p className="text-xs text-muted-foreground">Zrealizowanych</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {shipments.reduce((sum, s) => sum + s.itemCount, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Dostarczonych produktów</p>
          </CardContent>
        </Card>
      </div>

      {/* Shipments list */}
      {shipments.length === 0 ? (
        <Card className="rounded-3xl shadow-card border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Brak zakończonych zamówień
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              Zamówienia pojawią się tutaj po potwierdzeniu odbioru przez organizację.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {shipments.map((shipment) => (
            <Card key={shipment.id} className="rounded-2xl shadow-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {shipment.producerName && (
                        <>
                          <span className="flex items-center gap-1 text-sm">
                            <Factory className="h-3 w-3 text-accent" />
                            {shipment.producerName}
                          </span>
                          <span className="text-muted-foreground">→</span>
                        </>
                      )}
                      <span className="flex items-center gap-1 font-semibold">
                        <Building2 className="h-4 w-4 text-primary" />
                        {shipment.organizationName}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Odebrano: {shipment.confirmedAt 
                          ? format(new Date(shipment.confirmedAt), "dd.MM.yyyy HH:mm", { locale: pl })
                          : 'N/A'}
                      </span>
                      <Badge variant="outline">
                        <Package className="h-3 w-3 mr-1" />
                        {shipment.itemCount} produktów
                      </Badge>
                      {shipment.trackingNumber && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">
                          {shipment.trackingNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  <Badge className="bg-green-100 text-green-700 border-green-200 shrink-0">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Zrealizowane
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
