import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Package, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ProducerOrder {
  producerId: string;
  producerName: string;
  producerEmail: string;
  totalValue: number;
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
  const [orders, setOrders] = useState<ProducerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
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
            unit,
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
        .eq('fulfillment_status', 'pending');

      if (error) throw error;

      // Group by producer
      const grouped = new Map<string, ProducerOrder>();

      data?.forEach((item: any) => {
        const producer = item.products.producers;
        const product = item.products;
        const animal = item.animals;
        const org = animal.organizations;

        if (!producer || !product || !animal || !org) return;

        const producerId = producer.id;
        
        if (!grouped.has(producerId)) {
          grouped.set(producerId, {
            producerId,
            producerName: producer.name,
            producerEmail: producer.contact_email || '',
            totalValue: 0,
            products: []
          });
        }

        const producerOrder = grouped.get(producerId)!;
        producerOrder.totalValue += item.unit_price * item.quantity;

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

      setOrders(Array.from(grouped.values()));
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać zamówień",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsOrdered = async (producerOrder: ProducerOrder) => {
    try {
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

      fetchPendingOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować zamówienia",
        variant: "destructive"
      });
    }
  };

  const exportToCSV = (producerOrder: ProducerOrder) => {
    let csv = `Producent: ${producerOrder.producerName}\nEmail: ${producerOrder.producerEmail}\n\n`;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="rounded-3xl shadow-card border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Wszystko zamówione! 🎉
          </h3>
          <p className="text-muted-foreground text-center">
            Nie ma nowych zamówień oczekujących na realizację.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="space-y-4">
        {orders.map((order) => (
          <AccordionItem
            key={order.producerId}
            value={order.producerId}
            className="border-none"
          >
            <Card className="rounded-3xl shadow-card border-border/50 overflow-hidden">
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
                <CardHeader className="p-0 w-full">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-left">
                        <CardTitle className="text-lg">{order.producerName}</CardTitle>
                        <CardDescription className="text-sm">
                          {order.producerEmail}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {order.totalValue.toFixed(2)} zł
                        </div>
                        <Badge variant="secondary" className="mt-1">
                          {order.products.length} produktów
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </AccordionTrigger>

              <AccordionContent>
                <CardContent className="pt-4 space-y-4">
                  <div className="rounded-2xl border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produkt</TableHead>
                          <TableHead className="text-center">Łączna ilość</TableHead>
                          <TableHead>Odbiorcy</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.products.map((product) => (
                          <TableRow key={product.productId}>
                            <TableCell className="font-medium">
                              {product.productName}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline">
                                {product.totalQuantity} szt
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {product.recipients.map((recipient, idx) => (
                                  <div key={idx} className="text-sm">
                                    <span className="font-medium">{recipient.organizationName}</span>
                                    {' - '}
                                    <span className="text-muted-foreground">
                                      {recipient.quantity} szt dla {recipient.animalName}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex gap-2 justify-end">
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
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Oznacz jako Zamówione
                    </Button>
                  </div>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
