import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
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
  adoption_status: string;
  organizations: {
    name: string;
  };
}

interface Producer {
  id: string;
  name: string;
  contact_email?: string;
  active: boolean;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  active: boolean;
  producers: {
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
  const [products, setProducts] = useState<Product[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Formularz dodawania organizacji
  const [newOrg, setNewOrg] = useState({
    name: '',
    slug: '',
    contact_email: '',
    admin_email: '',
    admin_password: ''
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
        id,
        name,
        species,
        breed,
        age,
        adoption_status,
        organizations!inner(name)
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

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        unit,
        active,
        producers!inner(name)
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
      setActivityLogs(data || []);
    }
  };

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

      // 2. Utwórz konto administratora organizacji
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newOrg.admin_email,
        password: newOrg.admin_password,
        email_confirm: true,
        user_metadata: {
          display_name: `Admin ${newOrg.name}`,
          role: 'ORG'
        }
      });

      if (authError) throw authError;

      // 3. Dodaj użytkownika do organizacji jako właściciela
      const { error: userOrgError } = await supabase
        .from('organization_users')
        .insert({
          user_id: authData.user.id,
          organization_id: orgData.id,
          is_owner: true
        });

      if (userOrgError) throw userOrgError;

      toast({
        title: "Sukces",
        description: `Organizacja ${newOrg.name} została utworzona`
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
        <TabsList className="grid w-full grid-cols-6">
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
            Producenci
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Produkty
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

        <TabsContent value="organizations">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Dodaj nową organizację
                </CardTitle>
                <CardDescription>
                  Utwórz nową organizację z kontem administratora
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="admin-email">Email administratora</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      value={newOrg.admin_email}
                      onChange={(e) => setNewOrg({ ...newOrg, admin_email: e.target.value })}
                      placeholder="admin@ratujlapki.pl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin-password">Hasło startowe</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      value={newOrg.admin_password}
                      onChange={(e) => setNewOrg({ ...newOrg, admin_password: e.target.value })}
                      placeholder="TymczasoweHaslo123"
                    />
                  </div>
                </div>
                <Button onClick={createOrganization} disabled={isLoading}>
                  {isLoading ? 'Tworzenie...' : 'Utwórz organizację'}
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
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <UserCheck className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="animals">
          <Card>
            <CardHeader>
              <CardTitle>Zwierzęta w systemie ({animals.length})</CardTitle>
              <CardDescription>
                Przegląd wszystkich zwierząt przypisanych do organizacji
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {animals.map((animal) => (
                  <div key={animal.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{animal.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {animal.species} {animal.breed && `• ${animal.breed}`} {animal.age && `• ${animal.age} lat`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Organizacja: {animal.organizations?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={animal.adoption_status === 'available' ? 'default' : 'secondary'}>
                        {animal.adoption_status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="producers">
          <Card>
            <CardHeader>
              <CardTitle>Producenci ({producers.length})</CardTitle>
              <CardDescription>
                Zarządzanie producentami produktów dla zwierząt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {producers.map((producer) => (
                  <div key={producer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{producer.name}</h3>
                      {producer.contact_email && (
                        <p className="text-sm text-muted-foreground">{producer.contact_email}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={producer.active ? 'default' : 'secondary'}>
                        {producer.active ? 'Aktywny' : 'Nieaktywny'}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Produkty ({products.length})</CardTitle>
              <CardDescription>
                Katalog produktów dostępnych w sklepie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Producent: {product.producers?.name}
                      </p>
                      <p className="text-sm font-medium text-primary">
                        {product.price.toFixed(2)} zł / {product.unit}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={product.active ? 'default' : 'secondary'}>
                        {product.active ? 'Dostępny' : 'Niedostępny'}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Użytkownicy systemu ({users.length})</CardTitle>
              <CardDescription>
                Zarządzanie kontami użytkowników i uprawnieniami
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{user.display_name || 'Brak nazwy'}</h3>
                      <p className="text-sm text-muted-foreground">ID: {user.id}</p>
                      {user.must_change_password && (
                        <Badge variant="destructive" className="mt-1">
                          Wymaga zmiany hasła
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          user.role === 'ADMIN' ? 'default' : 
                          user.role === 'ORG' ? 'secondary' : 'outline'
                        }
                      >
                        {user.role}
                      </Badge>
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value as any)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="USER">USER</option>
                        <option value="ORG">ORG</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Logi aktywności ({activityLogs.length})</CardTitle>
              <CardDescription>
                Historia zmian wprowadzanych przez administratorów
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activityLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">{log.profiles?.display_name || 'System'}</span>
                        {' '}wykonał{' '}
                        <span className="font-medium">{log.action}</span>
                        {' '}na tabeli{' '}
                        <span className="font-medium">{log.table_name}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString('pl-PL')}
                      </p>
                    </div>
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