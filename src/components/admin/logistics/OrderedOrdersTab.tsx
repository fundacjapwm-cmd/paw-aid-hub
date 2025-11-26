import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Truck, Building2, Loader2, Save } from "lucide-react";
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
  items: BatchOrderItem[];
  totalItems: number;
  orderNumber: number;
}

export default function OrderedOrdersTab() {
  const [savingTracking, setSavingTracking] = useState<string | null>(null);
  const [trackingNumbers, setTrackingNumbers] = useState<Map<string, string>>(new Map());
  const queryClient = useQueryClient();

  const { data: batchOrders, isLoading } = useQuery({
    queryKey: ["logistics-ordered-batch-orders"],
    queryFn: async () => {
      // Get batch orders with status 'ordered'
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
        .eq('status', 'ordered')
        .order('created_at', { ascending: true });

      if (batchError) throw batchError;
      if (!batches || batches.length === 0) return [];

      const result: OrderedBatchOrder[] = [];
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const org = batch.organizations as any;
        
        // Get orders linked to this batch
        const { data: orders } = await supabase
          .from('orders')
          .select('id')
          .eq('batch_order_id', batch.id)
          .in('payment_status', ['completed', 'paid']);

        if (!orders || orders.length === 0) continue;

        const orderIds = orders.map(o => o.id);

        // Get ordered items
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
          .eq('fulfillment_status', 'ordered');

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
          items: batchItems,
          totalItems: batchItems.reduce((sum, item) => sum + item.quantity, 0),
          orderNumber: i + 1
        });
      }

      return result;
    },
  });

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

      // Update batch order with tracking number and change status to shipped
      const { error: batchError } = await supabase
        .from('organization_batch_orders')
        .update({ 
          tracking_number: tracking.trim(),
          status: 'shipped'
        })
        .eq('id', order.id);

      if (batchError) throw batchError;

      // Get all orders for this batch
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('batch_order_id', order.id);

      if (orders && orders.length > 0) {
        const orderIds = orders.map(o => o.id);

        // Update order items to shipped
        const { error: itemsError } = await supabase
          .from('order_items')
          .update({ fulfillment_status: 'shipped' })
          .in('order_id', orderIds)
          .eq('fulfillment_status', 'ordered');

        if (itemsError) throw itemsError;

        // Update orders with tracking number
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
      <div className="space-y-4">
        {[1, 2].map(i => (
          <Skeleton key={i} className="h-40 w-full rounded-3xl" />
        ))}
      </div>
    );
  }

  if (!batchOrders || batchOrders.length === 0) {
    return (
      <Card className="rounded-3xl shadow-card border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <Truck className="h-10 w-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Brak zamówionych przesyłek
          </h3>
          <p className="text-muted-foreground text-center max-w-md">
            Zamówienia oznaczone jako zamówione pojawią się tutaj. Dodaj numer listu przewozowego, aby śledzić przesyłkę.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {batchOrders.map((order) => {
        const isSaving = savingTracking === order.id;
        const currentTracking = trackingNumbers.get(order.id) ?? order.trackingNumber ?? '';

        return (
          <Card key={order.id} className="rounded-3xl shadow-card border-border/50 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                {/* Order info */}
                <div className="flex items-center gap-4">
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
                      <Badge variant="secondary">Zamówione u producenta</Badge>
                    </div>
                  </div>
                </div>

                {/* Tracking number input */}
                <div className="flex flex-col sm:flex-row gap-3 p-4 bg-muted/30 rounded-2xl">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Numer listu przewozowego
                    </label>
                    <Input
                      placeholder="Wprowadź numer listu przewozowego..."
                      value={currentTracking}
                      onChange={(e) => handleTrackingChange(order.id, e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() => saveTrackingNumber(order)}
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

                {/* Status info */}
                <div className="text-sm text-muted-foreground">
                  <Package className="h-4 w-4 inline mr-2" />
                  Oczekuje na potwierdzenie odbioru przez organizację
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
