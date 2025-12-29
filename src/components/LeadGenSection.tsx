import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validateNIP } from "@/lib/validations/nip";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const leadFormSchema = z.object({
  organizationName: z.string()
    .min(1, "Nazwa organizacji jest wymagana")
    .max(200, "Nazwa organizacji nie może przekraczać 200 znaków"),
  nip: z.string()
    .trim()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true; // Puste pole jest OK
      if (!/^\d{10}$/.test(val)) return false; // Jeśli wypełnione, musi mieć 10 cyfr
      return validateNIP(val); // Walidacja sumy kontrolnej
    }, {
      message: "NIP musi zawierać dokładnie 10 cyfr i być poprawny"
    }),
  email: z.string()
    .email("Nieprawidłowy format email")
    .max(255, "Email nie może przekraczać 255 znaków"),
  acceptedTerms: z.boolean().refine(val => val === true, {
    message: "Musisz zaakceptować regulamin, aby wysłać zgłoszenie."
  }),
  marketingConsent: z.boolean().optional()
});

type LeadFormData = z.infer<typeof leadFormSchema>;

const LeadGenSection = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      acceptedTerms: false,
      marketingConsent: false
    }
  });

  const acceptedTerms = watch("acceptedTerms");
  const marketingConsent = watch("marketingConsent");

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    try {
      // Call edge function which saves to DB AND sends email notification
      const { data: responseData, error } = await supabase.functions.invoke('send-lead-email', {
        body: {
          organizationName: data.organizationName,
          nip: data.nip || '',
          email: data.email,
          phone: '',
          acceptedTerms: data.acceptedTerms,
          marketingConsent: data.marketingConsent || false
        }
      });

      if (error) throw error;

      toast({
        title: "Zgłoszenie przyjęte! 🎉",
        description: "Dziękujemy! Skontaktujemy się z Tobą wkrótce.",
      });
      
      reset();
    } catch (error) {
      console.error('Error saving lead:', error);
      toast({
        title: "Wystąpił błąd",
        description: "Nie udało się wysłać zgłoszenia. Spróbuj ponownie.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="dolacz" className="py-8 md:py-12 bg-muted/30">
      <div className="md:container md:mx-auto md:px-8 px-4">
        <div className="max-w-3xl mx-auto text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 md:mb-6">
            Chcesz dołączyć do naszych organizacji?
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            Wypełnij krótki formularz i poczekaj na kontakt! Razem możemy więcej.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto p-6 md:p-8 rounded-3xl shadow-card border-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="organizationName">Nazwa organizacji</Label>
                <Input
                  id="organizationName"
                  {...register("organizationName")}
                  placeholder="Fundacja Opieki nad Zwierzętami"
                  className="rounded-xl"
                />
                {errors.organizationName && (
                  <p className="text-sm text-destructive">{errors.organizationName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="kontakt@organizacja.pl"
                  className="rounded-xl"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nip">NIP (opcjonalnie)</Label>
              <Input
                id="nip"
                {...register("nip")}
                placeholder="1234567890"
                maxLength={10}
                className="rounded-xl"
              />
              {errors.nip && (
                <p className="text-sm text-destructive">{errors.nip.message}</p>
              )}
            </div>

            <div className="space-y-4 pt-2">
              {/* Select All Option */}
              <div className="flex items-center space-x-3 pb-2 border-b">
                <Checkbox
                  id="selectAll"
                  checked={acceptedTerms && marketingConsent}
                  onCheckedChange={(checked) => {
                    const isChecked = checked as boolean;
                    setValue("acceptedTerms", isChecked);
                    setValue("marketingConsent", isChecked);
                  }}
                />
                <Label 
                  htmlFor="selectAll"
                  className="text-sm font-medium cursor-pointer"
                >
                  Zaznacz wszystkie zgody
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="acceptedTerms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setValue("acceptedTerms", checked as boolean)}
                  className="mt-1"
                />
                <div className="space-y-1 leading-none">
                  <Label 
                    htmlFor="acceptedTerms"
                    className="text-sm text-muted-foreground font-normal cursor-pointer"
                  >
                    Akceptuję <Link to="/regulamin" className="italic underline hover:text-foreground" target="_blank">Regulamin</Link> i <Link to="/prywatnosc" className="italic underline hover:text-foreground" target="_blank">Politykę Prywatności</Link> serwisu Pączki w Maśle.
                  </Label>
                  {errors.acceptedTerms && (
                    <p className="text-sm text-destructive">{errors.acceptedTerms.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="marketingConsent"
                  checked={marketingConsent}
                  onCheckedChange={(checked) => setValue("marketingConsent", checked as boolean)}
                  className="mt-1"
                />
                <Label 
                  htmlFor="marketingConsent"
                  className="text-sm text-muted-foreground font-normal cursor-pointer"
                >
                  Chcę otrzymywać informacje o nowościach i akcjach promocyjnych.
                </Label>
              </div>
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full font-bold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Wysyłanie...
                </>
              ) : (
                'Wyślij zgłoszenie'
              )}
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
};

export default LeadGenSection;
