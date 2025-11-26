import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Printer, Package, MapPin, PawPrint, Truck } from "lucide-react";

interface OrganizationDelivery {
  organizationId: string;
  organizationName: string;
  address: string;
  city: string;
  postalCode: string;
  totalItems: number;
  totalValue: number;
  items: {
    productName: string;
    quantity: number;
    animalName: string;
    unitPrice: number;
  }[];
}

export default function OrganizationsTab() {
  const { data: deliveries, isLoading } = useQuery({
    queryKey: ["logistics-organization-deliveries"],
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
            name
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

      // Group by organization
      const grouped = new Map<string, OrganizationDelivery>();

      data?.forEach((item: any) => {
        const animal = item.animals;
        const org = animal?.organizations;
        const product = item.products;

        if (!animal || !org || !product) return;

        const orgId = org.id;

        if (!grouped.has(orgId)) {
          grouped.set(orgId, {
            organizationId: orgId,
            organizationName: org.name,
            address: org.address || '',
            city: org.city || '',
            postalCode: org.postal_code || '',
            totalItems: 0,
            totalValue: 0,
            items: []
          });
        }

        const delivery = grouped.get(orgId)!;
        delivery.totalItems += item.quantity;
        delivery.totalValue += item.quantity * item.unit_price;
        delivery.items.push({
          productName: product.name,
          quantity: item.quantity,
          animalName: animal.name,
          unitPrice: item.unit_price
        });
      });

      return Array.from(grouped.values());
    },
  });

  const printPackingSlip = (delivery: OrganizationDelivery) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lista Przewozowa - ${delivery.organizationName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { color: #333; border-bottom: 3px solid #f97316; padding-bottom: 10px; }
            .header { margin-bottom: 30px; }
            .address { background: #fff7ed; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f97316; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background: #f97316; color: white; }
            tr:nth-child(even) { background: #fff7ed; }
            .animal-name { font-weight: bold; color: #ea580c; }
            .total { margin-top: 20px; text-align: right; font-size: 1.2em; font-weight: bold; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🐾 Lista Przewozowa - Paczki w Maśle</h1>
            <p><strong>Data:</strong> ${new Date().toLocaleDateString('pl-PL')}</p>
          </div>
          
          <div class="address">
            <h2>${delivery.organizationName}</h2>
            <p><strong>Adres dostawy:</strong></p>
            <p>${delivery.address}</p>
            <p>${delivery.postalCode} ${delivery.city}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Produkt</th>
                <th>Ilość</th>
                <th>Dla zwierzaka</th>
              </tr>
            </thead>
            <tbody>
              ${delivery.items.map(item => `
                <tr>
                  <td>${item.productName}</td>
                  <td>${item.quantity} szt</td>
                  <td class="animal-name">${item.animalName}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total">
            Łącznie: ${delivery.totalItems} produktów | Wartość: ${delivery.totalValue.toFixed(2)} zł
          </div>

          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Card key={i} className="rounded-3xl shadow-card">
            <CardHeader>
              <Skeleton className="h-12 w-12 rounded-2xl" />
              <Skeleton className="h-5 w-40 mt-2" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full rounded-2xl" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!deliveries || deliveries.length === 0) {
    return (
      <Card className="rounded-3xl shadow-card border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <Truck className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Wszystko wysłane! 🎉
          </h3>
          <p className="text-muted-foreground text-center max-w-md">
            Nie ma nowych dostaw oczekujących dla organizacji. Gdy pojawią się nowe opłacone zamówienia, zobaczysz je tutaj.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {deliveries.map((delivery) => (
        <Card key={delivery.organizationId} className="rounded-3xl shadow-card border-border/50 overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                <MapPin className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg truncate">{delivery.organizationName}</CardTitle>
                <CardDescription className="mt-1 text-sm">
                  {delivery.address && <span>{delivery.address}<br /></span>}
                  {delivery.postalCode} {delivery.city}
                </CardDescription>
              </div>
            </div>
            
            <div className="flex gap-2 mt-3">
              <Badge variant="secondary" className="rounded-full">
                <Package className="h-3 w-3 mr-1" />
                {delivery.totalItems} szt.
              </Badge>
              <Badge variant="outline" className="rounded-full text-primary border-primary/30">
                {delivery.totalValue.toFixed(2)} zł
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border bg-muted/30 divide-y divide-border">
              {delivery.items.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.productName}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <PawPrint className="h-3 w-3" />
                      {item.animalName}
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-2 shrink-0">
                    {item.quantity} szt
                  </Badge>
                </div>
              ))}
            </div>

            <Button
              onClick={() => printPackingSlip(delivery)}
              className="w-full rounded-2xl"
              variant="outline"
            >
              <Printer className="h-4 w-4 mr-2" />
              Drukuj Listę Przewozową
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
