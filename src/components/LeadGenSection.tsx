import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validateNIP } from "@/lib/validations/nip";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const leadFormSchema = z.object({
  organizationName: z.string()
    .min(1, "Nazwa organizacji jest wymagana")
    .max(200, "Nazwa organizacji nie może przekraczać 200 znaków"),
  nip: z.string()
    .regex(/^\d{10}$/, "NIP musi zawierać dokładnie 10 cyfr")
    .refine((val) => validateNIP(val), {
      message: "Nieprawidłowy NIP (błąd sumy kontrolnej)"
    }),
  email: z.string()
    .email("Nieprawidłowy format email")
    .max(255, "Email nie może przekraczać 255 znaków"),
  phone: z.string()
    .regex(/^(\+48)?[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}$/, "Nieprawidłowy format numeru telefonu")
});

type LeadFormData = z.infer<typeof leadFormSchema>;

const LeadGenSection = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema)
  });

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('send-lead-email', {
        body: data
      });

      if (error) throw error;

      toast({
        title: "Zgłoszenie wysłane!",
        description: "Skontaktujemy się z Tobą wkrótce.",
      });
      reset();
    } catch (error) {
      console.error('Error sending lead:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się wysłać zgłoszenia. Spróbuj ponownie.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            Chcesz dołączyć do naszych organizacji?
          </h2>
          <p className="text-xl text-muted-foreground">
            Wypełnij krótki formularz i poczekaj na kontakt! Razem możemy więcej.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto p-8 rounded-3xl shadow-card border-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              <Label htmlFor="nip">NIP</Label>
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

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="+48 123 456 789"
                className="rounded-xl"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full rounded-xl font-bold"
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
