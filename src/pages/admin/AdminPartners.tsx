import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical, ExternalLink, Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

interface Partner {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  display_order: number;
  active: boolean;
}

export default function AdminPartners() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletePartnerId, setDeletePartnerId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    logo_url: "",
    website_url: "",
  });

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ["admin-partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as Partner[];
    },
  });

  const uploadLogo = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from("partner-logos")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("partner-logos")
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const addPartnerMutation = useMutation({
    mutationFn: async (data: { name: string; logo_url: string; website_url: string; file?: File }) => {
      setIsUploading(true);
      
      let logoUrl = data.logo_url;
      
      // Upload file if provided
      if (data.file) {
        logoUrl = await uploadLogo(data.file);
      }

      const maxOrder = partners.length > 0 
        ? Math.max(...partners.map(p => p.display_order)) + 1 
        : 0;

      const { error } = await supabase.from("partners").insert({
        name: data.name,
        logo_url: logoUrl || null,
        website_url: data.website_url || null,
        display_order: maxOrder,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      toast.success("Partner dodany");
      handleCloseDialog();
    },
    onError: () => {
      toast.error("Błąd podczas dodawania partnera");
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from("partners")
        .update({ active })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
      queryClient.invalidateQueries({ queryKey: ["partners"] });
    },
  });

  const deletePartnerMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("partners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      toast.success("Partner usunięty");
      setDeletePartnerId(null);
    },
    onError: () => {
      toast.error("Błąd podczas usuwania partnera");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Wybierz plik obrazu");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Plik jest za duży (max 5MB)");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setFormData({ ...formData, logo_url: "" });
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({ name: "", logo_url: "", website_url: "" });
    handleRemoveFile();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Nazwa jest wymagana");
      return;
    }
    addPartnerMutation.mutate({
      ...formData,
      file: selectedFile || undefined,
    });
  };

  if (isLoading) {
    return <div className="p-6">Ładowanie...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Partnerzy</h2>
          <p className="text-sm text-muted-foreground">
            Zarządzaj partnerami wyświetlanymi na stronie głównej
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => open ? setIsDialogOpen(true) : handleCloseDialog()}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Dodaj partnera
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dodaj nowego partnera</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nazwa *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nazwa partnera"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Logo</Label>
                
                {/* File upload area */}
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                  {previewUrl ? (
                    <div className="flex items-center justify-center gap-4">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="h-16 w-auto object-contain"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleRemoveFile}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Wybierz plik
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">PNG, JPG, SVG do 5MB</p>
                    </div>
                  )}
                </div>
                
                {/* Or URL input */}
                {!selectedFile && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex-1 h-px bg-border" />
                      <span>lub wklej URL</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    <Input
                      id="logo_url"
                      value={formData.logo_url}
                      onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website_url">URL strony partnera</Label>
                <Input
                  id="website_url"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  placeholder="https://partner.com"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Anuluj
                </Button>
                <Button type="submit" disabled={addPartnerMutation.isPending || isUploading}>
                  {isUploading ? "Przesyłanie..." : addPartnerMutation.isPending ? "Dodawanie..." : "Dodaj"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {partners.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            Brak partnerów. Dodaj pierwszego partnera.
          </Card>
        ) : (
          partners.map((partner) => (
            <Card key={partner.id} className="p-4">
              <div className="flex items-center gap-4">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                
                {partner.logo_url ? (
                  <img
                    src={partner.logo_url}
                    alt={partner.name}
                    className="h-12 w-20 object-contain bg-muted rounded"
                  />
                ) : (
                  <div className="h-12 w-20 bg-muted rounded flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">Brak logo</span>
                  </div>
                )}
                
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{partner.name}</h3>
                  {partner.website_url && (
                    <a
                      href={partner.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {partner.website_url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={partner.active}
                      onCheckedChange={(checked) =>
                        toggleActiveMutation.mutate({ id: partner.id, active: checked })
                      }
                    />
                    <span className="text-sm text-muted-foreground">
                      {partner.active ? "Aktywny" : "Nieaktywny"}
                    </span>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeletePartnerId(partner.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <AlertDialog open={!!deletePartnerId} onOpenChange={() => setDeletePartnerId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usuń partnera</AlertDialogTitle>
            <AlertDialogDescription>
              Czy na pewno chcesz usunąć tego partnera? Ta akcja jest nieodwracalna.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deletePartnerId && deletePartnerMutation.mutate(deletePartnerId)}
            >
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
