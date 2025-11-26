import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Package, Truck, Building2, Loader2, Save, ChevronDown, PawPrint } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BatchOrderItem {
  productName: string;
  quantity: number;
  animalName: string | null;
}

interface OrderedBatchOrder {
  id: string;
  organizationId: string;
  organizationName: string;
  organizationAddress: string;
  organizationCity: string;
  organizationPostalCode: string;
  createdAt: string;
  trackingNumber: string | null;
  status: 'ordered' | 'shipped';
  items: BatchOrderItem[];
  totalItems: number;
  orderNumber: number;
}

export default function AdminLogisticsOrdered() {
  const [savingTracking, setSavingTracking] = useState<string | null>(null);
  const [trackingNumbers, setTrackingNumbers] = useState<Map<string, string>>(new Map());
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { data: batchOrders, isLoading } = useQuery({
    queryKey: ["logistics-ordered-batch-orders"],
    queryFn: async () => {
      const { data: batches, error: batchError } = await supabase
        .from('organization_batch_orders')
        .select(`
          id,
          organization_id,
          created_at,
          status,
          tracking_number,
          organizations (
            id,
            name,
            address,
            city,
            postal_code
          )
        `)
        .in('status', ['ordered', 'shipped'])
        .order('created_at', { ascending: true });

      if (batchError) throw batchError;
      if (!batches || batches.length === 0) return [];

      const result: OrderedBatchOrder[] = [];
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const org = batch.organizations as any;
        
        const { data: orders } = await supabase
          .from('orders')
          .select('id')
          .eq('batch_order_id', batch.id)
          .in('payment_status', ['completed', 'paid']);

        if (!orders || orders.length === 0) continue;

        const orderIds = orders.map(o => o.id);

        const { data: items } = await supabase
          .from('order_items')
          .select(`
            id,
            quantity,
            fulfillment_status,
            products (name),
            animals (name)
          `)
          .in('order_id', orderIds)
          .in('fulfillment_status', ['ordered', 'shipped']);

        if (!items || items.length === 0) continue;

        const batchItems: BatchOrderItem[] = items.map((item: any) => ({
          productName: item.products?.name || 'N/A',
          quantity: item.quantity,
          animalName: item.animals?.name || null
        }));

        result.push({
          id: batch.id,
          organizationId: org?.id || '',
          organizationName: org?.name || 'N/A',
          organizationAddress: org?.address || '',
          organizationCity: org?.city || '',
          organizationPostalCode: org?.postal_code || '',
          createdAt: batch.created_at,
          trackingNumber: batch.tracking_number,
          status: batch.status as 'ordered' | 'shipped',
          items: batchItems,
          totalItems: batchItems.reduce((sum, item) => sum + item.quantity, 0),
          orderNumber: i + 1
        });
      }

      return result;
    },
  });

  const toggleExpanded = (orderId: string) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const handleTrackingChange = (orderId: string, value: string) => {
    setTrackingNumbers(prev => {
      const next = new Map(prev);
      next.set(orderId, value);
      return next;
    });
  };

  const saveTrackingNumber = async (order: OrderedBatchOrder) => {
    const tracking = trackingNumbers.get(order.id) || order.trackingNumber || '';
    
    if (!tracking.trim()) {
      toast({
        title: "Błąd",
        description: "Wprowadź numer listu przewozowego",
        variant: "destructive"
      });
      return;
    }

    try {
      setSavingTracking(order.id);

      const { error: batchError } = await supabase
        .from('organization_batch_orders')
        .update({ 
          tracking_number: tracking.trim(),
          status: 'shipped'
        })
        .eq('id', order.id);

      if (batchError) throw batchError;

      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('batch_order_id', order.id);

      if (orders && orders.length > 0) {
        const orderIds = orders.map(o => o.id);

        const { error: itemsError } = await supabase
          .from('order_items')
          .update({ fulfillment_status: 'shipped' })
          .in('order_id', orderIds)
          .eq('fulfillment_status', 'ordered');

        if (itemsError) throw itemsError;

        const { error: ordersError } = await supabase
          .from('orders')
          .update({ tracking_number: tracking.trim() })
          .in('id', orderIds);

        if (ordersError) throw ordersError;
      }

      toast({
        title: "Sukces",
        description: `Numer listu przewozowego został zapisany. Zamówienie oznaczone jako wysłane.`,
      });

      queryClient.invalidateQueries({ queryKey: ["logistics-ordered-batch-orders"] });
      queryClient.invalidateQueries({ queryKey: ["logistics-archive"] });
    } catch (error) {
      console.error('Error saving tracking number:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać numeru listu przewozowego",
        variant: "destructive"
      });
    } finally {
      setSavingTracking(null);
    }
  };

  if (isLoading) {
    return (
      <div className="md:px-8 px-4 space-y-6">
        <div className="bg-gradient-to-r from-blue-500/10 via-accent/10 to-blue-500/10 rounded-3xl p-6 border border-border/50 shadow-card">
          <h2 className="text-xl font-semibold text-foreground mb-2">Zamówione u producenta</h2>
          <p className="text-muted-foreground">Zamówienia oczekujące na wysyłkę</p>
        </div>
        <div className="space-y-4">
          {[1, 2].map(i => (
            <Skeleton key={i} className="h-40 w-full rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="md:px-8 px-4 space-y-6">
      <div className="bg-gradient-to-r from-blue-500/10 via-accent/10 to-blue-500/10 rounded-3xl p-6 border border-border/50 shadow-card">
        <h2 className="text-xl font-semibold text-foreground mb-2">Zamówione u producenta</h2>
        <p className="text-muted-foreground">Zamówienia oczekujące na wysyłkę</p>
      </div>

      {!batchOrders || batchOrders.length === 0 ? (
        <Card className="rounded-3xl shadow-card border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Truck className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Brak zamówionych przesyłek
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              Zamówienia oznaczone jako zamówione pojawią się tutaj.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {batchOrders.map((order) => {
            const isSaving = savingTracking === order.id;
            const currentTracking = trackingNumbers.get(order.id) ?? order.trackingNumber ?? '';
            const isExpanded = expandedOrders.has(order.id);

            // Group items by animal for display
            const itemsByAnimal = new Map<string, BatchOrderItem[]>();
            const generalItems: BatchOrderItem[] = [];
            order.items.forEach(item => {
              if (item.animalName) {
                const existing = itemsByAnimal.get(item.animalName) || [];
                existing.push(item);
                itemsByAnimal.set(item.animalName, existing);
              } else {
                generalItems.push(item);
              }
            });

            return (
              <Collapsible key={order.id} open={isExpanded} onOpenChange={() => toggleExpanded(order.id)}>
                <Card className="rounded-3xl shadow-card border-border/50 overflow-hidden">
                  <CardContent className="p-0">
                    {/* Header - always visible */}
                    <CollapsibleTrigger asChild>
                      <button className="w-full p-6 flex items-center gap-4 hover:bg-muted/30 transition-colors text-left">
                        <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                          <Building2 className="h-7 w-7 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg">
                            ZAMÓWIENIE {order.organizationName.toUpperCase()} NR {order.orderNumber}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {order.organizationAddress}, {order.organizationPostalCode} {order.organizationCity}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="bg-blue-500 text-white">{order.totalItems} produktów</Badge>
                            {order.status === 'shipped' ? (
                              <Badge className="bg-green-500 text-white">Wysłane - oczekuje na potwierdzenie</Badge>
                            ) : (
                              <Badge variant="secondary">Zamówione u producenta</Badge>
                            )}
                          </div>
                        </div>
                        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </CollapsibleTrigger>

                    {/* Expandable content */}
                    <CollapsibleContent>
                      <div className="px-6 pb-6 border-t border-border">
                        {/* Product list */}
                        <div className="pt-4 space-y-4">
                          {generalItems.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm text-muted-foreground">Dla organizacji:</h4>
                              <div className="grid gap-2">
                                {generalItems.map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                                    <span className="font-medium">{item.productName}</span>
                                    <Badge variant="outline">{item.quantity} szt</Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {Array.from(itemsByAnimal.entries()).map(([animalName, items]) => (
                            <div key={animalName} className="space-y-2">
                              <h4 className="font-semibold text-sm text-primary flex items-center gap-2">
                                <PawPrint className="h-4 w-4" />
                                {animalName}
                              </h4>
                              <div className="grid gap-2">
                                {items.map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                                    <span className="font-medium">{item.productName}</span>
                                    <Badge variant="outline">{item.quantity} szt</Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Tracking number section */}
                        {order.status === 'ordered' ? (
                          <div className="flex flex-col sm:flex-row gap-3 mt-6 p-4 bg-muted/30 rounded-2xl">
                            <div className="flex-1">
                              <label className="text-sm font-medium text-foreground mb-2 block">
                                Numer listu przewozowego
                              </label>
                              <Input
                                placeholder="Wprowadź numer listu przewozowego..."
                                value={currentTracking}
                                onChange={(e) => handleTrackingChange(order.id, e.target.value)}
                                className="rounded-xl"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <div className="flex items-end">
                              <Button
                                onClick={(e) => { e.stopPropagation(); saveTrackingNumber(order); }}
                                className="rounded-2xl w-full sm:w-auto"
                                disabled={isSaving}
                              >
                                {isSaving ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4 mr-2" />
                                )}
                                Zapisz i oznacz jako wysłane
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                              <Truck className="h-5 w-5" />
                              <span className="font-medium">Wysłane</span>
                            </div>
                            {order.trackingNumber && (
                              <p className="text-sm mt-2">
                                <span className="text-muted-foreground">Numer listu przewozowego: </span>
                                <span className="font-medium">{order.trackingNumber}</span>
                              </p>
                            )}
                          </div>
                        )}

                        {/* Status info */}
                        <div className="text-sm text-muted-foreground mt-4">
                          <Package className="h-4 w-4 inline mr-2" />
                          {order.status === 'shipped' 
                            ? 'Oczekuje na potwierdzenie odbioru przez organizację'
                            : 'Dodaj numer listu przewozowego i oznacz jako wysłane'
                          }
                        </div>
                      </div>
                    </CollapsibleContent>
                  </CardContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      )}
    </div>
  );
}
