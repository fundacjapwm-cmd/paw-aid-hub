import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import OrgLayout from "@/components/organization/OrgLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PawPrint, Package, AlertCircle } from "lucide-react";

export default function OrgDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    animals: 0,
    wishlistItems: 0,
    requests: 0,
  });
  const [organizationName, setOrganizationName] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (profile?.role !== "ORG") {
      navigate("/");
      return;
    }

    fetchStats();
  }, [user, profile, navigate]);

  const fetchStats = async () => {
    try {
      // Get organization
      const { data: orgUser } = await supabase
        .from("organization_users")
        .select("organization_id, organizations(name)")
        .eq("user_id", user?.id)
        .single();

      if (orgUser?.organizations) {
        setOrganizationName((orgUser.organizations as any).name);
      }

      const orgId = orgUser?.organization_id;

      if (!orgId) return;

      // Count animals
      const { count: animalsCount } = await supabase
        .from("animals")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", orgId);

      // Count wishlist items
      const { data: animals } = await supabase
        .from("animals")
        .select("id")
        .eq("organization_id", orgId);

      const animalIds = animals?.map((a) => a.id) || [];

      const { count: wishlistCount } = await supabase
        .from("animal_wishlists")
        .select("*", { count: "exact", head: true })
        .in("animal_id", animalIds);

      // Count requests
      const { count: requestsCount } = await supabase
        .from("product_requests")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", orgId);

      setStats({
        animals: animalsCount || 0,
        wishlistItems: wishlistCount || 0,
        requests: requestsCount || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  return (
    <OrgLayout organizationName={organizationName}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pulpit</h2>
          <p className="text-muted-foreground">
            Zarządzaj swoją organizacją i podopiecznymi
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-3xl shadow-card hover:shadow-bubbly transition-[box-shadow]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Podopieczni
              </CardTitle>
              <PawPrint className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.animals}</div>
              <p className="text-xs text-muted-foreground">
                Zwierząt w systemie
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-card hover:shadow-bubbly transition-[box-shadow]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Lista potrzeb
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.wishlistItems}</div>
              <p className="text-xs text-muted-foreground">
                Produktów na listach
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-card hover:shadow-bubbly transition-[box-shadow]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Zgłoszenia
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.requests}</div>
              <p className="text-xs text-muted-foreground">
                Oczekujących produktów
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </OrgLayout>
  );
}
