import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const productRequestSchema = z.object({
  product_name: z.string().min(3, "Nazwa produktu musi mieć minimum 3 znaki"),
  producer_name: z.string().optional(),
  product_link: z.string().url("Nieprawidłowy link").optional().or(z.literal("")),
  notes: z.string().optional(),
});

type ProductRequestFormData = z.infer<typeof productRequestSchema>;

interface ProductRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProductRequestDialog({
  open,
  onOpenChange,
}: ProductRequestDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductRequestFormData>({
    resolver: zodResolver(productRequestSchema),
    defaultValues: {
      product_name: "",
      producer_name: "",
      product_link: "",
      notes: "",
    },
  });

  const onSubmit = async (data: ProductRequestFormData) => {
    setIsSubmitting(true);

    // Check if product_requests table exists, if not we'll need to create it
    const { error } = await supabase.from("product_requests").insert({
      product_name: data.product_name,
      producer_name: data.producer_name || null,
      product_link: data.product_link || null,
      notes: data.notes || null,
      status: "pending",
    });

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się wysłać zgłoszenia. Skontaktuj się z administratorem.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Zgłoszenie wysłane!",
      description: "Administrator sprawdzi Twoje zgłoszenie i doda produkt do katalogu.",
    });

    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Zgłoś brak produktu</DialogTitle>
          <DialogDescription>
            Nie znalazłeś produktu w katalogu? Zgłoś go, a my dodamy go dla Ciebie.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="product_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nazwa produktu *</FormLabel>
                  <FormControl>
                    <Input placeholder="np. Karma Royal Canin Medium Adult" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="producer_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Producent</FormLabel>
                  <FormControl>
                    <Input placeholder="np. Royal Canin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="product_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link do produktu (opcjonalnie)</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://sklep.pl/produkt"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dodatkowe uwagi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Opcjonalne informacje o produkcie..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Anuluj
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "Wysyłanie..." : "Wyślij zgłoszenie"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
