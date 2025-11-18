import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import ProducersProductsTab from '@/components/admin/ProducersProductsTab';
import { 
  Users, 
  Building2, 
  Heart, 
  Package, 
  Factory, 
  ShoppingCart, 
  Activity,
  Plus,
  Edit,
  Trash2,
  Shield,
  Key,
  UserCheck,
  UserX
} from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  slug: string;
  contact_email: string;
  logo_url?: string;
  created_at: string;
}

interface Profile {
  id: string;
  display_name?: string;
  role: 'USER' | 'ORG' | 'ADMIN';
  must_change_password: boolean;
  created_at: string;
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
  organization_id: string;
  organizations?: {
    name: string;
  };
}

interface Producer {
  id: string;
  name: string;
  contact_email?: string;
  contact_phone?: string;
  description?: string;
  active: boolean;
  created_at: string;
}

interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  producer_id: string;
  active: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  active: boolean;
  category_id: string;
  producer_id: string;
  description?: string;
  producers?: {
    name: string;
  };
  product_categories?: {
    name: string;
  };
}

interface ActivityLog {
  id: string;
  action: string;
  table_name: string;
  created_at: string;
  profiles?: {
    display_name?: string;
  };
}

export default function AdminPanel() {
  const { user, profile, loading } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [producers, setProducers] = useState<Producer[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProducerId, setSelectedProducerId] = useState<string | null>(null);

  // Edit dialogs state
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [editingProducer, setEditingProducer] = useState<Producer | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New item forms
  const [newOrg, setNewOrg] = useState({
    name: '',
    slug: '',
    contact_email: '',
    admin_email: '',
    admin_password: ''
  });

  const [newAnimal, setNewAnimal] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    gender: '',
    description: '',
    organization_id: ''
  });

  const [newProducer, setNewProducer] = useState({
    name: '',
    contact_email: '',
    contact_phone: '',
    description: ''
  });

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    unit: 'szt',
    description: '',
    category_id: '',
    producer_id: ''
  });

  // Sprawdź czy użytkownik jest adminem
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-8 w-8 animate-pulse text-primary mx-auto mb-4" />
          <p>Sprawdzanie uprawnień...</p>
        </div>
      </div>
    );
  }

  if (!user || profile?.role !== 'ADMIN') {
    return <Navigate to="/auth" replace />;
  }

  const fetchOrganizations = async () => {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać organizacji",
        variant: "destructive"
      });
    } else {
      setOrganizations(data || []);
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        display_name,
        role,
        must_change_password,
        created_at
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać użytkowników",
        variant: "destructive"
      });
    } else {
      setUsers(data || []);
    }
  };

  const fetchAnimals = async () => {
    const { data, error } = await supabase
      .from('animals')
      .select(`
        *,
        organizations(name)
      `)
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

  const fetchProducers = async () => {
    const { data, error } = await supabase
      .from('producers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać producentów",
        variant: "destructive"
      });
    } else {
      setProducers(data || []);
    }
  };

  const fetchProductCategories = async () => {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać kategorii produktów",
        variant: "destructive"
      });
    } else {
      setProductCategories((data || []) as any);
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
      .order('created_at', { ascending: false });
    
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

  const fetchActivityLogs = async () => {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        id,
        action,
        table_name,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać logów aktywności",
        variant: "destructive"
      });
    } else {
      setActivityLogs((data || []) as any);
    }
  };

  // Organization CRUD
  const createOrganization = async () => {
    if (!newOrg.name || !newOrg.contact_email || !newOrg.admin_email || !newOrg.admin_password) {
      toast({
        title: "Błąd",
        description: "Wszystkie pola są wymagane",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Utwórz organizację
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: newOrg.name,
          slug: newOrg.slug || newOrg.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          contact_email: newOrg.contact_email
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // 2. Wywołaj edge function do utworzenia konta administratora organizacji
      const { data: functionData, error: functionError } = await supabase.functions.invoke('create-org-admin', {
        body: {
          email: newOrg.admin_email,
          password: newOrg.admin_password,
          displayName: `Admin ${newOrg.name}`,
          organizationId: orgData.id
        }
      });

      if (functionError) {
        console.error('Function error:', functionError);
        // Jeśli nie udało się utworzyć użytkownika, usuń organizację
        await supabase.from('organizations').delete().eq('id', orgData.id);
        throw new Error('Nie udało się utworzyć konta administratora organizacji');
      }

      toast({
        title: "Sukces",
        description: `Organizacja ${newOrg.name} została utworzona wraz z kontem administratora`
      });

      setNewOrg({
        name: '',
        slug: '',
        contact_email: '',
        admin_email: '',
        admin_password: ''
      });

      fetchOrganizations();
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  const updateOrganization = async () => {
    if (!editingOrg) return;

    const { error } = await supabase
      .from('organizations')
      .update({
        name: editingOrg.name,
        slug: editingOrg.slug,
        contact_email: editingOrg.contact_email
      })
      .eq('id', editingOrg.id);

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować organizacji",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sukces",
        description: "Organizacja została zaktualizowana"
      });
      setEditingOrg(null);
      fetchOrganizations();
    }
  };

  const deleteOrganization = async (id: string) => {
    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć organizacji",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sukces",
        description: "Organizacja została usunięta"
      });
      fetchOrganizations();
    }
  };

  // Animal CRUD
  const createAnimal = async () => {
    if (!newAnimal.name || !newAnimal.species || !newAnimal.organization_id) {
      toast({
        title: "Błąd",
        description: "Nazwa, gatunek i organizacja są wymagane",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('animals')
      .insert({
        name: newAnimal.name,
        species: newAnimal.species as any,
        breed: newAnimal.breed || null,
        age: newAnimal.age ? parseInt(newAnimal.age) : null,
        gender: newAnimal.gender || null,
        description: newAnimal.description || null,
        organization_id: newAnimal.organization_id
      } as any);

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się dodać zwierzęcia",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sukces",
        description: "Zwierzę zostało dodane"
      });
      setNewAnimal({
        name: '',
        species: '',
        breed: '',
        age: '',
        gender: '',
        description: '',
        organization_id: ''
      });
      fetchAnimals();
    }
  };

  const updateAnimal = async () => {
    if (!editingAnimal) return;

    const { error } = await supabase
      .from('animals')
      .update({
        name: editingAnimal.name,
        species: editingAnimal.species as any,
        breed: editingAnimal.breed,
        age: editingAnimal.age,
        gender: editingAnimal.gender,
        description: editingAnimal.description,
        adoption_status: editingAnimal.adoption_status as any
      })
      .eq('id', editingAnimal.id);

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować zwierzęcia",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sukces",
        description: "Zwierzę zostało zaktualizowane"
      });
      setEditingAnimal(null);
      fetchAnimals();
    }
  };

  const deleteAnimal = async (id: string) => {
    const { error } = await supabase
      .from('animals')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć zwierzęcia",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sukces",
        description: "Zwierzę zostało usunięte"
      });
      fetchAnimals();
    }
  };

  // Producer CRUD
  const createProducer = async () => {
    if (!newProducer.name) {
      toast({
        title: "Błąd",
        description: "Nazwa producenta jest wymagana",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('producers')
      .insert({
        name: newProducer.name,
        contact_email: newProducer.contact_email || null,
        contact_phone: newProducer.contact_phone || null,
        description: newProducer.description || null
      });

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się dodać producenta",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sukces",
        description: "Producent został dodany"
      });
      setNewProducer({
        name: '',
        contact_email: '',
        contact_phone: '',
        description: ''
      });
      fetchProducers();
    }
  };

  const updateProducer = async () => {
    if (!editingProducer) return;

    const { error } = await supabase
      .from('producers')
      .update({
        name: editingProducer.name,
        contact_email: editingProducer.contact_email,
        contact_phone: editingProducer.contact_phone,
        description: editingProducer.description,
        active: editingProducer.active
      })
      .eq('id', editingProducer.id);

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować producenta",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sukces",
        description: "Producent został zaktualizowany"
      });
      setEditingProducer(null);
      fetchProducers();
    }
  };

  const deleteProducer = async (id: string) => {
    const { error } = await supabase
      .from('producers')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć producenta",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sukces",
        description: "Producent został usunięty"
      });
      fetchProducers();
    }
  };

  // Product CRUD
  const createProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category_id || !newProduct.producer_id) {
      toast({
        title: "Błąd",
        description: "Nazwa, cena, kategoria i producent są wymagane",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('products')
      .insert({
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        unit: newProduct.unit,
        description: newProduct.description || null,
        category_id: newProduct.category_id,
        producer_id: newProduct.producer_id
      });

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się dodać produktu",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sukces",
        description: "Produkt został dodany"
      });
      setNewProduct({
        name: '',
        price: '',
        unit: 'szt',
        description: '',
        category_id: '',
        producer_id: ''
      });
      fetchProducts();
    }
  };

  const updateProduct = async () => {
    if (!editingProduct) return;

    const { error } = await supabase
      .from('products')
      .update({
        name: editingProduct.name,
        price: editingProduct.price,
        unit: editingProduct.unit,
        description: editingProduct.description,
        active: editingProduct.active
      })
      .eq('id', editingProduct.id);

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować produktu",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sukces",
        description: "Produkt został zaktualizowany"
      });
      setEditingProduct(null);
      fetchProducts();
    }
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć produktu",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sukces",
        description: "Produkt został usunięty"
      });
      fetchProducts();
    }
  };

  const updateUserRole = async (userId: string, newRole: 'USER' | 'ORG' | 'ADMIN') => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zmienić roli",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sukces",
        description: "Rola została zmieniona"
      });
      fetchUsers();
    }
  };

  useEffect(() => {
    fetchOrganizations();
    fetchUsers();
    fetchAnimals();
    fetchProducers();
    fetchProductCategories();
    fetchProducts();
    fetchActivityLogs();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Panel Administratora</h1>
          <p className="text-muted-foreground">Zarządzanie systemem Fundacji PWM</p>
        </div>
      </div>

      <Tabs defaultValue="organizations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="organizations" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Organizacje
          </TabsTrigger>
          <TabsTrigger value="animals" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Zwierzęta
          </TabsTrigger>
          <TabsTrigger value="producers" className="flex items-center gap-2">
            <Factory className="h-4 w-4" />
            Producenci i Produkty
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Użytkownicy
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Aktywność
          </TabsTrigger>
        </TabsList>

        {/* Organizations Tab */}
        <TabsContent value="organizations">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Dodaj nową organizację
                </CardTitle>
                <CardDescription>
                  Utwórz nową organizację
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="org-name">Nazwa organizacji</Label>
                    <Input
                      id="org-name"
                      value={newOrg.name}
                      onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                      placeholder="Fundacja Ratuj Łapki"
                    />
                  </div>
                  <div>
                    <Label htmlFor="org-slug">Slug (opcjonalny)</Label>
                    <Input
                      id="org-slug"
                      value={newOrg.slug}
                      onChange={(e) => setNewOrg({ ...newOrg, slug: e.target.value })}
                      placeholder="fundacja-ratuj-lapki"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="org-email">Email kontaktowy organizacji</Label>
                  <Input
                    id="org-email"
                    type="email"
                    value={newOrg.contact_email}
                    onChange={(e) => setNewOrg({ ...newOrg, contact_email: e.target.value })}
                    placeholder="kontakt@ratujlapki.pl"
                  />
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Konto administratora organizacji</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="admin-email">Email administratora</Label>
                      <Input
                        id="admin-email"
                        type="email"
                        value={newOrg.admin_email}
                        onChange={(e) => setNewOrg({ ...newOrg, admin_email: e.target.value })}
                        placeholder="admin@ratujlapki.pl"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Ten email będzie używany do logowania
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="admin-password">Hasło startowe</Label>
                      <Input
                        id="admin-password"
                        type="password"
                        value={newOrg.admin_password}
                        onChange={(e) => setNewOrg({ ...newOrg, admin_password: e.target.value })}
                        placeholder="TymczasoweHaslo123"
                        required
                        minLength={6}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Minimum 6 znaków. Użytkownik będzie musiał zmienić hasło przy pierwszym logowaniu.
                      </p>
                    </div>
                  </div>
                </div>
                <Button onClick={createOrganization} disabled={isLoading}>
                  {isLoading ? 'Tworzenie...' : 'Utwórz organizację z kontem administratora'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lista organizacji ({organizations.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {organizations.map((org) => (
                    <div key={org.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{org.name}</h3>
                        <p className="text-sm text-muted-foreground">{org.contact_email}</p>
                        <p className="text-xs text-muted-foreground">Slug: {org.slug}</p>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setEditingOrg(org)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edytuj organizację</DialogTitle>
                              <DialogDescription>Zmień dane organizacji</DialogDescription>
                            </DialogHeader>
                            {editingOrg && (
                              <div className="space-y-4">
                                <div>
                                  <Label>Nazwa</Label>
                                  <Input
                                    value={editingOrg.name}
                                    onChange={(e) => setEditingOrg({...editingOrg, name: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label>Slug</Label>
                                  <Input
                                    value={editingOrg.slug}
                                    onChange={(e) => setEditingOrg({...editingOrg, slug: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label>Email kontaktowy</Label>
                                  <Input
                                    value={editingOrg.contact_email}
                                    onChange={(e) => setEditingOrg({...editingOrg, contact_email: e.target.value})}
                                  />
                                </div>
                                <Button onClick={updateOrganization}>Zapisz zmiany</Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => deleteOrganization(org.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Animals Tab */}
        <TabsContent value="animals">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Dodaj nowe zwierzę
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nazwa</Label>
                    <Input
                      value={newAnimal.name}
                      onChange={(e) => setNewAnimal({ ...newAnimal, name: e.target.value })}
                      placeholder="Burek"
                    />
                  </div>
                  <div>
                    <Label>Gatunek</Label>
                    <Select value={newAnimal.species} onValueChange={(value) => setNewAnimal({ ...newAnimal, species: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz gatunek" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pies">Pies</SelectItem>
                        <SelectItem value="kot">Kot</SelectItem>
                        <SelectItem value="królik">Królik</SelectItem>
                        <SelectItem value="inne">Inne</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Rasa</Label>
                    <Input
                      value={newAnimal.breed}
                      onChange={(e) => setNewAnimal({ ...newAnimal, breed: e.target.value })}
                      placeholder="Labrador"
                    />
                  </div>
                  <div>
                    <Label>Wiek</Label>
                    <Input
                      type="number"
                      value={newAnimal.age}
                      onChange={(e) => setNewAnimal({ ...newAnimal, age: e.target.value })}
                      placeholder="3"
                    />
                  </div>
                  <div>
                    <Label>Płeć</Label>
                    <Select value={newAnimal.gender} onValueChange={(value) => setNewAnimal({ ...newAnimal, gender: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz płeć" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="samiec">Samiec</SelectItem>
                        <SelectItem value="samica">Samica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Organizacja</Label>
                  <Select value={newAnimal.organization_id} onValueChange={(value) => setNewAnimal({ ...newAnimal, organization_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz organizację" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Opis</Label>
                  <Textarea
                    value={newAnimal.description}
                    onChange={(e) => setNewAnimal({ ...newAnimal, description: e.target.value })}
                    placeholder="Opis zwierzęcia..."
                  />
                </div>
                <Button onClick={createAnimal}>Dodaj zwierzę</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Zwierzęta w systemie ({animals.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {animals.map((animal) => (
                    <div key={animal.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{animal.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {animal.species} {animal.breed && `- ${animal.breed}`} 
                          {animal.age && `, ${animal.age} lat`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Organizacja: {animal.organizations?.name}
                        </p>
                        <Badge variant={animal.adoption_status === 'available' ? 'default' : 'secondary'}>
                          {animal.adoption_status}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setEditingAnimal(animal)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edytuj zwierzę</DialogTitle>
                            </DialogHeader>
                            {editingAnimal && (
                              <div className="space-y-4">
                                <div>
                                  <Label>Nazwa</Label>
                                  <Input
                                    value={editingAnimal.name}
                                    onChange={(e) => setEditingAnimal({...editingAnimal, name: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label>Status adopcji</Label>
                                  <Select 
                                    value={editingAnimal.adoption_status} 
                                    onValueChange={(value) => setEditingAnimal({...editingAnimal, adoption_status: value})}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="available">Dostępne</SelectItem>
                                      <SelectItem value="pending">Rezerwacja</SelectItem>
                                      <SelectItem value="adopted">Adoptowane</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button onClick={updateAnimal}>Zapisz zmiany</Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => deleteAnimal(animal.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Producers and Products Tab - Hierarchical View */}
        <TabsContent value="producers">
          <ProducersProductsTab
            producers={producers}
            products={products}
            productCategories={productCategories}
            onCreateProducer={createProducer}
            onUpdateProducer={updateProducer}
            onDeleteProducer={deleteProducer}
            onCreateProduct={createProduct}
            onUpdateProduct={updateProduct}
            onDeleteProduct={deleteProduct}
          />
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Użytkownicy systemu ({users.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{user.display_name || 'Bez nazwy'}</h3>
                      <p className="text-sm text-muted-foreground">ID: {user.id}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'ORG' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                        {user.must_change_password && (
                          <Badge variant="outline">Musi zmienić hasło</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Select value={user.role} onValueChange={(value: 'USER' | 'ORG' | 'ADMIN') => updateUserRole(user.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USER">USER</SelectItem>
                          <SelectItem value="ORG">ORG</SelectItem>
                          <SelectItem value="ADMIN">ADMIN</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Logi aktywności systemu</CardTitle>
              <CardDescription>Ostatnie 50 akcji w systemie</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{log.action} - {log.table_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(log.created_at).toLocaleString('pl-PL')}
                      </p>
                    </div>
                    <Badge variant="outline">
                      <Activity className="h-3 w-3 mr-1" />
                      System
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}