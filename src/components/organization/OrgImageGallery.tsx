import { useState, useEffect } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface OrganizationImage {
  id: string;
  image_url: string;
  display_order: number;
}

interface OrgImageGalleryProps {
  organizationId: string;
  isOwner: boolean;
}

export default function OrgImageGallery({ organizationId, isOwner }: OrgImageGalleryProps) {
  const [images, setImages] = useState<OrganizationImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchImages();
  }, [organizationId]);

  const fetchImages = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("organization_images")
      .select("*")
      .eq("organization_id", organizationId)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching images:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać zdjęć",
        variant: "destructive",
      });
    } else {
      setImages(data || []);
    }
    setIsLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      // Upload each file
      for (const file of Array.from(files)) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${organizationId}-${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `organization-gallery/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        const publicUrl = urlData.publicUrl;

        // Get the next display order
        const maxOrder = images.length > 0 
          ? Math.max(...images.map(img => img.display_order))
          : -1;

        // Insert into database
        const { error: dbError } = await supabase
          .from("organization_images")
          .insert({
            organization_id: organizationId,
            image_url: publicUrl,
            display_order: maxOrder + 1,
          });

        if (dbError) throw dbError;
      }

      toast({
        title: "Sukces",
        description: `Dodano ${files.length} zdjęć do galerii`,
      });

      await fetchImages();
    } catch (error) {
      console.error("Error uploading images:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się przesłać zdjęć",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    const { error } = await supabase
      .from("organization_images")
      .delete()
      .eq("id", imageId);

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć zdjęcia",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sukces",
        description: "Zdjęcie zostało usunięte",
      });
      await fetchImages();
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Galeria organizacji</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Galeria organizacji</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isOwner && (
          <div>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={isUploading}
              className="hidden"
              id="gallery-upload"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById("gallery-upload")?.click()}
              disabled={isUploading}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? "Przesyłanie..." : "Dodaj zdjęcia do galerii"}
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Możesz wybrać wiele zdjęć naraz. Będą one wyświetlane na profilu publicznym organizacji.
            </p>
          </div>
        )}

        {images.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Brak zdjęć w galerii</p>
            {isOwner && <p className="text-sm mt-2">Dodaj pierwsze zdjęcia, aby pokazać swoją organizację</p>}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.image_url}
                  alt="Zdjęcie organizacji"
                  className="w-full h-32 object-cover rounded-lg border border-border"
                />
                {isOwner && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    onClick={() => handleDeleteImage(image.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
