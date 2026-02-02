import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Receipt, User, Search, ChevronDown, ChevronRight, Package, PawPrint, Building2, Filter, Mail } from "lucide-react";
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
  customer_name: string | null;
  customer_email: string | null;
  order_items: OrderItem[];
  profiles?: {
    display_name: string | null;
  } | null;
}

export default function AdminOrdersDetails() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>("paid");

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
        // Only show orders that initiated payment (have payment_method set)
        .not("payment_method", "is", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for each unique user_id
      const userIds = [...new Set((data || []).map(o => o.user_id).filter(Boolean))];
      const { data: profiles } = userIds.length > 0 
        ? await supabase.from("profiles").select("id, display_name").in("id", userIds)
        : { data: [] };

      const profileMap = new Map<string, string | null>();
      profiles?.forEach(p => profileMap.set(p.id, p.display_name));

      return (data || []).map(order => ({
        ...order,
        profiles: order.user_id ? { display_name: profileMap.get(order.user_id) || null } : null
      })) as Order[];
    },
  });

  const filteredTransactions = allTransactions?.filter((order) => {
    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "paid" && order.payment_status !== "completed" && order.payment_status !== "paid") {
        return false;
      }
      if (statusFilter === "pending" && order.payment_status !== "pending") {
        return false;
      }
      if (statusFilter === "failed" && order.payment_status !== "failed") {
        return false;
      }
    }
    
    // Search filter
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
      case "paid":
        return <Badge variant="default" className="bg-green-500">Opłacone</Badge>;
      case "pending":
        return <Badge variant="secondary">Oczekuje</Badge>;
      case "failed":
        return <Badge variant="destructive">Nieudane</Badge>;
      default:
        return <Badge variant="outline">{status || "Brak"}</Badge>;
    }
  };

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

  return (
    <div className="md:px-8 px-4 space-y-6">
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl p-6 border border-border/50 shadow-card">
        <h2 className="text-xl font-semibold text-foreground mb-2">Szczegóły Zamówień</h2>
        <p className="text-muted-foreground">
          Wszystkie transakcje kupujących - kliknij wiersz aby zobaczyć szczegóły
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj po nazwie kupującego, organizacji, produktu lub nr zamówienia..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-2xl"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[200px] rounded-2xl">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status płatności" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie</SelectItem>
            <SelectItem value="paid">Opłacone</SelectItem>
            <SelectItem value="pending">Oczekujące</SelectItem>
            <SelectItem value="failed">Nieudane</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredTransactions?.map((order) => {
          const isExpanded = expandedOrders.has(order.id);
          const orgName = order.order_items[0]?.animals?.organizations?.name || "—";
          const itemCount = order.order_items.reduce((sum, item) => sum + item.quantity, 0);

          return (
            <Collapsible key={order.id} open={isExpanded} onOpenChange={() => toggleExpanded(order.id)}>
              <Card className="rounded-2xl shadow-card overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button className="w-full p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors text-left">
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-4 items-center">
                      <div className="text-sm">
                        <p className="text-muted-foreground text-xs">Data</p>
                        <p className="font-medium">
                          {format(new Date(order.created_at), "dd.MM.yyyy HH:mm", { locale: pl })}
                        </p>
                      </div>
                      
                      <div className="text-sm">
                        <p className="text-muted-foreground text-xs">Nr zamówienia</p>
                        <p className="font-mono text-xs">{order.id.slice(0, 8)}</p>
                      </div>
                      
                      <div className="text-sm col-span-2 md:col-span-1">
                        <p className="text-muted-foreground text-xs">Kupujący</p>
                        <p className="flex items-center gap-1 font-medium">
                          <User className="h-3 w-3 text-muted-foreground" />
                          {order.customer_name || order.profiles?.display_name || "Gość"}
                        </p>
                        {order.customer_email && (
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                            {order.customer_email}
                          </p>
                        )}
                      </div>
                      
                      <div className="text-sm">
                        <p className="text-muted-foreground text-xs">Organizacja</p>
                        <p>{orgName}</p>
                      </div>
                      
                      <div className="text-sm">
                        <p className="text-muted-foreground text-xs">Kwota</p>
                        <p className="font-semibold text-primary">{order.total_amount.toFixed(2)} zł</p>
                      </div>
                      
                      <div className="text-sm flex items-center gap-2">
                        {getPaymentStatusBadge(order.payment_status)}
                        <Badge variant="outline" className="text-xs">
                          {itemCount} szt.
                        </Badge>
                      </div>
                    </div>
                  </button>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="border-t border-border p-4 bg-muted/20">
                    {/* Donor info section */}
                    {(order.customer_name || order.customer_email) && (
                      <div className="mb-4 p-3 bg-primary/5 rounded-xl border border-primary/20">
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-primary">
                          <User className="h-4 w-4" />
                          Dane kupującego:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {order.customer_name && (
                            <div>
                              <span className="text-muted-foreground">Imię i nazwisko: </span>
                              <span className="font-medium">{order.customer_name}</span>
                            </div>
                          )}
                          {order.customer_email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <a 
                                href={`mailto:${order.customer_email}`} 
                                className="text-primary hover:underline"
                              >
                                {order.customer_email}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Lista produktów w zamówieniu:
                    </h4>
                    
                    <div className="space-y-2">
                      {order.order_items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border/50"
                        >
                          {item.products?.image_url ? (
                            <img
                              src={item.products.image_url}
                              alt={item.products.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.products?.name || "Produkt"}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {item.animals ? (
                                <>
                                  <PawPrint className="h-3 w-3" />
                                  <span>Dla: {item.animals.name} ({item.animals.species})</span>
                                </>
                              ) : (
                                <>
                                  <Building2 className="h-3 w-3" />
                                  <span>Dla fundacji</span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-semibold text-sm">{item.quantity} szt.</p>
                            <p className="text-xs text-muted-foreground">
                              {item.unit_price.toFixed(2)} zł / szt.
                            </p>
                          </div>
                          
                          <div className="text-right font-semibold text-primary">
                            {(item.quantity * item.unit_price).toFixed(2)} zł
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Łącznie {order.order_items.reduce((sum, item) => sum + item.quantity, 0)} produktów
                      </span>
                      <span className="font-bold text-lg text-primary">
                        Suma: {order.total_amount.toFixed(2)} zł
                      </span>
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
        
        {(!filteredTransactions || filteredTransactions.length === 0) && (
          <Card className="rounded-3xl p-12 text-center shadow-card">
            <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Brak transakcji do wyświetlenia</p>
          </Card>
        )}
      </div>
    </div>
  );
}
