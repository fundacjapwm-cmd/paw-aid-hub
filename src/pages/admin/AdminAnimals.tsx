import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Building2, Calendar, Heart, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

export default function AdminAnimals() {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "name">("newest");
  const [speciesFilter, setSpeciesFilter] = useState<string>("all");
  const [animalToDelete, setAnimalToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: animals, isLoading } = useQuery({
    queryKey: ["admin-animals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("animals")
        .select(`
          *,
          organizations (id, name, slug)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user && profile?.role === "ADMIN",
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>Ładowanie...</p>
      </div>
    );
  }

  if (!user || profile?.role !== "ADMIN") {
    return <Navigate to="/auth" replace />;
  }

  const handleDeleteAnimal = async () => {
    if (!animalToDelete) return;
    
    setIsDeleting(true);
    try {
      // Delete related data first
      await supabase.from("animal_images").delete().eq("animal_id", animalToDelete.id);
      await supabase.from("animal_wishlists").delete().eq("animal_id", animalToDelete.id);
      
      const { error } = await supabase.from("animals").delete().eq("id", animalToDelete.id);
      
      if (error) throw error;
      
      toast({
        title: "Zwierzę usunięte",
        description: `${animalToDelete.name} zostało usunięte z systemu.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["admin-animals"] });
    } catch (error) {
      console.error("Error deleting animal:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć zwierzęcia. Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setAnimalToDelete(null);
    }
  };

  const filteredAndSortedAnimals = animals
    ?.filter((animal) => {
      const matchesSearch =
        animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        animal.organizations?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        animal.breed?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSpecies = speciesFilter === "all" || animal.species === speciesFilter;
      
      return matchesSearch && matchesSpecies;
    })
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
      if (sortOrder === "oldest") {
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      }
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj po nazwie, organizacji lub rasie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Gatunek" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie gatunki</SelectItem>
            <SelectItem value="Pies">Psy</SelectItem>
            <SelectItem value="Kot">Koty</SelectItem>
            <SelectItem value="Inne">Inne</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as "newest" | "oldest" | "name")}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sortowanie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Najnowsze</SelectItem>
            <SelectItem value="oldest">Najstarsze</SelectItem>
            <SelectItem value="name">Alfabetycznie</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="text-sm text-muted-foreground">
        Znaleziono: {filteredAndSortedAnimals?.length || 0} zwierząt
      </div>

      {/* Animals List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-muted rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAndSortedAnimals?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Heart className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>Nie znaleziono zwierząt</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedAnimals?.map((animal) => (
            <Card key={animal.id} className="rounded-2xl hover:shadow-bubbly-lg transition-shadow h-full">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Animal Image */}
                  <Link to={`/zwierze/${animal.id}`} className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {animal.image_url ? (
                      <img
                        src={animal.image_url}
                        alt={animal.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Heart className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                    )}
                  </Link>

                  {/* Animal Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/zwierze/${animal.id}`} className="hover:underline">
                        <h3 className="font-semibold text-foreground truncate">
                          {animal.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={animal.active ? "default" : "secondary"}>
                          {animal.active ? "Aktywny" : "Nieaktywny"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setAnimalToDelete({ id: animal.id, name: animal.name });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {animal.species}
                      </Badge>
                      {animal.breed && (
                        <span className="truncate">{animal.breed}</span>
                      )}
                    </div>

                    {/* Organization */}
                    {animal.organizations && (
                      <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{animal.organizations.name}</span>
                      </div>
                    )}

                    {/* Created date */}
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span>
                        Dodano: {animal.created_at 
                          ? format(new Date(animal.created_at), "d MMM yyyy", { locale: pl })
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!animalToDelete} onOpenChange={(open) => !open && setAnimalToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usuń zwierzę</AlertDialogTitle>
            <AlertDialogDescription>
              Czy na pewno chcesz usunąć <strong>{animalToDelete?.name}</strong>? 
              Ta operacja jest nieodwracalna i usunie również wszystkie powiązane dane (zdjęcia, wishlisty).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAnimal}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Usuwanie..." : "Usuń"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
