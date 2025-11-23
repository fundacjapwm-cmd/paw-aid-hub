import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import OrgLayout from "@/components/organization/OrgLayout";
import OrgProfileForm from "@/components/organization/OrgProfileForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PawPrint, Package, AlertCircle, Plus, MapPin, Pencil, Mail, Phone, Globe, Building2, Hash, CreditCard, Trash2 } from "lucide-react";
import { useNavigate as useRouterNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function OrgDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const routerNavigate = useRouterNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [animalToDelete, setAnimalToDelete] = useState<any | null>(null);

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

  const { data: dashboardData, refetch } = useQuery({
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
  const allAnimals = dashboardData?.animals || [];
  const stats = dashboardData?.stats || { animals: 0, wishlistItems: 0, requests: 0 };
  const orgId = dashboardData?.organization?.id;
  const isOwner = true; // User in dashboard is always owner or has access

  // Filter animals based on search query
  const animals = allAnimals.filter((animal) =>
    animal.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteClick = (animal: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setAnimalToDelete(animal);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!animalToDelete) return;

    try {
      const { error } = await supabase
        .from("animals")
        .delete()
        .eq("id", animalToDelete.id);

      if (error) throw error;

      toast.success("Podopieczny został usunięty");
      setDeleteDialogOpen(false);
      setAnimalToDelete(null);
      refetch();
    } catch (error: any) {
      toast.error("Błąd podczas usuwania: " + error.message);
    }
  };

  const handleEditClick = (animal: any, e: React.MouseEvent) => {
    e.stopPropagation();
    routerNavigate('/organizacja/zwierzeta');
  };

  if (!user || profile?.role !== "ORG") {
    return null;
  }

  return (
    <OrgLayout organizationName={organization?.name || ""}>
      <div className="space-y-8">
        {/* Organization Header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl p-8 border border-border/50">
          <div className="flex flex-col gap-6">
            {/* Top Section - Logo, Name, Edit Button */}
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24 border-4 border-white shadow-card flex-shrink-0">
                <AvatarImage src={organization?.logo_url || ''} alt={organization?.name} />
                <AvatarFallback className="text-2xl">
                  {organization?.name?.charAt(0) || 'O'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-3xl font-bold text-foreground mb-2">{organization?.name || "Twoja Organizacja"}</h1>
                    {organization?.description && (
                      <p className="text-muted-foreground line-clamp-2">{organization.description}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditDialogOpen(true)}
                    className="gap-2 rounded-2xl flex-shrink-0"
                  >
                    <Pencil className="h-4 w-4" />
                    Edytuj
                  </Button>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Address */}
              {(organization?.address || organization?.city || organization?.postal_code) && (
                <div className="flex items-start gap-3 bg-background/50 rounded-2xl p-4">
                  <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground mb-1">Adres</div>
                    <div className="text-sm text-muted-foreground space-y-0.5">
                      {organization?.address && <div>{organization.address}</div>}
                      {(organization?.postal_code || organization?.city) && (
                        <div>
                          {organization?.postal_code && `${organization.postal_code} `}
                          {organization?.city}
                        </div>
                      )}
                      {organization?.province && <div>{organization.province}</div>}
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Email */}
              {organization?.contact_email && (
                <div className="flex items-start gap-3 bg-background/50 rounded-2xl p-4">
                  <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground mb-1">Email</div>
                    <a 
                      href={`mailto:${organization.contact_email}`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors break-all"
                    >
                      {organization.contact_email}
                    </a>
                  </div>
                </div>
              )}

              {/* Contact Phone */}
              {organization?.contact_phone && (
                <div className="flex items-start gap-3 bg-background/50 rounded-2xl p-4">
                  <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground mb-1">Telefon</div>
                    <a 
                      href={`tel:${organization.contact_phone}`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {organization.contact_phone}
                    </a>
                  </div>
                </div>
              )}

              {/* Website */}
              {organization?.website && (
                <div className="flex items-start gap-3 bg-background/50 rounded-2xl p-4">
                  <Globe className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground mb-1">Strona WWW</div>
                    <a 
                      href={organization.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors break-all"
                    >
                      {organization.website}
                    </a>
                  </div>
                </div>
              )}

              {/* NIP */}
              {organization?.nip && (
                <div className="flex items-start gap-3 bg-background/50 rounded-2xl p-4">
                  <Hash className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground mb-1">NIP</div>
                    <div className="text-sm text-muted-foreground">{organization.nip}</div>
                  </div>
                </div>
              )}

              {/* REGON */}
              {organization?.regon && (
                <div className="flex items-start gap-3 bg-background/50 rounded-2xl p-4">
                  <Building2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground mb-1">REGON</div>
                    <div className="text-sm text-muted-foreground">{organization.regon}</div>
                  </div>
                </div>
              )}

              {/* Bank Account */}
              {organization?.bank_account_number && (
                <div className="flex items-start gap-3 bg-background/50 rounded-2xl p-4">
                  <CreditCard className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground mb-1">Konto bankowe</div>
                    <div className="text-sm text-muted-foreground font-mono break-all">
                      {organization.bank_account_number}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Animals Section */}
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Nasi Podopieczni</h2>
              <p className="text-muted-foreground">
                {allAnimals.length > 0 ? `${allAnimals.length} ${allAnimals.length === 1 ? 'zwierzę' : 'zwierząt'} w systemie` : 'Nie masz jeszcze żadnych podopiecznych'}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <div className="relative flex-1 md:w-64">
                <input
                  type="text"
                  placeholder="Szukaj po imieniu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 rounded-2xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <Button 
                onClick={() => routerNavigate('/organizacja/zwierzeta')}
                className="rounded-2xl shadow-soft hover:scale-105 transition-transform whitespace-nowrap"
              >
                <Plus className="mr-2 h-4 w-4" />
                Dodaj
              </Button>
            </div>
          </div>

          {animals.length === 0 ? (
            <Card className="rounded-3xl p-12 text-center shadow-card">
              <div className="flex flex-col items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                  <PawPrint className="h-10 w-10 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {searchQuery ? 'Nie znaleziono podopiecznych' : 'Brak podopiecznych'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery 
                      ? `Brak wyników dla "${searchQuery}"`
                      : 'Zacznij dodawać zwierzęta, które potrzebują wsparcia'
                    }
                  </p>
                  {!searchQuery && (
                    <Button 
                      onClick={() => routerNavigate('/organizacja/zwierzeta')}
                      className="rounded-2xl"
                    >
                      Dodaj pierwszego podopiecznego
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {animals.map((animal) => (
                <Card
                  key={animal.id}
                  className="group overflow-hidden hover:shadow-bubbly transition-all duration-300 hover:-translate-y-1 rounded-3xl border-0 shadow-card cursor-pointer"
                  onClick={() => routerNavigate(`/zwierze/${animal.id}`)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="relative w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden">
                      <img
                        src={animal.image_url || '/placeholder.svg'}
                        alt={animal.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-xs">
                          {animal.species}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {animal.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 flex-wrap">
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
                        {animal.gender && (
                          <span className="bg-muted/50 px-2 py-1 rounded-full">
                            {animal.gender}
                          </span>
                        )}
                      </div>
                      {animal.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {animal.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => handleEditClick(animal, e)}
                        className="rounded-2xl h-9 w-9"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => handleDeleteClick(animal, e)}
                        className="rounded-2xl h-9 w-9 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Edit Organization Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edytuj dane organizacji</DialogTitle>
            </DialogHeader>
            {orgId && (
              <OrgProfileForm 
                organizationId={orgId} 
                isOwner={isOwner}
                onSuccess={() => {
                  setEditDialogOpen(false);
                  refetch();
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Animal Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Czy na pewno chcesz usunąć?</AlertDialogTitle>
              <AlertDialogDescription>
                Ta akcja spowoduje trwałe usunięcie podopiecznego <strong>{animalToDelete?.name}</strong> z bazy danych. Tej operacji nie można cofnąć.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Anuluj</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Usuń
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </OrgLayout>
  );
}
