import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Download, Package, CheckCircle2, ChevronDown, ChevronRight, Factory, MapPin, PawPrint, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ProducerOrder {
  producerId: string;
  producerName: string;
  producerEmail: string;
  totalValue: number;
  totalQuantity: number;
  products: {
    productId: string;
    productName: string;
    totalQuantity: number;
    recipients: {
      organizationName: string;
      organizationAddress: string;
      organizationCity: string;
      organizationPostalCode: string;
      animalName: string;
      quantity: number;
    }[];
    itemIds: string[];
  }[];
}

export default function ProducersTab() {
  const [expandedProducers, setExpandedProducers] = useState<Set<string>>(new Set());
  const [processingProducer, setProcessingProducer] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["logistics-producer-orders"],
    queryFn: async () => {
      // First get paid orders
      const { data: paidOrders, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .in('payment_status', ['completed', 'paid']);

      if (ordersError) throw ordersError;
      if (!paidOrders || paidOrders.length === 0) return [];

      const orderIds = paidOrders.map(o => o.id);

      // Then get pending items from those orders
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id,
          quantity,
          unit_price,
          fulfillment_status,
          products!inner (
            id,
            name,
            producer_id,
            producers (
              id,
              name,
              contact_email
            )
          ),
          animals!inner (
            id,
            name,
            organization_id,
            organizations (
              id,
              name,
              address,
              city,
              postal_code
            )
          )
        `)
        .in('order_id', orderIds)
        .eq('fulfillment_status', 'pending');

      if (error) throw error;

      // Group by producer
      const grouped = new Map<string, ProducerOrder>();

      data?.forEach((item: any) => {
        const producer = item.products?.producers;
        const product = item.products;
        const animal = item.animals;
        const org = animal?.organizations;

        if (!producer || !product || !animal || !org) return;

        const producerId = producer.id;
        
        if (!grouped.has(producerId)) {
          grouped.set(producerId, {
            producerId,
            producerName: producer.name,
            producerEmail: producer.contact_email || '',
            totalValue: 0,
            totalQuantity: 0,
            products: []
          });
        }

        const producerOrder = grouped.get(producerId)!;
        producerOrder.totalValue += item.unit_price * item.quantity;
        producerOrder.totalQuantity += item.quantity;

        let productEntry = producerOrder.products.find(p => p.productId === product.id);
        if (!productEntry) {
          productEntry = {
            productId: product.id,
            productName: product.name,
            totalQuantity: 0,
            recipients: [],
            itemIds: []
          };
          producerOrder.products.push(productEntry);
        }

        productEntry.totalQuantity += item.quantity;
        productEntry.itemIds.push(item.id);
        productEntry.recipients.push({
          organizationName: org.name,
          organizationAddress: org.address || '',
          organizationCity: org.city || '',
          organizationPostalCode: org.postal_code || '',
          animalName: animal.name,
          quantity: item.quantity
        });
      });

      return Array.from(grouped.values());
    },
  });

  const toggleExpanded = (producerId: string) => {
    setExpandedProducers(prev => {
      const next = new Set(prev);
      if (next.has(producerId)) {
        next.delete(producerId);
      } else {
        next.add(producerId);
      }
      return next;
    });
  };

  const markAsOrdered = async (producerOrder: ProducerOrder) => {
    try {
      setProcessingProducer(producerOrder.producerId);
      const itemIds = producerOrder.products.flatMap(p => p.itemIds);
      
      const { error } = await supabase
        .from('order_items')
        .update({ fulfillment_status: 'ordered' })
        .in('id', itemIds);

      if (error) throw error;

      toast({
        title: "Sukces",
        description: `Zamówienie dla ${producerOrder.producerName} zostało oznaczone jako zamówione`,
      });

      queryClient.invalidateQueries({ queryKey: ["logistics-producer-orders"] });
      queryClient.invalidateQueries({ queryKey: ["logistics-organization-deliveries"] });
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować zamówienia",
        variant: "destructive"
      });
    } finally {
      setProcessingProducer(null);
    }
  };

  const exportToCSV = (producerOrder: ProducerOrder) => {
    let csv = `Producent: ${producerOrder.producerName}\nEmail: ${producerOrder.producerEmail}\nData: ${new Date().toLocaleDateString('pl-PL')}\n\n`;
    csv += "Produkt,Ilość,Odbiorca,Adres dostawy,Dla zwierzaka\n";

    producerOrder.products.forEach(product => {
      product.recipients.forEach(recipient => {
        const address = `${recipient.organizationAddress} ${recipient.organizationPostalCode} ${recipient.organizationCity}`.trim();
        csv += `"${product.productName}",${recipient.quantity},"${recipient.organizationName}","${address}","${recipient.animalName}"\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `zamowienie_${producerOrder.producerName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <Card key={i} className="rounded-3xl shadow-card">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32 mt-2" />
                </div>
                <Skeleton className="h-10 w-24" />
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card className="rounded-3xl shadow-card border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <Factory className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Wszystko zamówione! 🎉
          </h3>
          <p className="text-muted-foreground text-center max-w-md">
            Nie ma nowych zamówień oczekujących na realizację u producentów. Gdy pojawią się nowe opłacone zamówienia, zobaczysz je tutaj.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const isExpanded = expandedProducers.has(order.producerId);
        const isProcessing = processingProducer === order.producerId;

        return (
          <Collapsible key={order.producerId} open={isExpanded} onOpenChange={() => toggleExpanded(order.producerId)}>
            <Card className="rounded-3xl shadow-card border-border/50 overflow-hidden">
              <CollapsibleTrigger asChild>
                <button className="w-full p-6 flex items-center gap-4 hover:bg-muted/30 transition-colors text-left">
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Factory className="h-7 w-7 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg">{order.producerName}</CardTitle>
                    <CardDescription className="text-sm truncate">
                      {order.producerEmail || 'Brak email'}
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {order.totalValue.toFixed(2)} zł
                      </div>
                      <div className="flex gap-2 mt-1 justify-end">
                        <Badge variant="secondary" className="text-xs">
                          {order.products.length} {order.products.length === 1 ? 'produkt' : 'produktów'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {order.totalQuantity} szt.
                        </Badge>
                      </div>
                    </div>
                  </div>
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0 pb-6 px-6 space-y-4 border-t border-border">
                  <div className="pt-4 space-y-3">
                    {order.products.map((product) => (
                      <div key={product.productId} className="rounded-2xl border border-border bg-muted/20 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-primary" />
                            <span className="font-semibold">{product.productName}</span>
                          </div>
                          <Badge className="bg-primary/10 text-primary border-0">
                            Łącznie: {product.totalQuantity} szt
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          {product.recipients.map((recipient, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-background rounded-xl border border-border/50">
                              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{recipient.organizationName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {recipient.organizationAddress}, {recipient.organizationPostalCode} {recipient.organizationCity}
                                </p>
                                <p className="text-xs text-primary flex items-center gap-1 mt-1">
                                  <PawPrint className="h-3 w-3" />
                                  {recipient.quantity} szt dla {recipient.animalName}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <Button
                      variant="outline"
                      onClick={() => exportToCSV(order)}
                      className="rounded-2xl"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Pobierz CSV
                    </Button>
                    <Button
                      onClick={() => markAsOrdered(order)}
                      className="rounded-2xl"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                      )}
                      Oznacz jako Zamówione
                    </Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}
    </div>
  );
}
