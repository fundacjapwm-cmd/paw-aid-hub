import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Building2, Heart, Plus, Edit, Trash2 } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  slug: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  province?: string;
  nip?: string;
  description?: string;
  logo_url?: string;
  website?: string;
}

interface Animal {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  gender?: string;
  adoption_status: string;
  description?: string;
  image_url?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  producers?: { name: string };
  product_categories?: { name: string };
}

interface WishlistItem {
  id: string;
  product_id: string;
  quantity: number;
  priority: number;
  products?: Product;
}

export default function OrganizationDashboard() {
  const { user, profile, loading } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(null);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  const [newAnimal, setNewAnimal] = useState({
    name: '',
    species: 'Pies',
    breed: '',
    age: '',
    gender: 'Samiec',
    description: '',
    image_url: ''
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Ładowanie...</p>
      </div>
    );
  }

  if (!user || profile?.role !== 'ORG') {
    return <Navigate to="/auth" replace />;
  }

  const fetchOrganization = async () => {
    try {
      const { data: orgUser } = await supabase
        .from('organization_users')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (orgUser) {
        const { data: org } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', orgUser.organization_id)
          .single();

        setOrganization(org);
        fetchAnimals(orgUser.organization_id);
      }
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const fetchAnimals = async (orgId: string) => {
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać zwierząt",
        variant: "destructive"
      });
    } else {
      setAnimals(data || []);
    }
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        producers(name),
        product_categories(name)
      `)
      .eq('active', true)
      .order('name');

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać produktów",
        variant: "destructive"
      });
    } else {
      setProducts(data || []);
    }
  };

  const fetchWishlist = async (animalId: string) => {
    const { data, error } = await supabase
      .from('animal_wishlists')
      .select(`
        *,
        products(
          *,
          producers(name),
          product_categories(name)
        )
      `)
      .eq('animal_id', animalId);

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać wishlisty",
        variant: "destructive"
      });
    } else {
      setWishlistItems(data || []);
    }
  };

  useEffect(() => {
    fetchOrganization();
    fetchProducts();

    // Real-time subscriptions for automatic data sync
    const organizationsChannel = supabase
      .channel('org-dashboard-orgs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'organizations' }, () => {
        fetchOrganization();
      })
      .subscribe();

    const animalsChannel = supabase
      .channel('org-dashboard-animals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'animals' }, () => {
        if (organization) {
          fetchAnimals(organization.id);
        }
      })
      .subscribe();

    const productsChannel = supabase
      .channel('org-dashboard-products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProducts();
      })
      .subscribe();

    const wishlistsChannel = supabase
      .channel('org-dashboard-wishlists')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'animal_wishlists' }, () => {
        if (selectedAnimal) {
          fetchWishlist(selectedAnimal);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(organizationsChannel);
      supabase.removeChannel(animalsChannel);
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(wishlistsChannel);
    };
  }, [organization, selectedAnimal]);

  const handleUpdateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: organization.name,
          contact_email: organization.contact_email,
          contact_phone: organization.contact_phone,
          address: organization.address,
          city: organization.city,
          province: organization.province,
          nip: organization.nip,
          description: organization.description,
          website: organization.website
        })
        .eq('id', organization.id);

      if (error) throw error;

      toast({
        title: "Sukces!",
        description: "Dane organizacji zostały zaktualizowane",
      });
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAnimal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('animals')
        .insert([{
          name: newAnimal.name,
          species: newAnimal.species as any,
          breed: newAnimal.breed,
          age: newAnimal.age ? parseInt(newAnimal.age) : null,
          gender: newAnimal.gender,
          description: newAnimal.description,
          image_url: newAnimal.image_url,
          organization_id: organization.id,
          adoption_status: 'Dostępny' as any
        }]);

      if (error) throw error;

      toast({
        title: "Sukces!",
        description: `Zwierzę ${newAnimal.name} zostało dodane`,
      });

      setNewAnimal({ name: '', species: 'Pies', breed: '', age: '', gender: 'Samiec', description: '', image_url: '' });
      fetchAnimals(organization.id);
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAnimal = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć to zwierzę?')) return;

    try {
      const { error } = await supabase
        .from('animals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sukces!",
        description: "Zwierzę zostało usunięte",
      });

      if (organization) {
        fetchAnimals(organization.id);
      }
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleAddToWishlist = async (productId: string) => {
    if (!selectedAnimal) {
      toast({
        title: "Błąd",
        description: "Wybierz zwierzę",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('animal_wishlists')
        .insert({
          animal_id: selectedAnimal,
          product_id: productId,
          quantity: 1,
          priority: 0
        });

      if (error) throw error;

      toast({
        title: "Sukces!",
        description: "Produkt dodany do wishlisty",
      });

      fetchWishlist(selectedAnimal);
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleRemoveFromWishlist = async (id: string) => {
    try {
      const { error } = await supabase
        .from('animal_wishlists')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sukces!",
        description: "Produkt usunięty z wishlisty",
      });

      if (selectedAnimal) {
        fetchWishlist(selectedAnimal);
      }
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Ładowanie danych organizacji...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Panel Organizacji</h1>
        <p className="text-muted-foreground">{organization.name}</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <Building2 className="mr-2 h-4 w-4" />
            Profil organizacji
          </TabsTrigger>
          <TabsTrigger value="animals">
            <Heart className="mr-2 h-4 w-4" />
            Zwierzęta
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informacje o organizacji</CardTitle>
              <CardDescription>
                Uzupełnij dane swojej organizacji
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateOrganization} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nazwa organizacji</Label>
                    <Input
                      id="name"
                      value={organization.name}
                      onChange={(e) => setOrganization({ ...organization, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="nip">NIP</Label>
                    <Input
                      id="nip"
                      value={organization.nip || ''}
                      onChange={(e) => setOrganization({ ...organization, nip: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_email">Email kontaktowy</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={organization.contact_email}
                      onChange={(e) => setOrganization({ ...organization, contact_email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_phone">Telefon</Label>
                    <Input
                      id="contact_phone"
                      value={organization.contact_phone || ''}
                      onChange={(e) => setOrganization({ ...organization, contact_phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Adres</Label>
                    <Input
                      id="address"
                      value={organization.address || ''}
                      onChange={(e) => setOrganization({ ...organization, address: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Miasto</Label>
                    <Input
                      id="city"
                      value={organization.city || ''}
                      onChange={(e) => setOrganization({ ...organization, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="province">Województwo</Label>
                    <Input
                      id="province"
                      value={organization.province || ''}
                      onChange={(e) => setOrganization({ ...organization, province: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Strona WWW</Label>
                    <Input
                      id="website"
                      value={organization.website || ''}
                      onChange={(e) => setOrganization({ ...organization, website: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="description">Opis organizacji</Label>
                    <Textarea
                      id="description"
                      value={organization.description || ''}
                      onChange={(e) => setOrganization({ ...organization, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isLoading}>
                  Zapisz zmiany
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="animals">
          <Card>
            <CardHeader>
              <CardTitle>Dodaj nowe zwierzę</CardTitle>
              <CardDescription>
                Dodaj nowego podopiecznego wymagającego wsparcia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAnimal} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="animal_name">Imię</Label>
                    <Input
                      id="animal_name"
                      value={newAnimal.name}
                      onChange={(e) => setNewAnimal({ ...newAnimal, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="species">Gatunek</Label>
                    <Select
                      value={newAnimal.species}
                      onValueChange={(value) => setNewAnimal({ ...newAnimal, species: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pies">Pies</SelectItem>
                        <SelectItem value="Kot">Kot</SelectItem>
                        <SelectItem value="Koń">Koń</SelectItem>
                        <SelectItem value="Inne">Inne</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="breed">Rasa</Label>
                    <Input
                      id="breed"
                      value={newAnimal.breed}
                      onChange={(e) => setNewAnimal({ ...newAnimal, breed: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Wiek</Label>
                    <Input
                      id="age"
                      type="number"
                      value={newAnimal.age}
                      onChange={(e) => setNewAnimal({ ...newAnimal, age: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Płeć</Label>
                    <Select
                      value={newAnimal.gender}
                      onValueChange={(value) => setNewAnimal({ ...newAnimal, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Samiec">Samiec</SelectItem>
                        <SelectItem value="Samica">Samica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="image_url">URL zdjęcia</Label>
                    <Input
                      id="image_url"
                      value={newAnimal.image_url}
                      onChange={(e) => setNewAnimal({ ...newAnimal, image_url: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="animal_description">Opis</Label>
                    <Textarea
                      id="animal_description"
                      value={newAnimal.description}
                      onChange={(e) => setNewAnimal({ ...newAnimal, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isLoading}>
                  <Plus className="mr-2 h-4 w-4" />
                  Dodaj zwierzę
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Lista zwierząt</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Zdjęcie</TableHead>
                    <TableHead>Imię</TableHead>
                    <TableHead>Gatunek</TableHead>
                    <TableHead>Rasa</TableHead>
                    <TableHead>Wiek</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Wishlist</TableHead>
                    <TableHead>Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {animals.map((animal) => (
                    <TableRow key={animal.id}>
                      <TableCell>
                        {animal.image_url && (
                          <img
                            src={animal.image_url}
                            alt={animal.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{animal.name}</TableCell>
                      <TableCell>{animal.species}</TableCell>
                      <TableCell>{animal.breed}</TableCell>
                      <TableCell>{animal.age}</TableCell>
                      <TableCell>
                        <Badge>{animal.adoption_status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAnimal(animal.id);
                            fetchWishlist(animal.id);
                          }}
                        >
                          Zarządzaj
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteAnimal(animal.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {selectedAnimal && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Wishlist - {animals.find(a => a.id === selectedAnimal)?.name}</CardTitle>
                <CardDescription>
                  Zarządzaj listą potrzebnych produktów
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Dodaj produkt do wishlisty</Label>
                  <Select onValueChange={handleAddToWishlist}>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz produkt" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - {product.price} PLN
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produkt</TableHead>
                      <TableHead>Producent</TableHead>
                      <TableHead>Ilość</TableHead>
                      <TableHead>Cena</TableHead>
                      <TableHead>Akcje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wishlistItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.products?.name}</TableCell>
                        <TableCell>{item.products?.producers?.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.products?.price} PLN</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFromWishlist(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
