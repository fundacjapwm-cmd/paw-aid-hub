import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Upload, Calendar as CalendarIcon, Trash2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import WishlistBuilder from "./WishlistBuilder";

const animalSchema = z.object({
  name: z.string().min(2, "Imię musi mieć minimum 2 znaki"),
  species: z.enum(["Pies", "Kot", "Inne"]),
  description: z.string().optional(),
  birth_date: z.date().optional(),
});

export type AnimalFormData = z.infer<typeof animalSchema>;

interface AnimalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  animalName?: string;
  initialData?: {
    name: string;
    species: string;
    description?: string;
    birth_date?: string;
    image_url?: string;
  };
  newAnimalId?: string | null;
  step?: "info" | "wishlist";
  onStepChange?: (step: "info" | "wishlist") => void;
  onSubmit: (data: AnimalFormData) => Promise<void>;
  uploading: boolean;
  imagePreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  galleryPreviews?: string[];
  onGalleryChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveGalleryImage?: (index: number) => void;
}

export default function AnimalFormDialog({
  open,
  onOpenChange,
  mode,
  animalName,
  initialData,
  newAnimalId,
  step = "info",
  onStepChange,
  onSubmit,
  uploading,
  imagePreview,
  onImageChange,
  galleryPreviews = [],
  onGalleryChange,
  onRemoveGalleryImage,
}: AnimalFormDialogProps) {
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<AnimalFormData>({
    resolver: zodResolver(animalSchema),
    defaultValues: {
      name: "",
      species: "Pies",
      description: "",
      birth_date: undefined,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        species: (initialData.species as "Pies" | "Kot" | "Inne") || "Pies",
        description: initialData.description || "",
        birth_date: initialData.birth_date ? new Date(initialData.birth_date) : undefined,
      });
    } else {
      form.reset({
        name: "",
        species: "Pies",
        description: "",
        birth_date: undefined,
      });
    }
  }, [initialData, form, open]);

  const handleSubmit = async (data: AnimalFormData) => {
    await onSubmit(data);
  };

  const title = mode === "add" ? "Dodaj podopiecznego" : "Edytuj podopiecznego";
  const description =
    mode === "add"
      ? step === "info"
        ? "Wypełnij dane nowego podopiecznego"
        : "Dodaj produkty do listy potrzeb"
      : "Zaktualizuj dane podopiecznego";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {mode === "add" && step === "wishlist" && newAnimalId ? (
          <div className="space-y-4">
            <WishlistBuilder 
              entityId={newAnimalId} 
              entityName={animalName || "Podopieczny"} 
              entityType="animal" 
            />
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => onStepChange?.("info")}>
                Wróć
              </Button>
              <Button onClick={() => onOpenChange(false)}>Zakończ</Button>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Main Image + Name + Species row */}
              <div className="flex gap-6">
                {/* Main Image Upload - clickable */}
                <div className="shrink-0">
                  <Label className="text-sm font-medium mb-2 block">Zdjęcie główne</Label>
                  <input
                    ref={mainImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={onImageChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => mainImageInputRef.current?.click()}
                    className="h-28 w-28 rounded-2xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors overflow-hidden"
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    )}
                  </button>
                </div>

                {/* Name + Species */}
                <div className="flex-1 space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Imię *</FormLabel>
                        <FormControl>
                          <Input placeholder="np. Burek" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="species"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gatunek *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Pies">Pies</SelectItem>
                            <SelectItem value="Kot">Kot</SelectItem>
                            <SelectItem value="Inne">Inne</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Gallery Upload - 6 thumbnail slots */}
              {mode === "add" && onGalleryChange && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Galeria zdjęć (max 6)</Label>
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onGalleryChange}
                    className="hidden"
                  />
                  <div className="flex flex-wrap gap-2">
                    {/* Render existing gallery images */}
                    {galleryPreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <div className="h-16 w-16 rounded-lg border overflow-hidden">
                          <img
                            src={preview}
                            alt={`Gallery ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveGalleryImage?.(index)}
                          className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/90"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {/* Render empty slots */}
                    {Array.from({ length: 6 - galleryPreviews.length }).map((_, index) => (
                      <button
                        key={`empty-${index}`}
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="h-16 w-16 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors"
                      >
                        <Plus className="h-5 w-5 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Birth Date */}
              <FormField
                control={form.control}
                name="birth_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data urodzenia (w przybliżeniu)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: pl })
                            ) : (
                              <span>Wybierz datę</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description - at the bottom */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opis</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Opowiedz coś o tym podopiecznym..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Anuluj
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading
                    ? "Zapisywanie..."
                    : mode === "add"
                    ? "Dalej"
                    : "Zapisz"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
