import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import OrgLayout from "@/components/organization/OrgLayout";
import WishlistBuilder from "@/components/organization/WishlistBuilder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Plus, Pencil, ShoppingCart } from "lucide-react";

const animalSchema = z.object({
  name: z.string().min(2, "Imię musi mieć minimum 2 znaki"),
  species: z.enum(["Pies", "Kot", "Inne"]),
  breed: z.string().optional(),
  age: z.coerce.number().min(0).optional(),
  gender: z.string().optional(),
  description: z.string().optional(),
});

type AnimalFormData = z.infer<typeof animalSchema>;

export default function OrgAnimals() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [animals, setAnimals] = useState<any[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<any | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [wishlistDialogOpen, setWishlistDialogOpen] = useState(false);

  const form = useForm<AnimalFormData>({
    resolver: zodResolver(animalSchema),
    defaultValues: {
      name: "",
      species: "Pies",
      breed: "",
      age: 0,
      gender: "",
      description: "",
    },
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (profile?.role !== "ORG") {
      navigate("/");
      return;
    }

    fetchOrganization();
  }, [user, profile, navigate]);

  const fetchOrganization = async () => {
    const { data: orgUser } = await supabase
      .from("organization_users")
      .select("organization_id, organizations(name)")
      .eq("user_id", user?.id)
      .single();

    if (orgUser) {
      setOrganizationId(orgUser.organization_id);
      setOrganizationName((orgUser.organizations as any).name);
      fetchAnimals(orgUser.organization_id);
    }
  };

  const fetchAnimals = async (orgId: string) => {
    const { data } = await supabase
      .from("animals")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });

    setAnimals(data || []);
  };

  const onSubmit = async (data: AnimalFormData) => {
    try {
      if (!organizationId) return;

      const { error } = await supabase.from("animals").insert({
        ...data,
        organization_id: organizationId,
      } as any);

      if (error) throw error;

      toast.success("Podopieczny został dodany!");
      setDialogOpen(false);
      form.reset();
      fetchAnimals(organizationId);
    } catch (error: any) {
      toast.error("Błąd podczas dodawania: " + error.message);
    }
  };

  const handleWishlistClick = (animal: any) => {
    setSelectedAnimal(animal);
    setWishlistDialogOpen(true);
  };

  return (
    <OrgLayout organizationName={organizationName}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Podopieczni</h2>
            <p className="text-muted-foreground">
              Zarządzaj zwierzętami w Twojej organizacji
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl shadow-soft hover:scale-105 transition-transform">
                <Plus className="mr-2 h-4 w-4" />
                Dodaj podopiecznego
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle>Dodaj nowego podopiecznego</DialogTitle>
                <DialogDescription>
                  Uzupełnij informacje o zwierzęciu
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Imię</FormLabel>
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
                        <FormLabel>Gatunek</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Wybierz gatunek" />
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
                  <FormField
                    control={form.control}
                    name="breed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rasa (opcjonalnie)</FormLabel>
                        <FormControl>
                          <Input placeholder="np. Owczarek niemiecki" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wiek (lata)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Płeć</FormLabel>
                        <FormControl>
                          <Input placeholder="Samiec/Samica" {...field} />
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
                        <FormLabel>Opis</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Opisz podopiecznego..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full rounded-2xl">
                    Dodaj
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="rounded-3xl shadow-card">
          <CardHeader>
            <CardTitle>Lista podopiecznych</CardTitle>
            <CardDescription>
              Kliknij ikonę koszyka, aby zarządzać listą potrzeb zwierzęcia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imię</TableHead>
                  <TableHead>Gatunek</TableHead>
                  <TableHead>Rasa</TableHead>
                  <TableHead>Wiek</TableHead>
                  <TableHead className="text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {animals.map((animal) => (
                  <TableRow key={animal.id}>
                    <TableCell className="font-medium">{animal.name}</TableCell>
                    <TableCell>{animal.species}</TableCell>
                    <TableCell>{animal.breed || "-"}</TableCell>
                    <TableCell>{animal.age || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleWishlistClick(animal)}
                        className="rounded-full hover:scale-110 transition-transform"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={wishlistDialogOpen} onOpenChange={setWishlistDialogOpen}>
        <DialogContent className="max-w-6xl rounded-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lista potrzeb - {selectedAnimal?.name}</DialogTitle>
            <DialogDescription>
              Wybierz produkty z katalogu, których potrzebuje {selectedAnimal?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedAnimal && (
            <WishlistBuilder
              animalId={selectedAnimal.id}
              animalName={selectedAnimal.name}
            />
          )}
        </DialogContent>
      </Dialog>
    </OrgLayout>
  );
}
