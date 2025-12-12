import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, Package, FileDown, Truck, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface OrganizationOrder {
  id: string;
  organizationId: string;
  organizationName: string;
  organizationAddress: string;
  organizationCity: string;
  organizationPostalCode: string;
  organizationPhone: string;
  totalValue: number;
  itemCount: number;
  items: {
    id: string;
    productName: string;
    quantity: number;
    animalName: string | null;
    unitPrice: number;
    producerName: string | null;
    producerId: string | null;
  }[];
}

export default function LogisticsMatrix() {
  const [selectedOrgs, setSelectedOrgs] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState(false);
  const queryClient = useQueryClient();

  const MINIMUM_ORDER_VALUE = 500; // PLN

  const { data: organizationOrders = [], isLoading } = useQuery({
    queryKey: ["logistics-matrix-orders"],
    queryFn: async () => {
      // Get all batch orders in collecting/processing status
      const { data: batches, error: batchError } = await supabase
        .from('organization_batch_orders')
        .select(`
          id,
          organization_id,
          status,
          organizations (
            id,
            name,
            address,
            city,
            postal_code,
            contact_phone
          )
        `)
        .in('status', ['collecting', 'processing']);

      if (batchError) throw batchError;
      if (!batches || batches.length === 0) return [];

      const result: OrganizationOrder[] = [];

      for (const batch of batches) {
        const org = batch.organizations as any;

        // Get orders for this batch
        const { data: orders } = await supabase
          .from('orders')
          .select('id')
          .eq('batch_order_id', batch.id)
          .in('payment_status', ['completed', 'paid']);

        if (!orders || orders.length === 0) continue;

        const orderIds = orders.map(o => o.id);

        // Get order items with producer info
        const { data: items } = await supabase
          .from('order_items')
          .select(`
            id,
            quantity,
            unit_price,
            products (name, producer_id, producers (name)),
            animals (name)
          `)
          .in('order_id', orderIds)
          .eq('fulfillment_status', 'pending');

        if (!items || items.length === 0) continue;

        const totalValue = items.reduce((sum: number, item: any) => 
          sum + (item.quantity * item.unit_price), 0
        );

        result.push({
          id: batch.id,
          organizationId: org?.id || '',
          organizationName: org?.name || 'N/A',
          organizationAddress: org?.address || '',
          organizationCity: org?.city || '',
          organizationPostalCode: org?.postal_code || '',
          organizationPhone: org?.contact_phone || '',
          totalValue,
          itemCount: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
          items: items.map((item: any) => ({
            id: item.id,
            productName: item.products?.name || 'N/A',
            quantity: item.quantity,
            animalName: item.animals?.name || null,
            unitPrice: item.unit_price,
            producerName: item.products?.producers?.name || null,
            producerId: item.products?.producer_id || null,
          }))
        });
      }

      return result.sort((a, b) => b.totalValue - a.totalValue);
    },
  });

  const totalSelectedValue = organizationOrders
    .filter(o => selectedOrgs.has(o.id))
    .reduce((sum, o) => sum + o.totalValue, 0);

  const canPlaceOrder = totalSelectedValue >= MINIMUM_ORDER_VALUE;

  const toggleOrganization = (id: string) => {
    setSelectedOrgs(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedOrgs(new Set(organizationOrders.map(o => o.id)));
  };

  const deselectAll = () => {
    setSelectedOrgs(new Set());
  };

  const handlePlaceOrder = async () => {
    if (!canPlaceOrder || selectedOrgs.size === 0) return;

    try {
      setProcessing(true);

      const selectedBatches = organizationOrders.filter(o => selectedOrgs.has(o.id));

      for (const batch of selectedBatches) {
        // Create shipment record
        const { data: shipment, error: shipmentError } = await supabase
          .from('shipments')
          .insert({
            organization_id: batch.organizationId,
            status: 'shipped',
            shipped_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (shipmentError) throw shipmentError;

        // Update order items with shipment_id
        const itemIds = batch.items.map(item => item.id);
        
        const { error: itemsError } = await supabase
          .from('order_items')
          .update({
            fulfillment_status: 'ordered',
            shipment_id: shipment.id
          })
          .in('id', itemIds);

        if (itemsError) throw itemsError;

        // Update batch order status
        const { error: batchError } = await supabase
          .from('organization_batch_orders')
          .update({ status: 'ordered' })
          .eq('id', batch.id);

        if (batchError) throw batchError;
      }

      // Generate combined CSV
      generateCombinedCSV(selectedBatches);

      toast({
        title: "Zamówienie złożone",
        description: `Złożono zamówienie dla ${selectedBatches.length} organizacji na kwotę ${totalSelectedValue.toFixed(2)} zł`,
      });

      setSelectedOrgs(new Set());
      queryClient.invalidateQueries({ queryKey: ["logistics-matrix-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-deliveries"] });
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się złożyć zamówienia",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const generateCombinedCSV = (batches: OrganizationOrder[]) => {
    const headers = ['Organizacja', 'Ulica', 'Miasto', 'Kod pocztowy', 'Telefon', 'Produkt', 'Ilość', 'Wartość'];
    const rows: string[][] = [];

    batches.forEach(batch => {
      batch.items.forEach(item => {
        rows.push([
          batch.organizationName,
          batch.organizationAddress,
          batch.organizationCity,
          batch.organizationPostalCode,
          batch.organizationPhone,
          item.productName,
          String(item.quantity),
          (item.quantity * item.unitPrice).toFixed(2)
        ]);
      });
    });

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `zamowienie_zbiorcze_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl p-6 border border-border/50 shadow-card">
          <h2 className="text-xl font-semibold text-foreground mb-2">Centrum Zamówień</h2>
          <p className="text-muted-foreground">Ładowanie danych...</p>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl p-6 border border-border/50 shadow-card">
        <h2 className="text-xl font-semibold text-foreground mb-2">Centrum Zamówień</h2>
        <p className="text-muted-foreground">Wybierz organizacje do zbiorczego zamówienia (min. {MINIMUM_ORDER_VALUE} zł)</p>
      </div>

      {/* Summary bar */}
      <Card className="rounded-3xl shadow-card border-border/50">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{selectedOrgs.size}</p>
              <p className="text-xs text-muted-foreground">Wybrano</p>
            </div>
            <div className="h-10 w-px bg-border hidden md:block" />
            <div className="text-center">
              <p className={`text-2xl font-bold ${canPlaceOrder ? 'text-green-600' : 'text-amber-500'}`}>
                {totalSelectedValue.toFixed(2)} zł
              </p>
              <p className="text-xs text-muted-foreground">Wartość zamówienia</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={selectAll} className="rounded-2xl">
              Zaznacz wszystko
            </Button>
            <Button variant="outline" size="sm" onClick={deselectAll} className="rounded-2xl">
              Odznacz
            </Button>
            <Button
              onClick={handlePlaceOrder}
              disabled={!canPlaceOrder || processing || selectedOrgs.size === 0}
              className="rounded-2xl"
            >
              {processing ? (
                "Przetwarzanie..."
              ) : (
                <>
                  <Truck className="h-4 w-4 mr-2" />
                  Złóż zamówienie
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Minimum threshold warning */}
      {selectedOrgs.size > 0 && !canPlaceOrder && (
        <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700">
          <AlertCircle className="h-5 w-5" />
          <span>Minimalna wartość zamówienia to {MINIMUM_ORDER_VALUE} zł. Brakuje: {(MINIMUM_ORDER_VALUE - totalSelectedValue).toFixed(2)} zł</span>
        </div>
      )}

      {/* Organizations list */}
      {organizationOrders.length === 0 ? (
        <Card className="rounded-3xl shadow-card border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Brak zamówień do realizacji
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              Nowe zamówienia pojawią się tutaj gdy wpłyną płatności od darczyńców.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {organizationOrders.map((order) => {
            const isSelected = selectedOrgs.has(order.id);
            const meetsThreshold = order.totalValue >= MINIMUM_ORDER_VALUE;

            return (
              <Card 
                key={order.id} 
                className={`rounded-3xl shadow-card border-2 transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border/50 hover:border-border'
                }`}
                onClick={() => toggleOrganization(order.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleOrganization(order.id)}
                      className="mt-1"
                    />
                    
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{order.organizationName}</h3>
                        {meetsThreshold && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            Gotowe do zamówienia
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {order.organizationAddress}, {order.organizationPostalCode} {order.organizationCity}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                          <Package className="h-3 w-3 mr-1" />
                          {order.itemCount} produktów
                        </Badge>
                        <Badge variant={meetsThreshold ? "default" : "secondary"}>
                          {order.totalValue.toFixed(2)} zł
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Items preview grouped by producer */}
                  <div className="mt-4 pl-16">
                    {/* Group items by producer */}
                    {(() => {
                      const groupedByProducer = order.items.reduce((acc, item) => {
                        const producer = item.producerName || 'Nieznany producent';
                        if (!acc[producer]) acc[producer] = [];
                        acc[producer].push(item);
                        return acc;
                      }, {} as Record<string, typeof order.items>);

                      return Object.entries(groupedByProducer).map(([producer, items]) => (
                        <div key={producer} className="mb-3">
                          <p className="text-sm font-medium text-primary mb-1">{producer}:</p>
                          <div className="flex flex-wrap gap-1">
                            {items.slice(0, 5).map((item, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {item.productName} x{item.quantity}
                              </Badge>
                            ))}
                            {items.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{items.length - 5} więcej
                              </Badge>
                            )}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
