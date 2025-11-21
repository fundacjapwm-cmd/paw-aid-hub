import { Heart, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import contactDog from "@/assets/contact-dog.png";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Imię jest wymagane")
    .max(100, "Imię jest za długie"),
  email: z.string()
    .trim()
    .email("Nieprawidłowy adres email")
    .max(255, "Email jest za długi"),
  message: z.string()
    .trim()
    .min(1, "Wiadomość jest wymagana")
    .max(2000, "Wiadomość jest za długa"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const Kontakt = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const result = contactSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof ContactFormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast({
        title: "Błąd walidacji",
        description: "Sprawdź poprawność wprowadzonych danych",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke("send-contact-form", {
        body: result.data,
      });

      if (error) throw error;

      toast({
        title: "Wiadomość wysłana!",
        description: "Dziękujemy za kontakt. Odpowiemy najszybciej jak to możliwe.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        message: "",
      });
      setErrors({});
    } catch (error: any) {
      console.error("Error sending contact form:", error);
      toast({
        title: "Błąd wysyłania",
        description: error.message || "Nie udało się wysłać wiadomości. Spróbuj ponownie później.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Header Section */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Kontakt
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Masz pytania lub chcesz nawiązać współpracę? Skontaktuj się z nami! 💌
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-16">
              {/* Contact Form */}
              <div>
                <div className="bg-white rounded-3xl p-8 shadow-card">
                  <h2 className="text-2xl font-bold text-foreground mb-6">
                    Napisz do nas
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    Jesteśmy tu aby odpowiedzieć na wszystkie Twoje pytania i pomysły.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Imię*</Label>
                      <Input 
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Twoje imię" 
                        className="rounded-xl border-2 focus:border-primary"
                        disabled={isSubmitting}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail*</Label>
                      <Input 
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="twoj@email.pl" 
                        className="rounded-xl border-2 focus:border-primary"
                        disabled={isSubmitting}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Zacznij pisać wiadomość...*</Label>
                      <Textarea 
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        placeholder="Opisz swoją sprawę, pytanie lub pomysł..."
                        rows={6}
                        className="rounded-xl border-2 focus:border-primary resize-none"
                        disabled={isSubmitting}
                      />
                      {errors.message && (
                        <p className="text-sm text-destructive">{errors.message}</p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full rounded-xl font-bold" 
                      size="lg"
                      disabled={isSubmitting}
                    >
                      <Send className="h-5 w-5 mr-2" />
                      {isSubmitting ? "Wysyłanie..." : "Wyślij"}
                    </Button>
                  </form>
                </div>
              </div>

              {/* Animal Image */}
              <div className="space-y-8">
                {/* Happy Dog Image */}
                <div className="bg-white rounded-3xl p-8 shadow-card text-center">
                  <div className="mb-6 relative overflow-hidden rounded-3xl">
                    <img 
                      src={contactDog} 
                      alt="Szczęśliwy pies"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    Czekamy na Twój kontakt! 🐾
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Razem możemy pomóc jeszcze większej liczbie zwierząt
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-foreground/5 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-6 w-6 text-primary fill-current" />
            <span className="text-lg font-bold text-primary">Pączki w Maśle</span>
          </div>
          <p className="text-muted-foreground">
            &copy; 2024 Fundacja Pączki w Maśle. Wszystkie prawa zastrzeżone.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Kontakt;