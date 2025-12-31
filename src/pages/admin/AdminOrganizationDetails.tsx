import { useState, useEffect } from "react";
import { Navigate, useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  CheckCircle, 
  XCircle,
  Edit,
  Cat,
  Dog,
  Calendar
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { formatDetailedAge } from "@/lib/utils/ageCalculator";

interface Organization {
  id: string;
  name: string;
  slug: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  description?: string;
  logo_url?: string;
  website?: string;
  nip?: string;
  active?: boolean;
  terms_accepted_at?: string;
}

interface Animal {
  id: string;
  name: string;
  species: string;
  breed?: string;
  birth_date?: string;
  description?: string;
  image_url?: string;
  active?: boolean;
  created_at?: string;
}

export default function AdminOrganizationDetails() {
  const { id } = useParams<{ id: string }>();
  const { user, profile, loading: authLoading } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const isAdmin = profile?.role === "ADMIN";

  useEffect(() => {
    if (id && isAdmin) {
      fetchOrganization();
      fetchAnimals();
    }
  }, [id, isAdmin]);

  const fetchOrganization = async () => {
    try {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setOrganization(data);
    } catch (error) {
      console.error("Error fetching organization:", error);
      toast.error("Nie udało się pobrać danych organizacji");
    }
  };

  const fetchAnimals = async () => {
    try {
      const { data, error } = await supabase
        .from("animals")
        .select("*")
        .eq("organization_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAnimals(data || []);
    } catch (error) {
      console.error("Error fetching animals:", error);
      toast.error("Nie udało się pobrać listy zwierząt");
    } finally {
      setLoading(false);
    }
  };

  const handleEditAnimal = (animal: Animal) => {
    setEditingAnimal({ ...animal });
    setEditDialogOpen(true);
  };

  const handleSaveAnimal = async () => {
    if (!editingAnimal) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("animals")
        .update({
          name: editingAnimal.name,
          species: editingAnimal.species as "Pies" | "Kot" | "Inne",
          breed: editingAnimal.breed,
          description: editingAnimal.description,
          birth_date: editingAnimal.birth_date,
          active: editingAnimal.active,
        })
        .eq("id", editingAnimal.id);

      if (error) throw error;

      toast.success("Zapisano zmiany");
      setEditDialogOpen(false);
      setEditingAnimal(null);
      fetchAnimals();
    } catch (error) {
      console.error("Error saving animal:", error);
      toast.error("Nie udało się zapisać zmian");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><p>Ładowanie...</p></div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="md:px-8 px-4 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[200px] w-full rounded-3xl" />
        <Skeleton className="h-[400px] w-full rounded-3xl" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="md:px-8 px-4">
        <p className="text-muted-foreground">Nie znaleziono organizacji</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/admin/organizacje">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Wróć do listy
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="md:px-8 px-4 space-y-6">
      {/* Back button */}
      <Button asChild variant="ghost" size="sm">
        <Link to="/admin/organizacje">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Wróć do listy organizacji
        </Link>
      </Button>

      {/* Organization Info Card */}
      <Card className="rounded-3xl shadow-bubbly">
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 rounded-2xl">
              <AvatarImage src={organization.logo_url || ""} alt={organization.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl rounded-2xl">
                <Building className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-2xl">{organization.name}</CardTitle>
                {organization.terms_accepted_at ? (
                  <Badge variant="default" className="gap-1 bg-green-500/10 text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    Regulamin zaakceptowany
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1 bg-orange-500/10 text-orange-600">
                    <XCircle className="h-3 w-3" />
                    Brak akceptacji
                  </Badge>
                )}
                {!organization.active && (
                  <Badge variant="destructive">Nieaktywna</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Slug: {organization.slug}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{organization.contact_email}</span>
              </div>
              {organization.contact_phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{organization.contact_phone}</span>
                </div>
              )}
              {(organization.address || organization.city) && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {organization.address && `${organization.address}, `}
                    {organization.postal_code} {organization.city}
                    {organization.province && `, ${organization.province}`}
                  </span>
                </div>
              )}
              {organization.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a href={organization.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {organization.website}
                  </a>
                </div>
              )}
              {organization.nip && (
                <div className="text-sm text-muted-foreground">
                  NIP: {organization.nip}
                </div>
              )}
            </div>
            {organization.description && (
              <div>
                <p className="text-sm text-muted-foreground">{organization.description}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Animals List Card */}
      <Card className="rounded-3xl shadow-bubbly">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Zwierzęta organizacji
            <Badge variant="secondary">{animals.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {animals.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Ta organizacja nie ma jeszcze żadnych zwierząt
            </p>
          ) : (
            <div className="grid gap-4">
              {animals.map((animal) => (
                <div 
                  key={animal.id} 
                  className="flex items-center justify-between p-4 border rounded-2xl hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 rounded-xl">
                      <AvatarImage src={animal.image_url || ""} alt={animal.name} />
                      <AvatarFallback className="bg-primary/10 text-primary rounded-xl">
                        {animal.species === "Kot" ? (
                          <Cat className="h-6 w-6" />
                        ) : (
                          <Dog className="h-6 w-6" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{animal.name}</h4>
                        {!animal.active && (
                          <Badge variant="secondary" className="text-xs">Nieaktywne</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{animal.species}</span>
                        {animal.breed && <span>• {animal.breed}</span>}
                        {animal.birth_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDetailedAge(animal.birth_date)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditAnimal(animal)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edytuj
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Animal Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edytuj zwierzę</DialogTitle>
            <DialogDescription>Zmień dane zwierzęcia jako administrator</DialogDescription>
          </DialogHeader>
          {editingAnimal && (
            <div className="space-y-4">
              <div>
                <Label>Imię</Label>
                <Input
                  value={editingAnimal.name}
                  onChange={(e) => setEditingAnimal({ ...editingAnimal, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Gatunek</Label>
                <Select 
                  value={editingAnimal.species} 
                  onValueChange={(value) => setEditingAnimal({ ...editingAnimal, species: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pies">Pies</SelectItem>
                    <SelectItem value="Kot">Kot</SelectItem>
                    <SelectItem value="Inne">Inne</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Rasa</Label>
                <Input
                  value={editingAnimal.breed || ""}
                  onChange={(e) => setEditingAnimal({ ...editingAnimal, breed: e.target.value })}
                  placeholder="np. Labrador"
                />
              </div>
              <div>
                <Label>Data urodzenia</Label>
                <Input
                  type="date"
                  value={editingAnimal.birth_date || ""}
                  onChange={(e) => setEditingAnimal({ ...editingAnimal, birth_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Opis</Label>
                <Textarea
                  value={editingAnimal.description || ""}
                  onChange={(e) => setEditingAnimal({ ...editingAnimal, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label>Status</Label>
                <Select 
                  value={editingAnimal.active ? "active" : "inactive"} 
                  onValueChange={(value) => setEditingAnimal({ ...editingAnimal, active: value === "active" })}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktywne</SelectItem>
                    <SelectItem value="inactive">Nieaktywne</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Anuluj
                </Button>
                <Button onClick={handleSaveAnimal} disabled={saving}>
                  {saving ? "Zapisywanie..." : "Zapisz zmiany"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
