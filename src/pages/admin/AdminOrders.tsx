import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Calendar, CreditCard, ChevronDown, Package, User } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { useState } from "react";

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  animalName: string | null;
  organizationName: string | null;
}

interface Order {
  id: string;
  createdAt: string;
  totalAmount: number;
  paymentStatus: string;
  items: OrderItem[];
}

export default function AdminOrders() {
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders-list"],
    queryFn: async () => {
      // Get all completed orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, created_at, total_amount, payment_status')
        .eq('payment_status', 'completed')
        .order('created_at', { ascending: false })
        .limit(100);

      if (ordersError) throw ordersError;
      if (!ordersData) return [];

      const result: Order[] = [];

      for (const order of ordersData) {
        // Get order items with product, animal, and organization info
        const { data: items } = await supabase
          .from('order_items')
          .select(`
            id,
            quantity,
            unit_price,
            products (name),
            animals (name, organization_id, organizations (name))
          `)
          .eq('order_id', order.id);

        result.push({
          id: order.id,
          createdAt: order.created_at,
          totalAmount: order.total_amount,
          paymentStatus: order.payment_status || 'unknown',
          items: (items || []).map((item: any) => ({
            id: item.id,
            productName: item.products?.name || 'N/A',
            quantity: item.quantity,
            unitPrice: item.unit_price,
            animalName: item.animals?.name || null,
            organizationName: item.animals?.organizations?.name || null,
          })),
        });
      }

      return result;
    },
  });

  const toggleOrder = (orderId: string) => {
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

  const todayOrdersCount = orders.filter(o => {
    const orderDate = new Date(o.createdAt);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  }).length;

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl p-6 border border-border/50 shadow-card">
          <h2 className="text-xl font-semibold text-foreground mb-2">Zamówienia</h2>
          <p className="text-muted-foreground">Ładowanie danych...</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl p-6 border border-border/50 shadow-card">
        <h2 className="text-xl font-semibold text-foreground mb-2">Zamówienia</h2>
        <p className="text-muted-foreground">Lista transakcji od darczyńców (płatności online)</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="rounded-2xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{orders.length}</p>
            <p className="text-xs text-muted-foreground">Wszystkie transakcje</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{todayOrdersCount}</p>
            <p className="text-xs text-muted-foreground">Dzisiaj</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{totalRevenue.toFixed(2)} zł</p>
            <p className="text-xs text-muted-foreground">Łączna wartość</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders list */}
      {orders.length === 0 ? (
        <Card className="rounded-3xl shadow-card border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <CreditCard className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Brak zamówień
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              Transakcje od darczyńców pojawią się tutaj po opłaceniu zamówień.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-3xl shadow-card border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Numer</TableHead>
                <TableHead>Produkty</TableHead>
                <TableHead>Kwota</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const isExpanded = expandedOrders.has(order.id);
                
                return (
                  <Collapsible key={order.id} open={isExpanded} onOpenChange={() => toggleOrder(order.id)} asChild>
                    <>
                      <CollapsibleTrigger asChild>
                        <TableRow className="cursor-pointer hover:bg-muted/50">
                          <TableCell>
                            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {format(new Date(order.createdAt), "dd.MM.yyyy HH:mm", { locale: pl })}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            #{order.id.slice(0, 8)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              <Package className="h-3 w-3 mr-1" />
                              {order.items.length}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {order.totalAmount.toFixed(2)} zł
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-700">
                              Opłacone
                            </Badge>
                          </TableCell>
                        </TableRow>
                      </CollapsibleTrigger>
                      <CollapsibleContent asChild>
                        <TableRow>
                          <TableCell colSpan={6} className="bg-muted/30 p-4">
                            <div className="space-y-2">
                              <p className="text-sm font-semibold text-muted-foreground mb-3">Szczegóły zamówienia:</p>
                              {order.items.map((item) => (
                                <div 
                                  key={item.id} 
                                  className="flex items-center justify-between p-3 bg-background rounded-xl border"
                                >
                                  <div className="flex-1">
                                    <p className="font-medium">{item.productName}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {item.organizationName && (
                                        <span>Org: {item.organizationName}</span>
                                      )}
                                      {item.animalName && (
                                        <span> • Zwierzę: {item.animalName}</span>
                                      )}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold">{(item.quantity * item.unitPrice).toFixed(2)} zł</p>
                                    <p className="text-xs text-muted-foreground">
                                      {item.quantity} × {item.unitPrice.toFixed(2)} zł
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      </CollapsibleContent>
                    </>
                  </Collapsible>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
