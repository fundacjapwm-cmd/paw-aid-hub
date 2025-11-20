import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import OrgLayout from "@/components/organization/OrgLayout";
import WishlistBuilder from "@/components/organization/WishlistBuilder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Plus, Pencil, ShoppingCart, AlertCircle, Upload } from "lucide-react";

const animalSchema = z.object({
  name: z.string().min(2, "Imię musi mieć minimum 2 znaki"),
  species: z.enum(["Pies", "Kot", "Inne"]),
  breed: z.string().optional(),
  age: z.coerce.number().min(0).optional(),
  gender: z.string().optional(),
  description: z.string().optional(),
});

type AnimalFormData = z.infer<typeof animalSchema>;

export default function OrgAnimals() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [animals, setAnimals] = useState<any[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<any | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState("");
  const [organization, setOrganization] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [wishlistDialogOpen, setWishlistDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const form = useForm<AnimalFormData>({
    resolver: zodResolver(animalSchema),
    defaultValues: {
      name: "",
      species: "Pies",
      breed: "",
      age: 0,
      gender: "",
      description: "",
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

    fetchOrganization();
  }, [user, profile, navigate]);

  const fetchOrganization = async () => {
    const { data: orgUser } = await supabase
      .from("organization_users")
      .select("organization_id, organizations(*)")
      .eq("user_id", user?.id)
      .single();

    if (orgUser) {
      setOrganizationId(orgUser.organization_id);
      const org = orgUser.organizations as any;
      setOrganizationName(org.name);
      setOrganization(org);
      fetchAnimals(orgUser.organization_id);
    }
  };

  const fetchAnimals = async (orgId: string) => {
    const { data } = await supabase
      .from("animals")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });

    setAnimals(data || []);
  };

  const onSubmit = async (data: AnimalFormData) => {
    try {
      if (!organizationId) return;

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
          organization_id: organizationId,
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

          // Insert to animal_images table
          await supabase.from('animal_images').insert({
            animal_id: newAnimal.id,
            image_url: publicUrl,
            display_order: i,
          });
        }
      }

      toast.success("Podopieczny został dodany!");
      setDialogOpen(false);
      form.reset();
      setImagePreview(null);
      setImageFile(null);
      setGalleryFiles([]);
      setGalleryPreviews([]);
      setUploading(false);
      fetchAnimals(organizationId);
    } catch (error: any) {
      toast.error("Błąd podczas dodawania: " + error.message);
      setUploading(false);
    }
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
    const files = Array.from(e.target.files || []);
    if (files.length > 6) {
      toast.error("Maksymalnie 6 zdjęć w galerii");
      return;
    }
    
    setGalleryFiles(files);
    
    // Create previews
    const previews: string[] = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result as string);
        if (previews.length === files.length) {
          setGalleryPreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleWishlistClick = (animal: any) => {
    setSelectedAnimal(animal);
    setWishlistDialogOpen(true);
  };

  if (!user || profile?.role !== "ORG") {
    return null;
  }

  const isProfileComplete = organization?.nip && organization?.city;

  return (
    <OrgLayout organizationName={organizationName}>
      <div className="space-y-6">
        {/* Profile Validation Alert */}
        {!isProfileComplete && (
          <Alert variant="destructive" className="rounded-2xl">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Uzupełnij NIP i Miasto w zakładce Ustawienia, aby móc dodawać zwierzęta.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Podopieczni</h2>
            <p className="text-muted-foreground">
              Zarządzaj zwierzętami w Twojej organizacji
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                disabled={!isProfileComplete}
                className="rounded-2xl shadow-soft hover:scale-105 transition-transform"
              >
                <Plus className="mr-2 h-4 w-4" />
                Dodaj podopiecznego
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Dodaj nowego podopiecznego</DialogTitle>
                <DialogDescription>
                  Uzupełnij informacje o zwierzęciu
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Main Image Upload */}
                  <div className="space-y-2">
                    <FormLabel>Zdjęcie główne</FormLabel>
                    <div className="flex flex-col items-center gap-4">
                      {imagePreview && (
                        <Avatar className="h-32 w-32">
                          <AvatarImage src={imagePreview} alt="Podgląd" />
                          <AvatarFallback>Zdjęcie</AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex items-center gap-2 w-full">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="max-w-xs"
                        />
                        <Upload className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  {/* Gallery Images Upload */}
                  <div className="space-y-2">
                    <FormLabel>Galeria zdjęć (max 6)</FormLabel>
                    <div className="flex flex-col gap-4">
                      {galleryPreviews.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {galleryPreviews.map((preview, idx) => (
                            <Avatar key={idx} className="h-20 w-20">
                              <AvatarImage src={preview} alt={`Galeria ${idx + 1}`} />
                              <AvatarFallback>{idx + 1}</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2 w-full">
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleGalleryChange}
                          className="max-w-xs"
                        />
                        <Upload className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Wybierz do 6 zdjęć dla galerii
                      </p>
                    </div>
                  </div>

                  {/* ... keep existing code (all form fields) */}
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    name="breed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rasa (opcjonalnie)</FormLabel>
                        <FormControl>
                          <Input placeholder="np. Owczarek niemiecki" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wiek (lata)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Płeć</FormLabel>
                        <FormControl>
                          <Input placeholder="Samiec/Samica" {...field} />
                        </FormControl>
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
                          <Textarea placeholder="Opisz podopiecznego..." {...field} />
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
                    {uploading ? "Przesyłanie..." : "Dodaj"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="rounded-3xl shadow-card">
          <CardHeader>
            <CardTitle>Lista podopiecznych</CardTitle>
            <CardDescription>
              Kliknij ikonę koszyka, aby zarządzać listą potrzeb zwierzęcia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zdjęcie</TableHead>
                  <TableHead>Imię</TableHead>
                  <TableHead>Gatunek</TableHead>
                  <TableHead>Rasa</TableHead>
                  <TableHead>Wiek</TableHead>
                  <TableHead className="text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {animals.map((animal) => (
                  <TableRow key={animal.id}>
                    <TableCell>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={animal.image_url || ''} alt={animal.name} />
                        <AvatarFallback>
                          {animal.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{animal.name}</TableCell>
                    <TableCell>{animal.species}</TableCell>
                    <TableCell>{animal.breed || "-"}</TableCell>
                    <TableCell>{animal.age || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => handleWishlistClick(animal)}
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={wishlistDialogOpen} onOpenChange={setWishlistDialogOpen}>
          <DialogContent className="max-w-4xl rounded-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Lista potrzeb dla {selectedAnimal?.name}</DialogTitle>
              <DialogDescription>
                Dodaj lub usuń produkty z listy potrzeb
              </DialogDescription>
            </DialogHeader>
            {selectedAnimal && (
              <WishlistBuilder
                animalId={selectedAnimal.id}
                animalName={selectedAnimal.name}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </OrgLayout>
  );
}
