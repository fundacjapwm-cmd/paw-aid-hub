import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertCircle, Upload, Download, CheckCircle2, XCircle } from "lucide-react";
import ImageCropDialog from "./ImageCropDialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { validateNIP } from "@/lib/validations/nip";

const postalCodeRegex = /^\d{2}-\d{3}$/;

const organizationSchema = z.object({
  name: z.string().min(3, "Nazwa organizacji musi mieć minimum 3 znaki"),
  nip: z.string()
    .min(1, "NIP jest wymagany")
    .regex(/^\d{10}$/, "NIP musi zawierać dokładnie 10 cyfr")
    .refine((val) => validateNIP(val), {
      message: "Nieprawidłowy numer NIP (błędna suma kontrolna)",
    }),
  address: z.string().optional().or(z.literal("")),
  postal_code: z.string()
    .regex(postalCodeRegex, "Kod pocztowy musi być w formacie XX-XXX (np. 00-000)")
    .optional()
    .or(z.literal("")),
  city: z.string().min(1, "Miasto jest wymagane"),
  contact_email: z.string().min(1, "Email kontaktowy jest wymagany").email("Nieprawidłowy adres email"),
  contact_phone: z.string().optional().or(z.literal("")),
  website: z.string().url("Nieprawidłowy adres strony (musi zaczynać się od http:// lub https://)").optional().or(z.literal("")),
  description: z.string().max(1000, "Opis nie może przekraczać 1000 znaków").optional().or(z.literal("")),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

interface OrgProfileFormProps {
  organizationId: string;
  isOwner: boolean;
  onSuccess?: () => void;
}

export default function OrgProfileForm({ organizationId, isOwner, onSuccess }: OrgProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [fetchingKRS, setFetchingKRS] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [nipValidation, setNipValidation] = useState<{
    isValid: boolean | null;
    message: string;
  }>({ isValid: null, message: "" });
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
  });

  useEffect(() => {
    fetchOrganization();
  }, [organizationId]);

  const fetchOrganization = async () => {
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", organizationId)
      .single();

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać danych organizacji",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      form.reset({
        name: data.name,
        nip: data.nip || "",
        contact_email: data.contact_email,
        contact_phone: data.contact_phone || "",
        address: data.address || "",
        postal_code: data.postal_code || "",
        city: data.city || "",
        website: data.website || "",
        description: data.description || "",
      });

      setLogoUrl(data.logo_url);

      // Check if onboarding is needed (only NIP and city are required)
      const incomplete = !data.nip || !data.city;
      setNeedsOnboarding(incomplete);
      
      // Validate NIP if it exists
      if (data.nip) {
        validateNipRealtime(data.nip);
      }
    }
  };

  const validateNipRealtime = (nip: string) => {
    // Reset validation if empty
    if (!nip) {
      setNipValidation({ isValid: null, message: "" });
      return;
    }

    // Check format (10 digits)
    if (!/^\d{10}$/.test(nip)) {
      if (nip.length > 0 && nip.length < 10) {
        setNipValidation({ 
          isValid: false, 
          message: `Wpisano ${nip.length}/10 cyfr` 
        });
      } else if (nip.length > 10) {
        setNipValidation({ 
          isValid: false, 
          message: "NIP musi mieć dokładnie 10 cyfr" 
        });
      } else if (!/^\d+$/.test(nip)) {
        setNipValidation({ 
          isValid: false, 
          message: "NIP może zawierać tylko cyfry" 
        });
      }
      return;
    }

    // Validate checksum
    const isValid = validateNIP(nip);
    if (isValid) {
      setNipValidation({ 
        isValid: true, 
        message: "NIP jest poprawny ✓" 
      });
    } else {
      setNipValidation({ 
        isValid: false, 
        message: "Nieprawidłowa suma kontrolna NIP" 
      });
    }
  };

  const handleFetchKRS = async () => {
    const nip = form.getValues("nip");
    
    if (!nip || !/^\d{10}$/.test(nip)) {
      toast({
        title: "Błąd",
        description: "Najpierw wpisz poprawny NIP (10 cyfr)",
        variant: "destructive",
      });
      return;
    }

    setFetchingKRS(true);

    try {
      const { data, error } = await supabase.functions.invoke('fetch-krs-data', {
        body: { nip },
      });

      if (error) throw error;

      if (data.success && data.data) {
        const krsData = data.data;
        
        // Update form with fetched data
        if (krsData.name) form.setValue("name", krsData.name);
        if (krsData.address) form.setValue("address", krsData.address);
        if (krsData.city) form.setValue("city", krsData.city);
        if (krsData.postal_code) form.setValue("postal_code", krsData.postal_code);

        toast({
          title: "Sukces",
          description: "Dane zostały pobrane z rejestru",
        });
      } else {
        toast({
          title: "Nie znaleziono",
          description: data.error || "Nie znaleziono danych dla podanego NIP",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching KRS data:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać danych z rejestru",
        variant: "destructive",
      });
    } finally {
      setFetchingKRS(false);
    }
  };

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Błąd",
        description: "Wybierz plik graficzny (JPG, PNG, itp.)",
        variant: "destructive",
      });
      return;
    }

    // Read file and open crop dialog
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  };

  const handleCropComplete = async (croppedImage: Blob) => {
    setUploadingLogo(true);

    const fileName = `${organizationId}-${Date.now()}.jpg`;
    const filePath = `logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, croppedImage);

    if (uploadError) {
      toast({
        title: "Błąd",
        description: "Nie udało się przesłać logo",
        variant: "destructive",
      });
      setUploadingLogo(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    const { error: updateError } = await supabase
      .from("organizations")
      .update({ logo_url: publicUrl })
      .eq("id", organizationId);

    if (updateError) {
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać logo",
        variant: "destructive",
      });
    } else {
      setLogoUrl(publicUrl);
      toast({
        title: "Sukces",
        description: "Logo zostało zaktualizowane",
      });
    }

    setUploadingLogo(false);
  };

  const onSubmit = async (data: OrganizationFormData) => {
    setIsLoading(true);

    const { data: updateData, error } = await supabase
      .from("organizations")
      .update({
        name: data.name,
        nip: data.nip || null,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone || null,
        address: data.address || null,
        city: data.city || null,
        postal_code: data.postal_code || null,
        website: data.website || null,
        description: data.description || null,
      })
      .eq("id", organizationId)
      .select()
      .single();

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać zmian",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: "Sukces",
      description: "Profil organizacji został zaktualizowany",
    });

    // Odśwież dane
    await fetchOrganization();
    setIsLoading(false);
    
    // Wywołaj callback jeśli istnieje (zamknięcie dialogu)
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="space-y-6">
      {needsOnboarding && (
        <Alert variant="default" className="border-primary bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="text-foreground">
            <strong>Uzupełnij dane organizacji</strong>, aby móc dodawać zbiórki i zwierzęta.
            <br />
            Wymagane pola: <strong>NIP</strong> i <strong>Miasto</strong>.
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Profil Organizacji</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Label>Logo organizacji</Label>
            <div className="flex items-center gap-6 mt-2">
              {logoUrl && (
                <div className="relative">
                  <div className="w-32 h-32 rounded-3xl border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
                    <img
                      src={logoUrl}
                      alt="Logo"
                      className="w-full h-full object-contain p-2 bg-white"
                    />
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoSelect}
                  disabled={uploadingLogo || !isOwner}
                  className="hidden"
                  id="logo-upload"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("logo-upload")?.click()}
                  disabled={uploadingLogo || !isOwner}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {uploadingLogo ? "Przesyłanie..." : logoUrl ? "Zmień logo" : "Dodaj logo"}
                </Button>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Logo będzie wyświetlane jako okrąg. Wybierz plik, a następnie przytnij go i dopasuj.
                </p>
              </div>
            </div>
          </div>

          {/* Crop Dialog */}
          {imageToCrop && (
            <ImageCropDialog
              open={cropDialogOpen}
              onClose={() => {
                setCropDialogOpen(false);
                setImageToCrop(null);
              }}
              imageSrc={imageToCrop}
              onCropComplete={handleCropComplete}
            />
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nazwa organizacji *</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!isOwner} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="nip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIP *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="0000000000" 
                            {...field} 
                            disabled={!isOwner}
                            onChange={(e) => {
                              field.onChange(e);
                              validateNipRealtime(e.target.value);
                            }}
                            className={
                              nipValidation.isValid === true 
                                ? "border-green-500 focus-visible:ring-green-500" 
                                : nipValidation.isValid === false 
                                ? "border-red-500 focus-visible:ring-red-500"
                                : ""
                            }
                          />
                          {nipValidation.isValid !== null && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              {nipValidation.isValid ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                              )}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      {nipValidation.message && (
                        <p className={`text-sm ${nipValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                          {nipValidation.message}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFetchKRS}
                  disabled={fetchingKRS || !isOwner}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  {fetchingKRS ? "Pobieranie..." : "Pobierz dane z KRS"}
                </Button>
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ulica i numer</FormLabel>
                    <FormControl>
                      <Input placeholder="ul. Przykładowa 123" {...field} disabled={!isOwner} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="postal_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kod pocztowy</FormLabel>
                      <FormControl>
                        <Input placeholder="00-000" {...field} disabled={!isOwner} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Miasto *</FormLabel>
                      <FormControl>
                        <Input placeholder="Warszawa" {...field} disabled={!isOwner} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email kontaktowy *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="kontakt@organizacja.pl" {...field} disabled={!isOwner} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefon kontaktowy</FormLabel>
                      <FormControl>
                        <Input placeholder="+48 123 456 789" {...field} disabled={!isOwner} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Strona WWW</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://example.com" {...field} disabled={!isOwner} />
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
                    <FormLabel>Opis organizacji</FormLabel>
                    <FormControl>
                      <Textarea rows={5} placeholder="Opowiedz o swojej organizacji..." {...field} disabled={!isOwner} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading || !isOwner} className="w-full" size="lg">
                {isLoading ? "Zapisywanie..." : "Zapisz zmiany"}
              </Button>
              {!isOwner && (
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Tylko właściciel organizacji może edytować te dane
                </p>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
