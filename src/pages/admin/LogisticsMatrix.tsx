import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, Package, Truck, AlertCircle, CheckCircle2, Factory } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ProducerOrganizationOrder {
  id: string; // composite key: producerId-organizationId
  producerId: string;
  producerName: string;
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
    orderId: string;
  }[];
  batchOrderIds: string[]; // batch orders involved
}

export default function LogisticsMatrix() {
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState(false);
  const queryClient = useQueryClient();

  const MINIMUM_ORDER_VALUE = 500; // PLN

  const { data: producerOrgOrders = [], isLoading } = useQuery({
    queryKey: ["logistics-matrix-producer-org"],
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

      // Map to store producer-org combinations
      const producerOrgMap = new Map<string, ProducerOrganizationOrder>();

      for (const batch of batches) {
        const org = batch.organizations as any;
        if (!org) continue;

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
            order_id,
            quantity,
            unit_price,
            products (name, producer_id, producers (id, name)),
            animals (name)
          `)
          .in('order_id', orderIds)
          .eq('fulfillment_status', 'pending');

        if (!items || items.length === 0) continue;

        // Group items by producer
        for (const item of items) {
          const product = item.products as any;
          const producer = product?.producers as any;
          
          if (!producer?.id) continue;

          const key = `${producer.id}-${org.id}`;
          
          if (!producerOrgMap.has(key)) {
            producerOrgMap.set(key, {
              id: key,
              producerId: producer.id,
              producerName: producer.name || 'Nieznany producent',
              organizationId: org.id,
              organizationName: org.name,
              organizationAddress: org.address || '',
              organizationCity: org.city || '',
              organizationPostalCode: org.postal_code || '',
              organizationPhone: org.contact_phone || '',
              totalValue: 0,
              itemCount: 0,
              items: [],
              batchOrderIds: [],
            });
          }

          const entry = producerOrgMap.get(key)!;
          entry.totalValue += item.quantity * item.unit_price;
          entry.itemCount += item.quantity;
          entry.items.push({
            id: item.id,
            productName: product?.name || 'N/A',
            quantity: item.quantity,
            animalName: (item.animals as any)?.name || null,
            unitPrice: item.unit_price,
            orderId: item.order_id,
          });

          if (!entry.batchOrderIds.includes(batch.id)) {
            entry.batchOrderIds.push(batch.id);
          }
        }
      }

      return Array.from(producerOrgMap.values()).sort((a, b) => b.totalValue - a.totalValue);
    },
  });

  const totalSelectedValue = producerOrgOrders
    .filter(o => selectedOrders.has(o.id))
    .reduce((sum, o) => sum + o.totalValue, 0);

  const selectedReadyOrders = producerOrgOrders
    .filter(o => selectedOrders.has(o.id) && o.totalValue >= MINIMUM_ORDER_VALUE);

  const toggleOrder = (id: string) => {
    setSelectedOrders(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAllReady = () => {
    const readyIds = producerOrgOrders
      .filter(o => o.totalValue >= MINIMUM_ORDER_VALUE)
      .map(o => o.id);
    setSelectedOrders(new Set(readyIds));
  };

  const deselectAll = () => {
    setSelectedOrders(new Set());
  };

  const handlePlaceOrder = async () => {
    if (selectedReadyOrders.length === 0) return;

    try {
      setProcessing(true);

      for (const order of selectedReadyOrders) {
        // Create shipment record with status 'ordered' (not 'shipped')
        const { data: shipment, error: shipmentError } = await supabase
          .from('shipments')
          .insert({
            organization_id: order.organizationId,
            producer_id: order.producerId,
            status: 'ordered',
            ordered_at: new Date().toISOString(),
            total_value: order.totalValue,
          })
          .select()
          .single();

        if (shipmentError) throw shipmentError;

        // Update order items with shipment_id and status 'ordered'
        const itemIds = order.items.map(item => item.id);
        
        const { error: itemsError } = await supabase
          .from('order_items')
          .update({
            fulfillment_status: 'ordered',
            shipment_id: shipment.id
          })
          .in('id', itemIds);

        if (itemsError) throw itemsError;
      }

      toast({
        title: "Zamówienia złożone",
        description: `Złożono ${selectedReadyOrders.length} zamówień. Przejdź do sekcji "W Realizacji" aby dodać numery przesyłek.`,
      });

      setSelectedOrders(new Set());
      queryClient.invalidateQueries({ queryKey: ["logistics-matrix-producer-org"] });
      queryClient.invalidateQueries({ queryKey: ["admin-logistics-in-progress"] });
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

  const generateProducerCSV = (orders: ProducerOrganizationOrder[]) => {
    const headers = ['Producent', 'Organizacja', 'Ulica', 'Miasto', 'Kod pocztowy', 'Telefon', 'Produkt', 'Ilość'];
    const rows: string[][] = [];

    orders.forEach(order => {
      order.items.forEach(item => {
        rows.push([
          order.producerName,
          order.organizationName,
          order.organizationAddress,
          order.organizationCity,
          order.organizationPostalCode,
          order.organizationPhone,
          item.productName,
          String(item.quantity),
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
    link.download = `zamowienie_producenci_${new Date().toISOString().split('T')[0]}.csv`;
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

  // Group orders by producer for summary
  const producerSummary = producerOrgOrders.reduce((acc, order) => {
    if (!acc[order.producerName]) {
      acc[order.producerName] = { total: 0, ready: 0, count: 0 };
    }
    acc[order.producerName].total += order.totalValue;
    acc[order.producerName].count += 1;
    if (order.totalValue >= MINIMUM_ORDER_VALUE) {
      acc[order.producerName].ready += 1;
    }
    return acc;
  }, {} as Record<string, { total: number; ready: number; count: number }>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl p-6 border border-border/50 shadow-card">
        <h2 className="text-xl font-semibold text-foreground mb-2">Centrum Zamówień</h2>
        <p className="text-muted-foreground">
          Zamówienia grupowane według producenta i organizacji. Minimum {MINIMUM_ORDER_VALUE} zł na kombinację producent + organizacja.
        </p>
      </div>

      {/* Producer summary cards */}
      {Object.keys(producerSummary).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(producerSummary).map(([producer, stats]) => (
            <Card key={producer} className="rounded-2xl border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Factory className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">{producer}</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.ready}/{stats.count} gotowych • {stats.total.toFixed(0)} zł łącznie
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary bar */}
      <Card className="rounded-3xl shadow-card border-border/50">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{selectedReadyOrders.length}</p>
              <p className="text-xs text-muted-foreground">Gotowe do zamówienia</p>
            </div>
            <div className="h-10 w-px bg-border hidden md:block" />
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {totalSelectedValue.toFixed(2)} zł
              </p>
              <p className="text-xs text-muted-foreground">Wartość wybranych</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={selectAllReady} className="rounded-2xl">
              Zaznacz gotowe
            </Button>
            <Button variant="outline" size="sm" onClick={deselectAll} className="rounded-2xl">
              Odznacz
            </Button>
            <Button
              onClick={handlePlaceOrder}
              disabled={selectedReadyOrders.length === 0 || processing}
              className="rounded-2xl"
            >
              {processing ? (
                "Przetwarzanie..."
              ) : (
                <>
                  <Truck className="h-4 w-4 mr-2" />
                  Złóż zamówienia ({selectedReadyOrders.length})
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders list */}
      {producerOrgOrders.length === 0 ? (
        <Card className="rounded-3xl shadow-card border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Brak zamówień do realizacji
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              Nowe zamówienia pojawią się tutaj gdy wpłyną płatności od kupujących.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {producerOrgOrders.map((order) => {
            const isSelected = selectedOrders.has(order.id);
            const meetsThreshold = order.totalValue >= MINIMUM_ORDER_VALUE;
            const missingAmount = MINIMUM_ORDER_VALUE - order.totalValue;

            return (
              <Card 
                key={order.id} 
                className={`rounded-3xl shadow-card border-2 transition-all cursor-pointer ${
                  isSelected && meetsThreshold
                    ? 'border-primary bg-primary/5' 
                    : meetsThreshold
                    ? 'border-green-300 hover:border-green-400'
                    : 'border-border/50 hover:border-border opacity-75'
                }`}
                onClick={() => meetsThreshold && toggleOrder(order.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {meetsThreshold && (
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleOrder(order.id)}
                        className="mt-1"
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      {/* Producer & Organization header */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center">
                            <Factory className="h-4 w-4 text-accent" />
                          </div>
                          <span className="font-bold text-lg">{order.producerName}</span>
                        </div>
                        <span className="text-muted-foreground">→</span>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{order.organizationName}</span>
                        </div>
                      </div>

                      {/* Address */}
                      <p className="text-sm text-muted-foreground mb-3">
                        {order.organizationAddress}, {order.organizationPostalCode} {order.organizationCity}
                      </p>

                      {/* Status badges */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {meetsThreshold ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Gotowe do zamówienia
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Brakuje {missingAmount.toFixed(2)} zł
                          </Badge>
                        )}
                        <Badge variant="outline">
                          <Package className="h-3 w-3 mr-1" />
                          {order.itemCount} produktów
                        </Badge>
                        <Badge variant={meetsThreshold ? "default" : "secondary"}>
                          {order.totalValue.toFixed(2)} zł
                        </Badge>
                      </div>

                      {/* Products list - grouped by recipient */}
                      <div className="mt-4 space-y-3 border-t pt-4">
                        {/* For Organization (items without animal) */}
                        {order.items.some(item => !item.animalName) && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                              Dla organizacji:
                            </p>
                            <ul className="space-y-1">
                              {order.items
                                .filter(item => !item.animalName)
                                .map((item, idx) => (
                                  <li key={idx} className="flex items-center justify-between text-sm">
                                    <span className="text-foreground">{item.productName}</span>
                                    <span className="font-medium text-muted-foreground">x{item.quantity}</span>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}

                        {/* For Animals (items with animal name) */}
                        {order.items.some(item => item.animalName) && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                              Dla podopiecznych:
                            </p>
                            <ul className="space-y-1">
                              {order.items
                                .filter(item => item.animalName)
                                .map((item, idx) => (
                                  <li key={idx} className="flex items-center justify-between text-sm">
                                    <span className="text-foreground">
                                      {item.productName}
                                      <span className="text-muted-foreground ml-1">
                                        → {item.animalName}
                                      </span>
                                    </span>
                                    <span className="font-medium text-muted-foreground">x{item.quantity}</span>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}

                        {/* Summary */}
                        <div className="flex items-center justify-between pt-3 border-t border-dashed text-sm">
                          <span className="text-muted-foreground">
                            Łącznie: <span className="font-semibold text-foreground">{order.itemCount} szt.</span>
                          </span>
                          <span className="font-bold text-primary">
                            {order.totalValue.toFixed(2)} zł
                          </span>
                        </div>
                      </div>
                    </div>
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