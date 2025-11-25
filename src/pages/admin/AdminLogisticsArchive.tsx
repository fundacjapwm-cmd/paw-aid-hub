import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ArchiveItem {
  id: string;
  quantity: number;
  unitPrice: number;
  fulfillmentStatus: string;
  updatedAt: string;
  productName: string;
  unit: string;
  organizationName: string;
  animalName: string;
}

export default function AdminLogisticsArchive() {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchArchiveItems();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredItems(items);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = items.filter(
        item =>
          item.productName.toLowerCase().includes(query) ||
          item.organizationName.toLowerCase().includes(query) ||
          item.animalName.toLowerCase().includes(query)
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery, items]);

  const fetchArchiveItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id,
          quantity,
          unit_price,
          fulfillment_status,
          updated_at,
          products!inner (
            id,
            name,
            unit
          ),
          animals!inner (
            id,
            name,
            organizations (
              id,
              name
            )
          )
        `)
        .in('fulfillment_status', ['ordered', 'shipped'])
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const mapped: ArchiveItem[] = data?.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        fulfillmentStatus: item.fulfillment_status,
        updatedAt: item.updated_at,
        productName: item.products?.name || 'N/A',
        unit: item.products?.unit || 'szt',
        organizationName: item.animals?.organizations?.name || 'N/A',
        animalName: item.animals?.name || 'N/A'
      })) || [];

      setItems(mapped);
      setFilteredItems(mapped);
    } catch (error) {
      console.error('Error fetching archive:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać archiwum",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ordered':
        return <Badge variant="secondary">Zamówione</Badge>;
      case 'shipped':
        return <Badge className="bg-green-500 text-white">Wysłane</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="md:px-8 px-4 space-y-6">
      <Card className="rounded-3xl shadow-card border-border/50">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Archiwum Logistyki</CardTitle>
              <p className="text-muted-foreground mt-1">
                Historia zrealizowanych zamówień zbiorczych
              </p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Szukaj po produkcie lub organizacji..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-2xl"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {searchQuery ? "Brak wyników" : "Puste archiwum"}
              </h3>
              <p className="text-muted-foreground text-center">
                {searchQuery
                  ? "Nie znaleziono zamówień pasujących do zapytania"
                  : "Zrealizowane zamówienia pojawią się tutaj"}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data Realizacji</TableHead>
                    <TableHead>Produkt</TableHead>
                    <TableHead className="text-center">Ilość</TableHead>
                    <TableHead>Organizacja</TableHead>
                    <TableHead>Dla Zwierzaka</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Wartość</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {new Date(item.updatedAt).toLocaleDateString('pl-PL', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">
                          {item.quantity} {item.unit}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.organizationName}</TableCell>
                      <TableCell className="text-primary font-medium">
                        {item.animalName}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(item.fulfillmentStatus)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {(item.unitPrice * item.quantity).toFixed(2)} zł
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {filteredItems.length > 0 && (
        <Card className="rounded-3xl shadow-card border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {filteredItems.length}
                </div>
                <div className="text-sm text-muted-foreground">Pozycji ogółem</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">
                  {filteredItems.reduce((sum, item) => sum + item.quantity, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Jednostek łącznie</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {filteredItems
                    .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
                    .toFixed(2)} zł
                </div>
                <div className="text-sm text-muted-foreground">Łączna wartość</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
