import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ArchiveItem {
  id: string;
  quantity: number;
  fulfillmentStatus: string;
  updatedAt: string;
  productName: string;
  organizationName: string;
  animalName: string;
}

export default function ArchiveTab() {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchArchiveItems();
  }, []);

  useEffect(() => {
    let filtered = items;
    
    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(item => item.fulfillmentStatus === statusFilter);
    }
    
    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.productName.toLowerCase().includes(query) ||
          item.organizationName.toLowerCase().includes(query) ||
          item.animalName.toLowerCase().includes(query)
      );
    }
    
    setFilteredItems(filtered);
  }, [searchQuery, statusFilter, items]);

  const fetchArchiveItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id,
          quantity,
          fulfillment_status,
          updated_at,
          products!inner (
            id,
            name
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
        .in('fulfillment_status', ['ordered', 'shipped', 'delivered'])
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const mapped: ArchiveItem[] = data?.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        fulfillmentStatus: item.fulfillment_status,
        updatedAt: item.updated_at,
        productName: item.products?.name || 'N/A',
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
        return <Badge className="bg-blue-500 text-white">Wysłane</Badge>;
      case 'delivered':
        return <Badge className="bg-green-500 text-white">Dostarczone</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj po produkcie lub organizacji..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-2xl"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48 rounded-2xl">
            <SelectValue placeholder="Wszystkie statusy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie statusy</SelectItem>
            <SelectItem value="ordered">Zamówione</SelectItem>
            <SelectItem value="shipped">Wysłane</SelectItem>
            <SelectItem value="delivered">Dostarczone</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredItems.length === 0 ? (
        <Card className="rounded-3xl border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchQuery ? "Brak wyników" : "Puste archiwum"}
            </h3>
            <p className="text-muted-foreground text-center">
              {searchQuery
                ? "Nie znaleziono zamówień pasujących do zapytania"
                : "Zrealizowane zamówienia pojawią się tutaj"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="rounded-3xl shadow-card border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Produkt</TableHead>
                  <TableHead className="text-center">Ilość</TableHead>
                  <TableHead>Organizacja</TableHead>
                  <TableHead>Zwierzak</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {new Date(item.updatedAt).toLocaleDateString('pl-PL', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{item.quantity} szt</Badge>
                    </TableCell>
                    <TableCell>{item.organizationName}</TableCell>
                    <TableCell className="text-primary font-medium">
                      {item.animalName}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(item.fulfillmentStatus)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <Card className="rounded-3xl shadow-card border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {filteredItems.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Pozycji</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">
                    {filteredItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Jednostek</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
