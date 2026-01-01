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
import TermsAcceptanceDialog from "@/components/organization/TermsAcceptanceDialog";
import { OnboardingProgressBar } from "@/components/organization/OnboardingProgressBar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { useOrgDashboard, AnimalWithStats } from "@/hooks/useOrgDashboard";
import { useOrgOnboarding } from "@/hooks/useOrgOnboarding";
import { compressGalleryImage } from "@/lib/utils/imageCompression";

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
  const [termsAccepted, setTermsAccepted] = useState<boolean | null>(null);
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

  // Check if any animal has wishlist items
  const hasWishlistItems = animals.some(a => (a.wishlistStats?.totalNeeded || 0) > 0);

  // Onboarding hook
  const {
    currentStep: onboardingStep,
    isOnboardingActive,
    targetAnimalName,
    targetAnimalId,
    showCongratulations,
    advanceStep: advanceOnboarding,
    dismissOnboarding,
    clearCongratulations,
  } = useOrgOnboarding({
    organization,
    animalsCount: animals.length,
    hasWishlistItems,
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (profile?.role !== "ORG") {
      navigate("/");
    }
  }, [user, profile, navigate]);

  // Check if terms are accepted
  useEffect(() => {
    if (organization) {
      setTermsAccepted(!!organization.terms_accepted_at);
    }
  }, [organization]);

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
        // Compress image before upload
        const compressedImage = await compressGalleryImage(imageFile);
        const fileName = `${Math.random()}.webp`;
        const filePath = `animals/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, compressedImage);

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
          // Compress each gallery image
          const compressedImage = await compressGalleryImage(file);
          const fileName = `${Math.random()}.webp`;
          const filePath = `animals/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, compressedImage);

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

      setNewAnimalId(newAnimal.id);
      setNewAnimalName(data.name);
      setAddAnimalStep("wishlist");
      refetch();
      // Advance onboarding to wishlist step with animal info
      if (onboardingStep === 'animal') {
        advanceOnboarding(data.name, newAnimal.id);
      }
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
        // Compress image before upload
        const compressedImage = await compressGalleryImage(imageFile);
        const fileName = `${Math.random()}.webp`;
        const filePath = `animals/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, compressedImage);

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

  // Show terms acceptance dialog if terms not accepted
  if (termsAccepted === false && orgId) {
    return (
      <TermsAcceptanceDialog
        organizationId={orgId}
        onAccepted={() => {
          setTermsAccepted(true);
          refetch();
        }}
      />
    );
  }

  // Loading state while checking terms
  if (termsAccepted === null && organization) {
    return null;
  }

  return (
    <OrgLayout organizationName={organization?.name || ""}>
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 md:space-y-12">
        {/* Onboarding Progress Bar */}
        {isOnboardingActive && (
          <OnboardingProgressBar currentStep={onboardingStep} />
        )}

        {/* Organization Header */}
        <DashboardHeader
          organization={organization}
          uploadingLogo={uploadingLogo}
          onLogoSelect={handleLogoSelect}
          onEditClick={() => setEditOrgDialogOpen(true)}
          showOnboardingProfile={isOnboardingActive && onboardingStep === 'profile'}
          onDismissOnboarding={dismissOnboarding}
        />

        {/* Animals List */}
        <DashboardAnimalList
          animals={animals}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddClick={() => setAddAnimalDialogOpen(true)}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
          onAnimalClick={(animalId) => {
            handleAnimalClick(animalId);
            // Clear congratulations message when user clicks on an animal
            if (showCongratulations) {
              clearCongratulations();
            }
            // Advance onboarding when clicking on animal during wishlist step
            if (onboardingStep === 'wishlist') {
              dismissOnboarding();
            }
          }}
          showOnboardingAnimal={isOnboardingActive && onboardingStep === 'animal'}
          showOnboardingWishlist={isOnboardingActive && onboardingStep === 'wishlist'}
          showCongratulations={showCongratulations}
          onboardingAnimalName={targetAnimalName || animals[0]?.name}
          onboardingAnimalId={targetAnimalId}
          onDismissOnboarding={dismissOnboarding}
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
                // Advance onboarding if on profile step
                if (onboardingStep === 'profile') {
                  advanceOnboarding();
                }
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
            // Advance onboarding if on wishlist step
            if (onboardingStep === 'wishlist') {
              advanceOnboarding();
            }
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
