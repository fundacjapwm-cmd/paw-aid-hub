import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import OrgLayout from "@/components/organization/OrgLayout";
import OrgProfileForm from "@/components/organization/OrgProfileForm";
import ImageCropDialog from "@/components/organization/ImageCropDialog";
import DashboardHeader from "@/components/organization/DashboardHeader";
import DashboardAnimalList from "@/components/organization/DashboardAnimalList";
import AnimalFormDialog, { AnimalFormData } from "@/components/organization/AnimalFormDialog";
import AnimalDeleteDialog from "@/components/organization/AnimalDeleteDialog";
import WishlistBuilder from "@/components/organization/WishlistBuilder";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { useOrgDashboard, AnimalWithStats } from "@/hooks/useOrgDashboard";

export default function OrgDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  // Dialog states
  const [editOrgDialogOpen, setEditOrgDialogOpen] = useState(false);
  const [addAnimalDialogOpen, setAddAnimalDialogOpen] = useState(false);
  const [editAnimalDialogOpen, setEditAnimalDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [logoCropDialogOpen, setLogoCropDialogOpen] = useState(false);
  const [wishlistDialogOpen, setWishlistDialogOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalWithStats | null>(null);
  
  // Animal management states
  const [searchQuery, setSearchQuery] = useState("");
  const [animalToDelete, setAnimalToDelete] = useState<AnimalWithStats | null>(null);
  const [editingAnimal, setEditingAnimal] = useState<AnimalWithStats | null>(null);
  const [newAnimalId, setNewAnimalId] = useState<string | null>(null);
  const [newAnimalName, setNewAnimalName] = useState<string>("");
  const [addAnimalStep, setAddAnimalStep] = useState<"info" | "wishlist">("info");
  
  // Upload states
  const [uploading, setUploading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [logoToCrop, setLogoToCrop] = useState<string | null>(null);

  // Fetch dashboard data
  const { data: dashboardData, refetch } = useOrgDashboard(user?.id);

  const organization = dashboardData?.organization;
  const animals = dashboardData?.animals || [];
  const orgId = organization?.id;

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (profile?.role !== "ORG") {
      navigate("/");
    }
  }, [user, profile, navigate]);

  // Logo handling
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

  // Image handling
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
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
    
    setGalleryFiles([...galleryFiles, ...newFiles]);
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Animal CRUD operations
  const handleDeleteClick = (animal: AnimalWithStats, e: React.MouseEvent) => {
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

  const handleEditClick = (animal: AnimalWithStats, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAnimal(animal);
    setImagePreview(animal.image_url || null);
    setEditAnimalDialogOpen(true);
  };

  const handleAddAnimalSubmit = async (data: AnimalFormData) => {
    if (!orgId) return;

    try {
      setUploading(true);
      let imageUrl = null;

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

      // Upload gallery images
      if (galleryFiles.length > 0 && newAnimal) {
        for (let i = 0; i < galleryFiles.length; i++) {
          const file = galleryFiles[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `animals/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, file);

          if (uploadError) continue;

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
      setNewAnimalName(data.name);
      setAddAnimalStep("wishlist");
      refetch();
    } catch (error: any) {
      toast.error("Błąd podczas dodawania: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEditAnimalSubmit = async (data: AnimalFormData) => {
    if (!editingAnimal || !orgId) return;

    try {
      setUploading(true);
      let imageUrl = editingAnimal.image_url;

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

      const { error } = await supabase.from("animals")
        .update({
          ...data,
          birth_date: data.birth_date ? format(data.birth_date, 'yyyy-MM-dd') : null,
          image_url: imageUrl,
        } as any)
        .eq("id", editingAnimal.id);

      if (error) throw error;

      toast.success("Podopieczny został zaktualizowany!");
      handleCloseEditDialog();
      refetch();
    } catch (error: any) {
      toast.error("Błąd podczas aktualizacji: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCloseAddDialog = () => {
    setAddAnimalDialogOpen(false);
    setNewAnimalId(null);
    setNewAnimalName("");
    setAddAnimalStep("info");
    setImagePreview(null);
    setImageFile(null);
    setGalleryFiles([]);
    setGalleryPreviews([]);
  };

  const handleCloseEditDialog = () => {
    setEditAnimalDialogOpen(false);
    setEditingAnimal(null);
    setImagePreview(null);
    setImageFile(null);
  };

  const handleAnimalClick = (animalId: string) => {
    const animal = animals.find(a => a.id === animalId);
    if (animal) {
      setSelectedAnimal(animal);
      setWishlistDialogOpen(true);
    }
  };

  if (!user || profile?.role !== "ORG") {
    return null;
  }

  return (
    <OrgLayout organizationName={organization?.name || ""}>
      <div className="px-4 md:px-8 py-8 md:py-12 max-w-6xl mx-auto space-y-8 md:space-y-12">
        {/* Organization Header */}
        <DashboardHeader
          organization={organization}
          uploadingLogo={uploadingLogo}
          onLogoSelect={handleLogoSelect}
          onEditClick={() => setEditOrgDialogOpen(true)}
        />

        {/* Animals List */}
        <DashboardAnimalList
          animals={animals}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddClick={() => setAddAnimalDialogOpen(true)}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
          onAnimalClick={handleAnimalClick}
        />
      </div>

      {/* Edit Organization Dialog */}
      <Dialog open={editOrgDialogOpen} onOpenChange={setEditOrgDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edytuj profil organizacji</DialogTitle>
            <DialogDescription>
              Zaktualizuj dane swojej organizacji
            </DialogDescription>
          </DialogHeader>
          {orgId && (
            <OrgProfileForm
              organizationId={orgId}
              isOwner={true}
              onSuccess={() => {
                setEditOrgDialogOpen(false);
                refetch();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Animal Dialog */}
      <AnimalFormDialog
        open={addAnimalDialogOpen}
        onOpenChange={handleCloseAddDialog}
        mode="add"
        animalName={newAnimalName}
        newAnimalId={newAnimalId}
        step={addAnimalStep}
        onStepChange={setAddAnimalStep}
        onSubmit={handleAddAnimalSubmit}
        uploading={uploading}
        imagePreview={imagePreview}
        onImageChange={handleImageChange}
        galleryPreviews={galleryPreviews}
        onGalleryChange={handleGalleryChange}
        onRemoveGalleryImage={handleRemoveGalleryImage}
      />

      {/* Edit Animal Dialog */}
      <AnimalFormDialog
        open={editAnimalDialogOpen}
        onOpenChange={handleCloseEditDialog}
        mode="edit"
        initialData={editingAnimal ? {
          name: editingAnimal.name,
          species: editingAnimal.species,
          description: editingAnimal.description,
          birth_date: editingAnimal.birth_date,
          image_url: editingAnimal.image_url,
        } : undefined}
        onSubmit={handleEditAnimalSubmit}
        uploading={uploading}
        imagePreview={imagePreview}
        onImageChange={handleImageChange}
      />

      {/* Delete Confirmation Dialog */}
      <AnimalDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        animalName={animalToDelete?.name || ""}
        onConfirm={handleDeleteConfirm}
      />

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

      {/* Wishlist Builder Dialog */}
      <Dialog 
        open={wishlistDialogOpen} 
        onOpenChange={(open) => {
          setWishlistDialogOpen(open);
          if (!open) {
            // Refetch dashboard data when closing to update progress bars
            refetch();
          }
        }}
      >
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Koszyk potrzeb: {selectedAnimal?.name}
            </DialogTitle>
            <DialogDescription>
              Dodaj produkty do listy potrzeb dla {selectedAnimal?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedAnimal && (
            <WishlistBuilder
              entityId={selectedAnimal.id}
              entityName={selectedAnimal.name}
              entityType="animal"
            />
          )}
        </DialogContent>
      </Dialog>
    </OrgLayout>
  );
}
