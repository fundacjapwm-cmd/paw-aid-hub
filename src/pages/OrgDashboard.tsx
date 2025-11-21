import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import OrgLayout from "@/components/organization/OrgLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PawPrint, Package, AlertCircle, Plus, MapPin, Heart } from "lucide-react";
import { useNavigate as useRouterNavigate } from "react-router-dom";

export default function OrgDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const routerNavigate = useRouterNavigate();

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

  const { data: dashboardData } = useQuery({
    queryKey: ["organization-dashboard", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get organization with full details
      const { data: orgUser } = await supabase
        .from("organization_users")
        .select("organization_id, organizations(*)")
        .eq("user_id", user.id)
        .single();

      const organization = orgUser?.organizations as any;
      const orgId = orgUser?.organization_id;

      if (!orgId) return { organization: null, animals: [], stats: { animals: 0, wishlistItems: 0, requests: 0 } };

      // Get animals
      const { data: animals } = await supabase
        .from("animals")
        .select("*")
        .eq("organization_id", orgId)
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(6);

      // Count animals
      const { count: animalsCount } = await supabase
        .from("animals")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", orgId);

      // Count wishlist items
      const { data: allAnimals } = await supabase
        .from("animals")
        .select("id")
        .eq("organization_id", orgId);

      const animalIds = allAnimals?.map((a) => a.id) || [];

      const { count: wishlistCount } = await supabase
        .from("animal_wishlists")
        .select("*", { count: "exact", head: true })
        .in("animal_id", animalIds);

      // Count requests
      const { count: requestsCount } = await supabase
        .from("product_requests")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("status", "pending");

      return {
        organization,
        animals: animals || [],
        stats: {
          animals: animalsCount || 0,
          wishlistItems: wishlistCount || 0,
          requests: requestsCount || 0,
        },
      };
    },
    enabled: !!user && profile?.role === "ORG",
    staleTime: 300000, // 5 minutes
  });

  const organization = dashboardData?.organization;
  const animals = dashboardData?.animals || [];
  const stats = dashboardData?.stats || { animals: 0, wishlistItems: 0, requests: 0 };

  if (!user || profile?.role !== "ORG") {
    return null;
  }

  return (
    <OrgLayout organizationName={organization?.name || ""}>
      <div className="space-y-8">
        {/* Organization Header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl p-8 border border-border/50">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24 border-4 border-white shadow-card">
              <AvatarImage src={organization?.logo_url || ''} alt={organization?.name} />
              <AvatarFallback className="text-2xl">
                {organization?.name?.charAt(0) || 'O'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">{organization?.name || "Twoja Organizacja"}</h1>
              {organization?.city && (
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                  <MapPin className="h-4 w-4" />
                  <span>{organization.city}</span>
                </div>
              )}
              {organization?.description && (
                <p className="text-muted-foreground line-clamp-2">{organization.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
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

        {/* Animals Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Nasi Podopieczni</h2>
              <p className="text-muted-foreground">
                {animals.length > 0 ? `${animals.length} najnowszych zwierząt` : 'Nie masz jeszcze żadnych podopiecznych'}
              </p>
            </div>
            <Button 
              onClick={() => routerNavigate('/organizacja/zwierzeta')}
              className="rounded-2xl shadow-soft hover:scale-105 transition-transform"
            >
              <Plus className="mr-2 h-4 w-4" />
              Dodaj podopiecznego
            </Button>
          </div>

          {animals.length === 0 ? (
            <Card className="rounded-3xl p-12 text-center shadow-card">
              <div className="flex flex-col items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                  <PawPrint className="h-10 w-10 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Brak podopiecznych</h3>
                  <p className="text-muted-foreground mb-4">
                    Zacznij dodawać zwierzęta, które potrzebują wsparcia
                  </p>
                  <Button 
                    onClick={() => routerNavigate('/organizacja/zwierzeta')}
                    className="rounded-2xl"
                  >
                    Dodaj pierwszego podopiecznego
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {animals.map((animal) => (
                <Card
                  key={animal.id}
                  className="group overflow-hidden hover:shadow-bubbly transition-all duration-300 hover:-translate-y-2 rounded-3xl border-0 shadow-card cursor-pointer"
                  onClick={() => routerNavigate(`/zwierze/${animal.id}`)}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={animal.image_url || '/placeholder.svg'}
                      alt={animal.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                        {animal.species}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {animal.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      {animal.age && (
                        <span className="bg-muted/50 px-2 py-1 rounded-full">
                          {animal.age} {animal.age === 1 ? 'rok' : 'lat'}
                        </span>
                      )}
                      {animal.breed && (
                        <span className="bg-muted/50 px-2 py-1 rounded-full">
                          {animal.breed}
                        </span>
                      )}
                    </div>
                    {animal.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {animal.description}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {animals.length > 0 && (
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={() => routerNavigate('/organizacja/zwierzeta')}
                className="rounded-2xl"
              >
                Zobacz wszystkich podopiecznych
              </Button>
            </div>
          )}
        </div>
      </div>
    </OrgLayout>
  );
}
