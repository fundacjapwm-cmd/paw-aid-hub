import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertCircle, Upload, Download } from "lucide-react";
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

const regonRegex = /^\d{9}$|^\d{14}$/;
const postalCodeRegex = /^\d{2}-\d{3}$/;

const organizationSchema = z.object({
  name: z.string().min(3, "Nazwa musi mieć minimum 3 znaki"),
  nip: z.string()
    .regex(/^\d{10}$/, "NIP musi zawierać 10 cyfr")
    .refine((val) => !val || validateNIP(val), {
      message: "Nieprawidłowa suma kontrolna NIP",
    })
    .optional()
    .or(z.literal("")),
  regon: z.string().regex(regonRegex, "REGON musi zawierać 9 lub 14 cyfr").optional().or(z.literal("")),
  address: z.string().optional(),
  postal_code: z.string().regex(postalCodeRegex, "Kod pocztowy w formacie XX-XXX").optional().or(z.literal("")),
  city: z.string().min(2, "Nazwa miasta").optional().or(z.literal("")),
  province: z.string().optional(),
  bank_account_number: z.string().optional(),
  contact_email: z.string().email("Nieprawidłowy email"),
  contact_phone: z.string().optional(),
  website: z.string().url("Nieprawidłowy URL").optional().or(z.literal("")),
  description: z.string().max(1000, "Opis nie może przekraczać 1000 znaków").optional(),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

interface OrgProfileFormProps {
  organizationId: string;
  isOwner: boolean;
}

export default function OrgProfileForm({ organizationId, isOwner }: OrgProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [fetchingKRS, setFetchingKRS] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

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
        regon: (data as any).regon || "",
        contact_email: data.contact_email,
        contact_phone: data.contact_phone || "",
        address: data.address || "",
        postal_code: (data as any).postal_code || "",
        city: data.city || "",
        province: data.province || "",
        bank_account_number: (data as any).bank_account_number || "",
        website: data.website || "",
        description: data.description || "",
      });

      setLogoUrl(data.logo_url);

      // Check if onboarding is needed
      const incomplete = !data.nip || !data.city || !(data as any).bank_account_number;
      setNeedsOnboarding(incomplete);
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
        if (krsData.regon) form.setValue("regon", krsData.regon);
        if (krsData.address) form.setValue("address", krsData.address);
        if (krsData.city) form.setValue("city", krsData.city);
        if (krsData.postal_code) form.setValue("postal_code", krsData.postal_code);
        if (krsData.province) form.setValue("province", krsData.province);

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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${organizationId}-${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file);

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

    const { error } = await supabase
      .from("organizations")
      .update({
        name: data.name,
        nip: data.nip || null,
        regon: data.regon || null,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone || null,
        address: data.address || null,
        city: data.city || null,
        postal_code: data.postal_code || null,
        province: data.province || null,
        bank_account_number: data.bank_account_number || null,
        website: data.website || null,
        description: data.description || null,
      })
      .eq("id", organizationId);

    setIsLoading(false);

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać zmian",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sukces",
      description: "Profil organizacji został zaktualizowany",
    });

    fetchOrganization();
  };

  return (
    <div className="space-y-6">
      {needsOnboarding && (
        <Alert variant="default" className="border-primary bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="text-foreground">
            <strong>Uzupełnij dane organizacji</strong>, aby móc dodawać zbiórki i zwierzęta.
            Wymagane pola: NIP, Miasto, Numer konta bankowego.
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
            <div className="flex items-center gap-4 mt-2">
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="w-24 h-24 object-cover rounded-xl border border-border"
                />
              )}
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo || !isOwner}
                  className="hidden"
                  id="logo-upload"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("logo-upload")?.click()}
                  disabled={uploadingLogo || !isOwner}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadingLogo ? "Przesyłanie..." : "Zmień logo"}
                </Button>
              </div>
            </div>
          </div>

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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIP *</FormLabel>
                      <FormControl>
                        <Input placeholder="0000000000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="regon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>REGON</FormLabel>
                      <FormControl>
                        <Input placeholder="000000000" {...field} />
                      </FormControl>
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
                      <Input placeholder="ul. Przykładowa 123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="postal_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kod pocztowy</FormLabel>
                      <FormControl>
                        <Input placeholder="00-000" {...field} />
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
                        <Input placeholder="Warszawa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Województwo</FormLabel>
                      <FormControl>
                        <Input placeholder="Mazowieckie" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bank_account_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numer konta bankowego *</FormLabel>
                    <FormControl>
                      <Input placeholder="00 0000 0000 0000 0000 0000 0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email kontaktowy *</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
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
                        <Input placeholder="+48 123 456 789" {...field} />
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
                      <Input type="url" placeholder="https://example.com" {...field} />
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
                      <Textarea rows={5} placeholder="Opowiedz o swojej organizacji..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading} className="w-full rounded-2xl" size="lg">
                {isLoading ? "Zapisywanie..." : "Zapisz zmiany"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
