import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FileText, Truck, CheckCircle2, Package, Building2, Loader2, ChevronDown, PawPrint, FileDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BatchOrderItem {
  id: string;
  productName: string;
  quantity: number;
  animalName: string | null;
}

interface BatchOrder {
  id: string;
  organizationId: string;
  organizationName: string;
  organizationAddress: string;
  organizationCity: string;
  organizationPostalCode: string;
  organizationPhone: string;
  createdAt: string;
  items: BatchOrderItem[];
  totalItems: number;
  orderNumber: number;
}

export default function AdminLogisticsPending() {
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { data: batchOrders, isLoading } = useQuery({
    queryKey: ["logistics-pending-batch-orders"],
    queryFn: async () => {
      const { data: batches, error: batchError } = await supabase
        .from('organization_batch_orders')
        .select(`
          id,
          organization_id,
          created_at,
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
        .in('status', ['collecting', 'processing'])
        .order('created_at', { ascending: true });

      if (batchError) throw batchError;
      if (!batches || batches.length === 0) return [];

      const result: BatchOrder[] = [];
      
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
          .eq('fulfillment_status', 'pending');

        if (!items || items.length === 0) continue;

        const batchItems: BatchOrderItem[] = items.map((item: any) => ({
          id: item.id,
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
          organizationPhone: org?.contact_phone || '',
          createdAt: batch.created_at,
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

  const generateProducerOrderPDF = (order: BatchOrder) => {
    const productTotals = new Map<string, number>();
    order.items.forEach(item => {
      const current = productTotals.get(item.productName) || 0;
      productTotals.set(item.productName, current + item.quantity);
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Zamówienie ${order.organizationName} NR ${order.orderNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { color: #333; border-bottom: 3px solid #f97316; padding-bottom: 10px; font-size: 24px; }
            .header { margin-bottom: 30px; }
            .order-info { background: #fff7ed; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f97316; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background: #f97316; color: white; }
            tr:nth-child(even) { background: #fff7ed; }
            .total { margin-top: 20px; text-align: right; font-size: 1.2em; font-weight: bold; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; font-size: 12px; color: #666; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ZAMÓWIENIE ${order.organizationName.toUpperCase()} NR ${order.orderNumber}</h1>
            <p><strong>Data:</strong> ${new Date().toLocaleDateString('pl-PL')}</p>
          </div>
          
          <div class="order-info">
            <p><strong>Adres dostawy:</strong></p>
            <p>${order.organizationName}</p>
            <p>${order.organizationAddress}</p>
            <p>${order.organizationPostalCode} ${order.organizationCity}</p>
          </div>

          <h2>Lista produktów do zamówienia:</h2>
          <table>
            <thead>
              <tr>
                <th>Lp.</th>
                <th>Produkt</th>
                <th>Ilość</th>
              </tr>
            </thead>
            <tbody>
              ${Array.from(productTotals.entries()).map(([name, qty], idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${name}</td>
                  <td><strong>${qty} szt</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total">
            Łącznie: ${order.totalItems} produktów
          </div>

          <div class="footer">
            <p>Dokument wygenerowany automatycznie przez system Paczki w Maśle</p>
          </div>

          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const generateOrganizationListPDF = (order: BatchOrder) => {
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

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lista dla ${order.organizationName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { color: #333; border-bottom: 3px solid #f97316; padding-bottom: 10px; font-size: 24px; }
            h2 { color: #ea580c; margin-top: 30px; font-size: 18px; }
            .header { margin-bottom: 30px; }
            .org-info { background: #fff7ed; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f97316; }
            .animal-section { margin-bottom: 25px; padding: 15px; background: #fafafa; border-radius: 8px; border: 1px solid #eee; }
            .animal-name { font-weight: bold; color: #ea580c; font-size: 16px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
            .animal-name::before { content: '🐾'; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background: #f97316; color: white; }
            tr:nth-child(even) { background: #fff7ed; }
            .total { margin-top: 20px; text-align: right; font-size: 1.2em; font-weight: bold; }
            .checkbox { width: 20px; height: 20px; border: 2px solid #ddd; display: inline-block; margin-right: 10px; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; font-size: 12px; color: #666; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🐾 LISTA DLA ORGANIZACJI</h1>
            <p><strong>Data:</strong> ${new Date().toLocaleDateString('pl-PL')}</p>
          </div>
          
          <div class="org-info">
            <h2 style="margin: 0 0 10px 0; color: #333;">${order.organizationName}</h2>
            <p>${order.organizationAddress}</p>
            <p>${order.organizationPostalCode} ${order.organizationCity}</p>
          </div>

          ${generalItems.length > 0 ? `
            <div class="animal-section">
              <div class="animal-name" style="color: #333;">Dla organizacji</div>
              <table>
                <thead>
                  <tr>
                    <th style="width: 40px;">✓</th>
                    <th>Produkt</th>
                    <th style="width: 80px;">Ilość</th>
                  </tr>
                </thead>
                <tbody>
                  ${generalItems.map(item => `
                    <tr>
                      <td><span class="checkbox"></span></td>
                      <td>${item.productName}</td>
                      <td>${item.quantity} szt</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}

          ${Array.from(itemsByAnimal.entries()).map(([animalName, items]) => `
            <div class="animal-section">
              <div class="animal-name">${animalName}</div>
              <table>
                <thead>
                  <tr>
                    <th style="width: 40px;">✓</th>
                    <th>Produkt</th>
                    <th style="width: 80px;">Ilość</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map(item => `
                    <tr>
                      <td><span class="checkbox"></span></td>
                      <td>${item.productName}</td>
                      <td>${item.quantity} szt</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `).join('')}

          <div class="total">
            Łącznie: ${order.totalItems} produktów
          </div>

          <div class="footer">
            <p>Po otrzymaniu paczki, prosimy o potwierdzenie odbioru w panelu organizacji.</p>
            <p>Dokument wygenerowany automatycznie przez system Paczki w Maśle</p>
          </div>

          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const generateCSV = (order: BatchOrder) => {
    // Create CSV content for producer/warehouse
    const productTotals = new Map<string, number>();
    order.items.forEach(item => {
      const current = productTotals.get(item.productName) || 0;
      productTotals.set(item.productName, current + item.quantity);
    });

    const headers = ['Nazwa Organizacji', 'Ulica', 'Miasto', 'Kod pocztowy', 'Telefon', 'Produkt', 'Ilość'];
    const rows: string[][] = [];

    Array.from(productTotals.entries()).forEach(([productName, qty]) => {
      rows.push([
        order.organizationName,
        order.organizationAddress,
        order.organizationCity,
        order.organizationPostalCode,
        order.organizationPhone,
        productName,
        String(qty)
      ]);
    });

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n');

    // Download CSV
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `zamowienie_${order.organizationName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "CSV wygenerowany",
      description: "Plik CSV został pobrany",
    });
  };

  const markAsOrdered = async (order: BatchOrder) => {
    try {
      setProcessingOrder(order.id);

      // 1. Create shipment record with status 'ordered' (not shipped yet)
      const { data: shipment, error: shipmentError } = await supabase
        .from('shipments')
        .insert({
          organization_id: order.organizationId,
          status: 'ordered',
          ordered_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (shipmentError) {
        console.error('Shipment creation error:', shipmentError);
        throw shipmentError;
      }

      // 2. Get order item IDs
      const itemIds = order.items.map(item => item.id);
      console.log('Updating order_items:', itemIds, 'with shipment_id:', shipment.id);

      // 3. Update order items - set fulfillment_status and shipment_id
      // Use individual updates to ensure each item gets updated
      for (const itemId of itemIds) {
        const { error: itemError } = await supabase
          .from('order_items')
          .update({ 
            fulfillment_status: 'ordered',
            shipment_id: shipment.id 
          })
          .eq('id', itemId);

        if (itemError) {
          console.error('Error updating item', itemId, itemError);
        }
      }

      // 4. Update batch order status
      const { error: batchError } = await supabase
        .from('organization_batch_orders')
        .update({ status: 'ordered' })
        .eq('id', order.id);

      if (batchError) throw batchError;

      // 5. Generate CSV automatically
      generateCSV(order);

      toast({
        title: "Sukces",
        description: `Zamówienie dla ${order.organizationName} zostało złożone. Dostawa została utworzona.`,
      });

      queryClient.invalidateQueries({ queryKey: ["logistics-pending-batch-orders"] });
      queryClient.invalidateQueries({ queryKey: ["logistics-ordered-batch-orders"] });
    } catch (error) {
      console.error('Error marking as ordered:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się złożyć zamówienia",
        variant: "destructive"
      });
    } finally {
      setProcessingOrder(null);
    }
  };

  if (isLoading) {
    return (
      <div className="md:px-8 px-4 space-y-6">
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl p-6 border border-border/50 shadow-card">
          <h2 className="text-xl font-semibold text-foreground mb-2">Oczekujące na zamówienie</h2>
          <p className="text-muted-foreground">Zamówienia do realizacji u producenta</p>
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
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl p-6 border border-border/50 shadow-card">
        <h2 className="text-xl font-semibold text-foreground mb-2">Oczekujące na zamówienie</h2>
        <p className="text-muted-foreground">Zamówienia do realizacji u producenta</p>
      </div>

      {!batchOrders || batchOrders.length === 0 ? (
        <Card className="rounded-3xl shadow-card border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Package className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Brak oczekujących zamówień
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              Zamówienia przeniesione do realizacji pojawią się tutaj.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {batchOrders.map((order) => {
            const isProcessing = processingOrder === order.id;
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
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Building2 className="h-7 w-7 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg">
                            ZAMÓWIENIE {order.organizationName.toUpperCase()} NR {order.orderNumber}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {order.organizationAddress}, {order.organizationPostalCode} {order.organizationCity}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{order.totalItems} produktów</Badge>
                            <Badge variant="outline">{order.items.length} pozycji</Badge>
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

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-2 mt-6 pt-4 border-t border-border">
                          <Button
                            variant="outline"
                            onClick={(e) => { e.stopPropagation(); generateProducerOrderPDF(order); }}
                            className="rounded-2xl flex-1"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Zamówienie dla producenta
                          </Button>
                          <Button
                            variant="outline"
                            onClick={(e) => { e.stopPropagation(); generateOrganizationListPDF(order); }}
                            className="rounded-2xl flex-1"
                          >
                            <Truck className="h-4 w-4 mr-2" />
                            Lista dla organizacji
                          </Button>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 mt-2">
                          <Button
                            variant="outline"
                            onClick={(e) => { e.stopPropagation(); generateCSV(order); }}
                            className="rounded-2xl flex-1"
                          >
                            <FileDown className="h-4 w-4 mr-2" />
                            Eksportuj CSV
                          </Button>
                          <Button
                            onClick={(e) => { e.stopPropagation(); markAsOrdered(order); }}
                            className="rounded-2xl flex-1"
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                            )}
                            Złóż zamówienie
                          </Button>
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
