import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Receipt, User, Search } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  product_id: string;
  products?: {
    id: string;
    name: string;
    image_url?: string;
  };
  animals?: {
    id: string;
    name: string;
    species: string;
    organization_id?: string;
    organizations?: {
      name: string;
    };
  };
}

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  user_id: string | null;
  payment_status: string | null;
  status: string | null;
  order_items: OrderItem[];
  profiles?: {
    display_name: string | null;
  } | null;
}

export default function AdminOrdersDetails() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allTransactions } = useQuery({
    queryKey: ["admin-all-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items(
            *,
            products(id, name, image_url),
            animals(id, name, species, organization_id, organizations(name))
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for each unique user_id
      const userIds = [...new Set((data || []).map(o => o.user_id).filter(Boolean))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.display_name]) || []);

      return (data || []).map(order => ({
        ...order,
        profiles: order.user_id ? { display_name: profileMap.get(order.user_id) || null } : null
      })) as Order[];
    },
  });

  const filteredTransactions = allTransactions?.filter((order) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const buyerName = order.profiles?.display_name?.toLowerCase() || "";
    const orderId = order.id.toLowerCase();
    const orgNames = order.order_items
      .map((item) => item.animals?.organizations?.name?.toLowerCase() || "")
      .join(" ");
    const productNames = order.order_items
      .map((item) => item.products?.name?.toLowerCase() || "")
      .join(" ");
    
    return (
      buyerName.includes(query) ||
      orderId.includes(query) ||
      orgNames.includes(query) ||
      productNames.includes(query)
    );
  });

  const getPaymentStatusBadge = (status: string | null) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-500">Opłacone</Badge>;
      case "pending":
        return <Badge variant="secondary">Oczekuje</Badge>;
      case "failed":
        return <Badge variant="destructive">Nieudane</Badge>;
      default:
        return <Badge variant="outline">{status || "Brak"}</Badge>;
    }
  };

  return (
    <div className="md:px-8 px-4 space-y-6">
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl p-6 border border-border/50 shadow-card">
        <h2 className="text-xl font-semibold text-foreground mb-2">Szczegóły Zamówień</h2>
        <p className="text-muted-foreground">
          Wszystkie transakcje darczyńców - kto, co, kiedy i dla kogo kupił
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Szukaj po nazwie kupującego, organizacji, produktu lub nr zamówienia..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 rounded-2xl"
        />
      </div>

      {/* Transactions Table */}
      <Card className="rounded-3xl shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Nr zamówienia</TableHead>
              <TableHead>Kupujący</TableHead>
              <TableHead>Produkty</TableHead>
              <TableHead>Dla kogo</TableHead>
              <TableHead>Organizacja</TableHead>
              <TableHead>Kwota</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions?.map((order) => {
              const orgName = order.order_items[0]?.animals?.organizations?.name || "—";
              const recipients = [...new Set(order.order_items.map((item) => 
                item.animals?.name || "Fundacja"
              ))].join(", ");
              const products = order.order_items.map((item) => 
                `${item.products?.name} (${item.quantity} szt.)`
              ).join(", ");

              return (
                <TableRow key={order.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(order.created_at), "dd.MM.yyyy HH:mm", { locale: pl })}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {order.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {order.profiles?.display_name || "Gość"}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={products}>
                    {products}
                  </TableCell>
                  <TableCell>
                    {recipients}
                  </TableCell>
                  <TableCell>
                    {orgName}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {order.total_amount.toFixed(2)} zł
                  </TableCell>
                  <TableCell>
                    {getPaymentStatusBadge(order.payment_status)}
                  </TableCell>
                </TableRow>
              );
            })}
            {(!filteredTransactions || filteredTransactions.length === 0) && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Brak transakcji do wyświetlenia</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
