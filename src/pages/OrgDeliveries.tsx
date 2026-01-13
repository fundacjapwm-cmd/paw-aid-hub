import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserOrganization } from "@/hooks/useUserOrganization";
import OrgLayout from "@/components/organization/OrgLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, PackageCheck, Truck, Calendar, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { pl } from "date-fns/locale";


interface ShipmentItem {
  id: string;
  quantity: number;
  productName: string;
  productImage?: string;
  animalName?: string;
}

interface Shipment {
  id: string;
  organizationId: string;
  producerId: string | null;
  producerName: string;
  status: "shipped" | "delivered" | "confirmed";
  trackingNumber?: string;
  shippedAt: string;
  confirmedAt?: string;
  items: ShipmentItem[];
}

export default function OrgDeliveries() {
  const { user, profile } = useAuth();
  const { hasOrganization, organization, loading: orgLoading } = useUserOrganization();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Wait for organization loading to complete
    if (orgLoading) return;

    // Allow access if user has ORG role OR is assigned to an organization
    const canAccess = profile?.role === "ORG" || hasOrganization;
    if (!canAccess) {
      navigate("/");
    }
  }, [user, profile, hasOrganization, orgLoading, navigate]);

  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ["organization-shipments", organization?.organization_id],
    queryFn: async () => {
      if (!organization?.organization_id) return [];

      // Get shipments for this organization
      const { data: shipmentsData, error } = await supabase
        .from("shipments")
        .select(`
          id,
          organization_id,
          producer_id,
          status,
          tracking_number,
          shipped_at,
          confirmed_at,
          producers (name)
        `)
        .eq("organization_id", organization.organization_id)
        .in("status", ["shipped", "delivered"])
        .order("shipped_at", { ascending: false });

      if (error) throw error;
      if (!shipmentsData || shipmentsData.length === 0) return [];

      // Get order items for each shipment
      const result: Shipment[] = [];
      
      for (const shipment of shipmentsData) {
        const { data: items } = await supabase
          .from("order_items")
          .select(`
            id,
            quantity,
            products (name, image_url),
            animals (name)
          `)
          .eq("shipment_id", shipment.id);

        result.push({
          id: shipment.id,
          organizationId: shipment.organization_id,
          producerId: shipment.producer_id,
          producerName: (shipment.producers as any)?.name || "Nieznany producent",
          status: shipment.status as "shipped" | "delivered" | "confirmed",
          trackingNumber: shipment.tracking_number || undefined,
          shippedAt: shipment.shipped_at,
          confirmedAt: shipment.confirmed_at || undefined,
          items: (items || []).map((item: any) => ({
            id: item.id,
            quantity: item.quantity,
            productName: item.products?.name || "N/A",
            productImage: item.products?.image_url,
            animalName: item.animals?.name,
          })),
        });
      }

      return result;
    },
    enabled: !!organization?.organization_id,
  });

  const handleConfirmDelivery = async (shipment: Shipment) => {
    try {
      setConfirmingId(shipment.id);

      // Update shipment status to confirmed
      const { error } = await supabase
        .from("shipments")
        .update({
          status: "confirmed",
          confirmed_at: new Date().toISOString(),
        })
        .eq("id", shipment.id);

      if (error) throw error;

      // Update order_items fulfillment_status to delivered
      await supabase
        .from("order_items")
        .update({ fulfillment_status: "delivered" })
        .eq("shipment_id", shipment.id);


      toast.success("Dziękujemy! Odbiór paczki został potwierdzony.");

      queryClient.invalidateQueries({ queryKey: ["organization-shipments"] });
    } catch (error: any) {
      console.error("Error confirming delivery:", error);
      toast.error("Błąd podczas potwierdzania odbioru");
    } finally {
      setConfirmingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "shipped":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700">W drodze</Badge>;
      case "delivered":
        return <Badge variant="secondary" className="bg-green-100 text-green-700">Dostarczona</Badge>;
      case "confirmed":
        return <Badge variant="secondary" className="bg-green-100 text-green-700">Potwierdzona</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Wait for loading or redirect if no access
  const canAccess = profile?.role === "ORG" || hasOrganization;
  if (!user || orgLoading || !canAccess) {
    return null;
  }

  return (
    <OrgLayout organizationName={organization?.organization_name || ""}>
      <div className="px-4 md:px-8 py-8 md:py-12 max-w-6xl mx-auto">
        <div className="mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 md:mb-4">
            Dostawy
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            Nadchodzące paczki i potwierdzanie odbioru
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-3xl" />
            ))}
          </div>
        ) : shipments.length === 0 ? (
          <Card className="rounded-3xl p-12 text-center shadow-card">
            <div className="flex flex-col items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                <Package className="h-10 w-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Brak nadchodzących dostaw
                </h3>
                <p className="text-muted-foreground">
                  Nowe paczki pojawią się tutaj gdy zostaną wysłane
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {shipments.map((shipment) => (
              <Card key={shipment.id} className="rounded-3xl shadow-card overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Truck className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg mb-1">
                          Dostawa od {shipment.producerName}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Wysłano: {format(new Date(shipment.shippedAt), "dd.MM.yyyy", { locale: pl })}
                          </div>
                          {shipment.trackingNumber && (
                            <span className="text-xs bg-muted px-2 py-1 rounded-full">
                              Nr: {shipment.trackingNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(shipment.status)}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Product list */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground">
                      Zawartość paczki ({shipment.items.length} pozycji):
                    </h4>
                    <div className="grid gap-2">
                      {shipment.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3 bg-muted/30 rounded-2xl"
                        >
                          {item.productImage && (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.productName}</p>
                            <p className="text-xs text-muted-foreground">
                              Ilość: {item.quantity}
                              {item.animalName && ` • Dla: ${item.animalName}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Confirm button */}
                  {shipment.status === "shipped" && (
                    <div className="pt-4 border-t">
                      <Button
                        onClick={() => handleConfirmDelivery(shipment)}
                        disabled={confirmingId === shipment.id}
                        className="w-full rounded-3xl md:rounded-2xl h-12"
                        size="lg"
                      >
                        {confirmingId === shipment.id ? (
                          "Potwierdzanie..."
                        ) : (
                          <>
                            <PackageCheck className="h-5 w-5 mr-2" />
                            Potwierdź odbiór paczki
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Confirmed state */}
                  {shipment.status === "confirmed" && shipment.confirmedAt && (
                    <div className="pt-4 border-t flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm">
                        Potwierdzone {format(new Date(shipment.confirmedAt), "dd.MM.yyyy HH:mm", { locale: pl })}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </OrgLayout>
  );
}
