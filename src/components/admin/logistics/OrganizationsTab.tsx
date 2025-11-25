import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Printer, Package, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface OrganizationDelivery {
  organizationId: string;
  organizationName: string;
  address: string;
  city: string;
  postalCode: string;
  items: {
    productName: string;
    quantity: number;
    animalName: string;
  }[];
}

export default function OrganizationsTab() {
  const [deliveries, setDeliveries] = useState<OrganizationDelivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingDeliveries();
  }, []);

  const fetchPendingDeliveries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id,
          quantity,
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
        .eq('fulfillment_status', 'pending');

      if (error) throw error;

      // Group by organization
      const grouped = new Map<string, OrganizationDelivery>();

      data?.forEach((item: any) => {
        const animal = item.animals;
        const org = animal.organizations;
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
            items: []
          });
        }

        const delivery = grouped.get(orgId)!;
        delivery.items.push({
          productName: product.name,
          quantity: item.quantity,
          animalName: animal.name
        });
      });

      setDeliveries(Array.from(grouped.values()));
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać dostaw",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 {
              color: #333;
              border-bottom: 3px solid #6366f1;
              padding-bottom: 10px;
            }
            .header {
              margin-bottom: 30px;
            }
            .address {
              background: #f3f4f6;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            th {
              background: #6366f1;
              color: white;
            }
            tr:nth-child(even) {
              background: #f9fafb;
            }
            .animal-name {
              font-weight: bold;
              color: #6366f1;
            }
            @media print {
              body {
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Lista Przewozowa</h1>
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

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (deliveries.length === 0) {
    return (
      <Card className="rounded-3xl shadow-card border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Wszystko zamówione! 🎉
          </h3>
          <p className="text-muted-foreground text-center">
            Nie ma nowych dostaw oczekujących dla organizacji.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {deliveries.map((delivery) => (
        <Card key={delivery.organizationId} className="rounded-3xl shadow-card border-border/50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-lg">{delivery.organizationName}</CardTitle>
                  <CardDescription className="mt-2 text-sm">
                    {delivery.address}<br />
                    {delivery.postalCode} {delivery.city}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Produkt</TableHead>
                    <TableHead className="text-xs text-center">Ilość</TableHead>
                    <TableHead className="text-xs">Dla</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {delivery.items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-xs">{item.productName}</TableCell>
                      <TableCell className="text-xs text-center">
                        <Badge variant="outline" className="text-xs">
                          {item.quantity} szt
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-primary">
                        {item.animalName}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Button
              onClick={() => printPackingSlip(delivery)}
              className="w-full rounded-2xl"
              variant="outline"
            >
              <Printer className="h-4 w-4 mr-2" />
              Drukuj Listę
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
