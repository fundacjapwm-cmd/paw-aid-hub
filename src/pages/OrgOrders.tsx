import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import OrgLayout from "@/components/organization/OrgLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Package, CheckCircle, AlertCircle, Calendar, Truck, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
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

export default function OrgOrders() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [problemDialogOpen, setProblemDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [problemDescription, setProblemDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const { data: ordersData, refetch } = useQuery({
    queryKey: ["organization-orders", user?.id],
    queryFn: async () => {
      if (!user?.id) return { inProgress: [], completed: [] };

      const { data: orgUser } = await supabase
        .from("organization_users")
        .select("organization_id")
        .eq("user_id", user.id)
        .single();

      const orgId = orgUser?.organization_id;
      if (!orgId) return { inProgress: [], completed: [] };

      // Get all animals for this organization
      const { data: animals } = await supabase
        .from("animals")
        .select("id")
        .eq("organization_id", orgId);

      const animalIds = animals?.map((a) => a.id) || [];
      if (animalIds.length === 0) return { inProgress: [], completed: [] };

      // Get all order items for these animals
      const { data: orderItems } = await supabase
        .from("order_items")
        .select(`
          *,
          orders(id, created_at, total_amount, status, tracking_number),
          products(name, image_url),
          animals(id, name, image_url)
        `)
        .in("animal_id", animalIds)
        .order("created_at", { ascending: false });

      if (!orderItems) return { inProgress: [], completed: [] };

      // Group items by order
      const ordersMap = new Map<string, Order>();
      
      orderItems.forEach((item: any) => {
        const order = item.orders;
        if (!order) return;

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

      const allOrders = Array.from(ordersMap.values());

      // Split orders by fulfillment status
      const inProgress = allOrders.filter(
        (order) => order.order_items.some((item) => item.fulfillment_status !== "fulfilled")
      );
      const completed = allOrders.filter(
        (order) => order.order_items.every((item) => item.fulfillment_status === "fulfilled")
      );

      return { inProgress, completed };
    },
    enabled: !!user && profile?.role === "ORG",
  });

  const handleMarkAsCompleted = async (orderId: string) => {
    try {
      // Get all order items for this order
      const order = [...(ordersData?.inProgress || []), ...(ordersData?.completed || [])].find(
        (o) => o.id === orderId
      );

      if (!order) return;

      // Update all order items to fulfilled
      const { error } = await supabase
        .from("order_items")
        .update({ fulfillment_status: "fulfilled" })
        .in("id", order.order_items.map((item) => item.id));

      if (error) throw error;

      toast.success("Zamówienie oznaczone jako zrealizowane");
      refetch();
    } catch (error: any) {
      toast.error("Błąd podczas aktualizacji: " + error.message);
    }
  };

  const handleReportProblem = (order: Order) => {
    setSelectedOrder(order);
    setProblemDialogOpen(true);
  };

  const handleSubmitProblem = async () => {
    if (!selectedOrder || !problemDescription.trim()) {
      toast.error("Proszę opisać problem");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("send-contact-form", {
        body: {
          name: orgData?.organizations?.name || "Organizacja",
          email: "fundacjapwm@gmail.com",
          message: `ZGŁOSZENIE PROBLEMU Z ZAMÓWIENIEM\n\nNumer zamówienia: ${selectedOrder.id}\nData zamówienia: ${format(new Date(selectedOrder.created_at), "dd.MM.yyyy HH:mm", { locale: pl })}\n\nOpis problemu:\n${problemDescription}`,
        },
      });

      if (error) throw error;

      toast.success("Problem został zgłoszony. Skontaktujemy się wkrótce.");
      setProblemDialogOpen(false);
      setProblemDescription("");
      setSelectedOrder(null);
    } catch (error: any) {
      toast.error("Błąd podczas zgłaszania problemu: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

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

    const isCompleted = order.order_items.every((item) => item.fulfillment_status === "fulfilled");

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
            <Badge variant={isCompleted ? "default" : "secondary"}>
              {isCompleted ? "Zrealizowane" : "W trakcie"}
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
                        Ilość: {item.quantity} × {item.unit_price.toFixed(2)} zł
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
                          Ilość: {item.quantity} × {item.unit_price.toFixed(2)} zł
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Action Buttons */}
          {!isCompleted && (
            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={() => handleMarkAsCompleted(order.id)}
                className="flex-1 rounded-2xl"
                variant="default"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Oznacz jako zrealizowane
              </Button>
              <Button
                onClick={() => handleReportProblem(order)}
                className="flex-1 rounded-2xl"
                variant="outline"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Zgłoś problem
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!user || profile?.role !== "ORG") {
    return null;
  }

  const inProgressOrders = ordersData?.inProgress || [];
  const completedOrders = ordersData?.completed || [];

  return (
    <OrgLayout organizationName={orgData?.organizations?.name || ""}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Zamówienia</h1>
          <p className="text-muted-foreground">
            Zarządzaj zamówieniami od darczyńców
          </p>
        </div>

        <Tabs defaultValue="in-progress" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="in-progress">
              W trakcie realizacji ({inProgressOrders.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Zrealizowane ({completedOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="in-progress" className="mt-6">
            {inProgressOrders.length === 0 ? (
              <Card className="rounded-3xl p-12 text-center shadow-card">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                    <Package className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Brak zamówień w trakcie realizacji
                    </h3>
                    <p className="text-muted-foreground">
                      Zamówienia od darczyńców pojawią się tutaj
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {inProgressOrders.map((order) => renderOrder(order))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {completedOrders.length === 0 ? (
              <Card className="rounded-3xl p-12 text-center shadow-card">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Brak zrealizowanych zamówień
                    </h3>
                    <p className="text-muted-foreground">
                      Zrealizowane zamówienia pojawią się tutaj
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {completedOrders.map((order) => renderOrder(order))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Problem Report Dialog */}
      <Dialog open={problemDialogOpen} onOpenChange={setProblemDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Zgłoś problem z zamówieniem</DialogTitle>
            <DialogDescription>
              Opisz problem, a my skontaktujemy się z Tobą najszybciej jak to możliwe.
              Numer zamówienia zostanie automatycznie dołączony do wiadomości.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Numer zamówienia</Label>
              <p className="text-sm text-muted-foreground mt-1">
                #{selectedOrder?.id.slice(0, 8)}
              </p>
            </div>
            <div>
              <Label htmlFor="problem">Opis problemu *</Label>
              <Textarea
                id="problem"
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                placeholder="Opisz problem szczegółowo..."
                className="mt-2 min-h-[120px]"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Wiadomość zostanie wysłana na adres: fundacjapwm@gmail.com
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProblemDialogOpen(false)}
              disabled={submitting}
            >
              Anuluj
            </Button>
            <Button
              onClick={handleSubmitProblem}
              disabled={submitting || !problemDescription.trim()}
            >
              {submitting ? "Wysyłanie..." : "Wyślij zgłoszenie"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </OrgLayout>
  );
}
