import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import OrgLayout from "@/components/organization/OrgLayout";
import OrgProfileForm from "@/components/organization/OrgProfileForm";
import ImageCropDialog from "@/components/organization/ImageCropDialog";
import WishlistBuilder from "@/components/organization/WishlistBuilder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PawPrint, Package, AlertCircle, Plus, MapPin, Pencil, Mail, Phone, Globe, Hash, Trash2, Upload, Calendar as CalendarIcon, ShoppingCart, CheckCircle, Camera } from "lucide-react";
import { useNavigate as useRouterNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const animalSchema = z.object({
  name: z.string().min(2, "Imię musi mieć minimum 2 znaki"),
  species: z.enum(["Pies", "Kot", "Inne"]),
  description: z.string().optional(),
  birth_date: z.date().optional(),
});

type AnimalFormData = z.infer<typeof animalSchema>;

export default function OrgDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const routerNavigate = useRouterNavigate();
  const [editOrgDialogOpen, setEditOrgDialogOpen] = useState(false);
  const [editAnimalDialogOpen, setEditAnimalDialogOpen] = useState(false);
  const [addAnimalDialogOpen, setAddAnimalDialogOpen] = useState(false);
  const [newAnimalId, setNewAnimalId] = useState<string | null>(null);
  const [addAnimalStep, setAddAnimalStep] = useState<"info" | "wishlist">("info");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [animalToDelete, setAnimalToDelete] = useState<any | null>(null);
  const [editingAnimal, setEditingAnimal] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [logoToCrop, setLogoToCrop] = useState<string | null>(null);
  const [logoCropDialogOpen, setLogoCropDialogOpen] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const form = useForm<AnimalFormData>({
    resolver: zodResolver(animalSchema),
    defaultValues: {
      name: "",
      species: "Pies",
      description: "",
      birth_date: undefined,
    },
  });

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

      // Get animals with wishlist data
      const { data: animals } = await supabase
        .from("animals")
        .select(`
          *,
          animal_wishlists(quantity)
        `)
        .eq("organization_id", orgId)
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(6);

      // Get fulfilled items for all animals
      const animalIdsForOrders = animals?.map(a => a.id) || [];
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("animal_id, quantity")
        .in("animal_id", animalIdsForOrders)
        .eq("fulfillment_status", "fulfilled");

      // Calculate stats for each animal
      const animalsWithStats = animals?.map(animal => {
        const wishlistItems = (animal as any).animal_wishlists || [];
        const totalNeeded = wishlistItems.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
        const fulfilled = orderItems?.filter(oi => oi.animal_id === animal.id)
          .reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
        const progress = totalNeeded > 0 ? Math.min((fulfilled / totalNeeded) * 100, 100) : 0;

        return {
          ...animal,
          wishlistStats: {
            totalNeeded,
            fulfilled,
            progress
          }
        };
      }) || [];

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
        animals: animalsWithStats,
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
    setEditingAnimal(animal);
    form.reset({
      name: animal.name,
      species: animal.species,
      description: animal.description || "",
      birth_date: animal.birth_date ? new Date(animal.birth_date) : undefined,
    });
    setImagePreview(animal.image_url);
    setEditAnimalDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const totalFiles = galleryFiles.length + newFiles.length;
    
    if (totalFiles > 6) {
      toast.error(`Możesz dodać jeszcze ${6 - galleryFiles.length} zdjęć (max 6)`);
      return;
    }
    
    // Append new files to existing ones
    const updatedFiles = [...galleryFiles, ...newFiles];
    setGalleryFiles(updatedFiles);
    
    // Generate previews for new files and append to existing previews
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input to allow selecting the same file again
    e.target.value = '';
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onAddAnimalSubmit = async (data: AnimalFormData) => {
    try {
      if (!orgId) return;

      setUploading(true);
      let imageUrl = null;

      // Upload main image if selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `animals/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // Insert animal
      const { data: newAnimal, error } = await supabase.from("animals")
        .insert({
          ...data,
          birth_date: data.birth_date ? format(data.birth_date, 'yyyy-MM-dd') : null,
          organization_id: orgId,
          image_url: imageUrl,
        } as any)
        .select()
        .single();

      if (error) throw error;

      // Upload gallery images if any
      if (galleryFiles.length > 0 && newAnimal) {
        for (let i = 0; i < galleryFiles.length; i++) {
          const file = galleryFiles[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `animals/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, file);

          if (uploadError) {
            console.error('Gallery upload error:', uploadError);
            continue;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

          await supabase.from('animal_images').insert({
            animal_id: newAnimal.id,
            image_url: publicUrl,
            display_order: i,
          });
        }
      }

      toast.success("Podopieczny został dodany!");
      setNewAnimalId(newAnimal.id);
      setAddAnimalStep("wishlist");
      setUploading(false);
      refetch();
    } catch (error: any) {
      toast.error("Błąd podczas dodawania: " + error.message);
      setUploading(false);
    }
  };

  const handleCloseAddDialog = () => {
    setAddAnimalDialogOpen(false);
    setNewAnimalId(null);
    setAddAnimalStep("info");
    form.reset();
    setImagePreview(null);
    setImageFile(null);
    setGalleryFiles([]);
    setGalleryPreviews([]);
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Wybierz plik graficzny (JPG, PNG, itp.)");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setLogoToCrop(reader.result as string);
      setLogoCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleLogoCropComplete = async (croppedImage: Blob) => {
    if (!orgId) return;
    
    setUploadingLogo(true);
    
    const fileName = `${orgId}-${Date.now()}.jpg`;
    const filePath = `logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, croppedImage);

    if (uploadError) {
      toast.error("Nie udało się przesłać logo");
      setUploadingLogo(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from("organizations")
      .update({ logo_url: urlData.publicUrl })
      .eq("id", orgId);

    if (updateError) {
      toast.error("Nie udało się zapisać logo");
    } else {
      toast.success("Logo zostało zaktualizowane");
      refetch();
    }

    setUploadingLogo(false);
    setLogoCropDialogOpen(false);
    setLogoToCrop(null);
  };

  const onEditSubmit = async (data: AnimalFormData) => {
    if (!editingAnimal || !orgId) return;

    try {
      setUploading(true);
      let imageUrl = editingAnimal.image_url;

      // Upload new main image if selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `animals/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // Update animal
      const { error } = await supabase.from("animals")
        .update({
          ...data,
          birth_date: data.birth_date ? format(data.birth_date, 'yyyy-MM-dd') : null,
          image_url: imageUrl,
        } as any)
        .eq("id", editingAnimal.id);

      if (error) throw error;

      toast.success("Podopieczny został zaktualizowany!");
      setEditAnimalDialogOpen(false);
      setEditingAnimal(null);
      form.reset();
      setImagePreview(null);
      setImageFile(null);
      setUploading(false);
      refetch();
    } catch (error: any) {
      toast.error("Błąd podczas aktualizacji: " + error.message);
      setUploading(false);
    }
  };

  if (!user || profile?.role !== "ORG") {
    return null;
  }

  return (
    <OrgLayout organizationName={organization?.name || ""}>
      <div className="px-4 md:px-8 py-8 md:py-12 max-w-6xl mx-auto space-y-8 md:space-y-12">
        {/* Organization Header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl p-6 md:p-8 border border-border/50">
          <div className="flex flex-col gap-6">
            {/* Top Section - Logo, Name, Edit Button */}
            <div className="flex items-start gap-4 md:gap-6">
              {/* Clickable Avatar for Logo Change */}
              <div className="relative group flex-shrink-0">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoSelect}
                  disabled={uploadingLogo}
                  className="hidden"
                  id="logo-upload-dashboard"
                />
                <label
                  htmlFor="logo-upload-dashboard"
                  className="cursor-pointer block"
                >
                  <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-white shadow-card transition-opacity group-hover:opacity-80">
                    <AvatarImage src={organization?.logo_url || ''} alt={organization?.name} />
                    <AvatarFallback className="text-2xl">
                      {organization?.name?.charAt(0) || 'O'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </label>
                {uploadingLogo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl md:text-3xl font-bold text-foreground">{organization?.name || "Twoja Organizacja"}</h1>
                      <button
                        onClick={() => setEditOrgDialogOpen(true)}
                        className="md:hidden p-1.5 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-primary transition-colors"
                        aria-label="Edytuj nazwę"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                    {organization?.description && (
                      <p className="text-muted-foreground line-clamp-2 mt-1">{organization.description}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditOrgDialogOpen(true)}
                    className="gap-2 rounded-2xl flex-shrink-0 hidden md:flex"
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
            </div>
          </div>
        </div>


        {/* Animals Section */}
        <div>
          <div className="bg-background/50 rounded-2xl p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                  onClick={() => {
                    form.reset();
                    setImagePreview(null);
                    setImageFile(null);
                    setGalleryFiles([]);
                    setGalleryPreviews([]);
                    setNewAnimalId(null);
                    setAddAnimalStep("info");
                    setAddAnimalDialogOpen(true);
                  }}
                  className="shadow-soft md:hover:scale-105 transition-transform whitespace-nowrap"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Dodaj
                </Button>
              </div>
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
                      onClick={() => {
                        form.reset();
                        setImagePreview(null);
                        setImageFile(null);
                        setGalleryFiles([]);
                        setGalleryPreviews([]);
                        setNewAnimalId(null);
                        setAddAnimalStep("info");
                        setAddAnimalDialogOpen(true);
                      }}
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
                  className="group overflow-hidden transition-all duration-300 rounded-3xl border border-border/40 shadow-card cursor-pointer md:hover:shadow-bubbly md:hover:-translate-y-1"
                  onClick={() => routerNavigate(`/zwierze/${animal.id}`, { state: { fromOrganization: true } })}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="relative w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden">
                      <img
                        src={animal.image_url || '/placeholder.svg'}
                        alt={animal.name}
                        className="w-full h-full object-cover md:group-hover:scale-110 transition-transform duration-500"
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
                      {animal.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {animal.description}
                        </p>
                      )}
                      
                      {/* Wishlist Progress */}
                      {(animal as any).wishlistStats && (animal as any).wishlistStats.totalNeeded > 0 && (
                        <div className="space-y-2 pt-3 border-t">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <ShoppingCart className="h-3 w-3" />
                              <span>Potrzeby</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-primary font-medium">
                                {(animal as any).wishlistStats.fulfilled} / {(animal as any).wishlistStats.totalNeeded}
                              </span>
                              <span className="text-muted-foreground">
                                {Math.round((animal as any).wishlistStats.progress)}%
                              </span>
                            </div>
                          </div>
                          <Progress value={(animal as any).wishlistStats.progress} className="h-2" />
                        </div>
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
        <Dialog open={editOrgDialogOpen} onOpenChange={setEditOrgDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edytuj dane organizacji</DialogTitle>
            </DialogHeader>
            {orgId && (
              <OrgProfileForm 
                organizationId={orgId} 
                isOwner={isOwner}
                onSuccess={() => {
                  setEditOrgDialogOpen(false);
                  refetch();
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Animal Dialog */}
        <Dialog open={editAnimalDialogOpen} onOpenChange={setEditAnimalDialogOpen}>
          <DialogContent className="max-w-7xl h-[90vh] flex flex-col rounded-3xl">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Edytuj podopiecznego</DialogTitle>
              <DialogDescription>
                Zaktualizuj dane zwierzęcia i zarządzaj jego listą potrzeb
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="info" className="w-full flex-1 flex flex-col overflow-hidden">
              <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
                <TabsTrigger value="info">Informacje</TabsTrigger>
                <TabsTrigger value="wishlist">Lista potrzeb</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4 flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Image Upload */}
                  <div className="space-y-4">
                    <Label>Zdjęcie główne</Label>
                    {imagePreview && (
                      <div className="w-48 h-48 mx-auto rounded-2xl overflow-hidden bg-muted">
                        <img 
                          src={imagePreview} 
                          alt="Podgląd" 
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Form */}
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Imię</FormLabel>
                            <FormControl>
                              <Input placeholder="np. Burek" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="species"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gatunek</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Wybierz gatunek" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Pies">Pies</SelectItem>
                                <SelectItem value="Kot">Kot</SelectItem>
                                <SelectItem value="Inne">Inne</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />


                      <FormField
                        control={form.control}
                        name="birth_date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Data urodzenia</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP", { locale: pl })
                                    ) : (
                                      <span>Wybierz datę</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                  locale={pl}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Opis</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Opisz zwierzę..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={uploading}
                        className="w-full rounded-2xl"
                      >
                        {uploading ? "Zapisywanie..." : "Zapisz zmiany"}
                      </Button>
                    </form>
                  </Form>
                </div>
              </TabsContent>

              <TabsContent value="wishlist" className="flex-1 overflow-y-auto">
                {editingAnimal && (
                  <WishlistBuilder
                    entityId={editingAnimal.id}
                    entityName={editingAnimal.name}
                    entityType="animal"
                  />
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Add Animal Dialog */}
        <Dialog open={addAnimalDialogOpen} onOpenChange={(open) => {
          if (!open) handleCloseAddDialog();
          else setAddAnimalDialogOpen(true);
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col rounded-3xl">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>
                {addAnimalStep === "info" ? "Dodaj nowego podopiecznego" : "Dodaj listę potrzeb"}
              </DialogTitle>
              <DialogDescription>
                {addAnimalStep === "info" 
                  ? "Uzupełnij informacje o zwierzęciu" 
                  : "Dodaj produkty, których potrzebuje Twój podopieczny"}
              </DialogDescription>
            </DialogHeader>

            {addAnimalStep === "info" ? (
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-1">
                  {/* Image Upload */}
                  <div className="space-y-4">
                    <Label>Zdjęcie główne</Label>
                    {imagePreview && (
                      <div className="w-48 h-48 mx-auto rounded-2xl overflow-hidden bg-muted">
                        <img 
                          src={imagePreview} 
                          alt="Podgląd" 
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="pt-4">
                      <Label>Galeria zdjęć ({galleryPreviews.length}/6)</Label>
                      {galleryPreviews.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {galleryPreviews.map((preview, idx) => (
                            <div key={idx} className="relative group">
                              <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted">
                                <img 
                                  src={preview} 
                                  alt={`Galeria ${idx + 1}`} 
                                  className="w-full h-full object-cover object-center"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryImage(idx)}
                                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {galleryPreviews.length < 6 && (
                        <div className="flex items-center gap-2 mt-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleGalleryChange}
                          />
                          <Upload className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Form */}
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onAddAnimalSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Imię</FormLabel>
                            <FormControl>
                              <Input placeholder="np. Burek" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="species"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gatunek</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Wybierz gatunek" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Pies">Pies</SelectItem>
                                <SelectItem value="Kot">Kot</SelectItem>
                                <SelectItem value="Inne">Inne</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />


                      <FormField
                        control={form.control}
                        name="birth_date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Data urodzenia</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP", { locale: pl })
                                    ) : (
                                      <span>Wybierz datę</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                  locale={pl}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Opis</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Opisz zwierzę..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={uploading}
                        className="w-full rounded-2xl"
                      >
                        {uploading ? "Zapisywanie..." : "Dodaj podopiecznego"}
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {newAnimalId && (
                  <WishlistBuilder
                    entityId={newAnimalId}
                    entityName={form.getValues("name")}
                    entityType="animal"
                  />
                )}
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                  <Button variant="outline" onClick={handleCloseAddDialog} className="rounded-2xl">
                    Zakończ
                  </Button>
                </div>
              </div>
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

        {/* Logo Crop Dialog */}
        {logoToCrop && (
          <ImageCropDialog
            open={logoCropDialogOpen}
            onClose={() => {
              setLogoCropDialogOpen(false);
              setLogoToCrop(null);
            }}
            imageSrc={logoToCrop}
            onCropComplete={handleLogoCropComplete}
          />
        )}
      </div>
    </OrgLayout>
  );
}
