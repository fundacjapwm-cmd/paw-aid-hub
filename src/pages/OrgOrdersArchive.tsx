import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import OrgLayout from "@/components/organization/OrgLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Calendar, Truck, Archive } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  fulfillment_status: string;
  products?: {
    name: string;
    image_url?: string;
  };
  animals?: {
    id: string;
    name: string;
    image_url?: string;
  };
}

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  tracking_number?: string;
  order_items: OrderItem[];
}

export default function OrgOrdersArchive() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (profile?.role !== "ORG") {
      navigate("/");
      return;
    }
  }, [user, profile, navigate]);

  const { data: orgData } = useQuery({
    queryKey: ["organization-info", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: orgUser } = await supabase
        .from("organization_users")
        .select("organization_id, organizations(name)")
        .eq("user_id", user.id)
        .single();

      return orgUser;
    },
    enabled: !!user && profile?.role === "ORG",
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["organization-orders-archive", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: orgUser } = await supabase
        .from("organization_users")
        .select("organization_id")
        .eq("user_id", user.id)
        .single();

      const orgId = orgUser?.organization_id;
      if (!orgId) return [];

      // Get all animals for this organization
      const { data: animals } = await supabase
        .from("animals")
        .select("id")
        .eq("organization_id", orgId);

      const animalIds = animals?.map((a) => a.id) || [];
      if (animalIds.length === 0) return [];

      // Get all order items for these animals that are delivered
      const { data: orderItems } = await supabase
        .from("order_items")
        .select(`
          *,
          orders(id, created_at, total_amount, status, tracking_number, payment_status),
          products(name, image_url),
          animals(id, name, image_url)
        `)
        .in("animal_id", animalIds)
        .eq("fulfillment_status", "delivered")
        .order("created_at", { ascending: false });

      if (!orderItems) return [];

      // Filter only paid orders and group items by order
      const ordersMap = new Map<string, Order>();
      
      orderItems.forEach((item: any) => {
        const order = item.orders;
        if (!order || order.payment_status !== 'completed') return;

        if (!ordersMap.has(order.id)) {
          ordersMap.set(order.id, {
            id: order.id,
            created_at: order.created_at,
            total_amount: order.total_amount,
            status: order.status,
            tracking_number: order.tracking_number,
            order_items: [],
          });
        }

        ordersMap.get(order.id)?.order_items.push({
          id: item.id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          fulfillment_status: item.fulfillment_status,
          products: item.products,
          animals: item.animals,
        });
      });

      return Array.from(ordersMap.values());
    },
    enabled: !!user && profile?.role === "ORG",
  });


  const renderOrder = (order: Order) => {
    // Group items by animal
    const itemsByAnimal = new Map<string, OrderItem[]>();
    const organizationItems: OrderItem[] = [];

    order.order_items.forEach((item) => {
      if (item.animals) {
        const animalId = item.animals.id;
        if (!itemsByAnimal.has(animalId)) {
          itemsByAnimal.set(animalId, []);
        }
        itemsByAnimal.get(animalId)?.push(item);
      } else {
        organizationItems.push(item);
      }
    });

    return (
      <Card key={order.id} className="rounded-3xl shadow-card">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg mb-2">
                Zamówienie #{order.id.slice(0, 8)}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(order.created_at), "dd.MM.yyyy HH:mm", { locale: pl })}
                </div>
                {order.tracking_number && (
                  <div className="flex items-center gap-1">
                    <Truck className="h-4 w-4" />
                    {order.tracking_number}
                  </div>
                )}
              </div>
            </div>
            <Badge variant="default" className="bg-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Potwierdzone
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Organization Items */}
          {organizationItems.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-primary">Dla organizacji:</h4>
              <div className="space-y-2">
                {organizationItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-muted/30 rounded-2xl"
                  >
                    {item.products?.image_url && (
                      <img
                        src={item.products.image_url}
                        alt={item.products.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.products?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Ilość: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Items by Animal */}
          {Array.from(itemsByAnimal.entries()).map(([animalId, items]) => {
            const animal = items[0].animals;
            return (
              <div key={animalId} className="space-y-3">
                <h4 className="font-semibold text-sm text-primary flex items-center gap-2">
                  Dla zwierzęcia: {animal?.name}
                </h4>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-2xl"
                    >
                      {item.products?.image_url && (
                        <img
                          src={item.products.image_url}
                          alt={item.products.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.products?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Ilość: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  };

  if (!user || profile?.role !== "ORG") {
    return null;
  }

  return (
    <OrgLayout organizationName={orgData?.organizations?.name || ""}>
      <div className="px-4 md:px-8 py-8 md:py-12 max-w-6xl mx-auto">
        <div className="mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 md:mb-4">
            Archiwum zamówień
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            Historia potwierdzonych zamówień
          </p>
        </div>


        {orders.length === 0 ? (
          <Card className="rounded-3xl p-12 text-center shadow-card">
            <div className="flex flex-col items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                <Archive className="h-10 w-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Brak zamówień w archiwum
                </h3>
                <p className="text-muted-foreground">
                  Potwierdzone zamówienia pojawią się tutaj
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => renderOrder(order))}
          </div>
        )}
      </div>
    </OrgLayout>
  );
}
