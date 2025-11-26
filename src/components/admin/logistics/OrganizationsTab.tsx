import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Printer, Package, MapPin, PawPrint, Truck, ChevronDown } from "lucide-react";
import { useState } from "react";

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
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const { data: deliveries, isLoading } = useQuery({
    queryKey: ["logistics-organization-deliveries"],
    queryFn: async () => {
      const { data: paidOrders, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .in('payment_status', ['completed', 'paid']);

      if (ordersError) throw ordersError;
      if (!paidOrders || paidOrders.length === 0) return [];

      const orderIds = paidOrders.map(o => o.id);

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

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

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
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!deliveries || deliveries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <Truck className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Wszystko wysłane!
        </h3>
        <p className="text-muted-foreground max-w-md">
          Nie ma nowych dostaw oczekujących dla organizacji.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {deliveries.map((delivery) => {
        const isOpen = openItems.has(delivery.organizationId);
        
        return (
          <Collapsible
            key={delivery.organizationId}
            open={isOpen}
            onOpenChange={() => toggleItem(delivery.organizationId)}
          >
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-accent" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{delivery.organizationName}</p>
                      <p className="text-sm text-muted-foreground">
                        {delivery.address && `${delivery.address}, `}
                        {delivery.postalCode} {delivery.city}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="rounded-full">
                      <Package className="h-3 w-3 mr-1" />
                      {delivery.totalItems} szt.
                    </Badge>
                    <Badge variant="outline" className="rounded-full text-primary border-primary/30">
                      {delivery.totalValue.toFixed(2)} zł
                    </Badge>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="border-t border-border px-4 pb-4">
                  <div className="divide-y divide-border">
                    {delivery.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-3">
                        <div>
                          <p className="font-medium text-sm">{item.productName}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <PawPrint className="h-3 w-3" />
                            {item.animalName}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {item.quantity} szt
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      printPackingSlip(delivery);
                    }}
                    className="w-full mt-4 rounded-xl"
                    variant="outline"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Drukuj Listę Przewozową
                  </Button>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        );
      })}
    </div>
  );
}