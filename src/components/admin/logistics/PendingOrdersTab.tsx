import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Truck, CheckCircle2, Package, Building2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BatchOrderItem {
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
  createdAt: string;
  items: BatchOrderItem[];
  totalItems: number;
  orderNumber: number;
}

export default function PendingOrdersTab() {
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: batchOrders, isLoading } = useQuery({
    queryKey: ["logistics-pending-batch-orders"],
    queryFn: async () => {
      // Get batch orders with status 'collecting' that have been moved to realization
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
            postal_code
          )
        `)
        .eq('status', 'collecting')
        .order('created_at', { ascending: true });

      if (batchError) throw batchError;
      if (!batches || batches.length === 0) return [];

      // Get order items for each batch
      const result: BatchOrder[] = [];
      
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

        // Get pending order items
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
          items: batchItems,
          totalItems: batchItems.reduce((sum, item) => sum + item.quantity, 0),
          orderNumber: i + 1
        });
      }

      return result;
    },
  });

  const generateProducerOrderPDF = (order: BatchOrder) => {
    // Group items by product for consolidated order
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
    // Group items by animal
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

  const markAsOrdered = async (order: BatchOrder) => {
    try {
      setProcessingOrder(order.id);

      // Get all orders for this batch
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('batch_order_id', order.id);

      if (!orders || orders.length === 0) throw new Error('No orders found');

      const orderIds = orders.map(o => o.id);

      // Update all pending order items to ordered
      const { error: itemsError } = await supabase
        .from('order_items')
        .update({ fulfillment_status: 'ordered' })
        .in('order_id', orderIds)
        .eq('fulfillment_status', 'pending');

      if (itemsError) throw itemsError;

      // Update batch order status
      const { error: batchError } = await supabase
        .from('organization_batch_orders')
        .update({ status: 'ordered' })
        .eq('id', order.id);

      if (batchError) throw batchError;

      toast({
        title: "Sukces",
        description: `Zamówienie dla ${order.organizationName} zostało oznaczone jako zamówione`,
      });

      queryClient.invalidateQueries({ queryKey: ["logistics-pending-batch-orders"] });
      queryClient.invalidateQueries({ queryKey: ["logistics-ordered-batch-orders"] });
    } catch (error) {
      console.error('Error marking as ordered:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować zamówienia",
        variant: "destructive"
      });
    } finally {
      setProcessingOrder(null);
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
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <Package className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Brak oczekujących zamówień
          </h3>
          <p className="text-muted-foreground text-center max-w-md">
            Zamówienia przeniesione do realizacji pojawią się tutaj. Możesz je zamówić u producenta i wygenerować dokumenty.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {batchOrders.map((order) => {
        const isProcessing = processingOrder === order.id;

        return (
          <Card key={order.id} className="rounded-3xl shadow-card border-border/50 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Order info */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="h-7 w-7 text-primary" />
                  </div>
                  <div className="min-w-0">
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
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => generateProducerOrderPDF(order)}
                    className="rounded-2xl"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Zamówienie dla producenta
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => generateOrganizationListPDF(order)}
                    className="rounded-2xl"
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Lista dla organizacji
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
                    Zaznacz jako zamówione
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
