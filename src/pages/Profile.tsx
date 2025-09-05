import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { User, Settings, ShoppingBag, Building2, Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  contact_email: string;
  logo_url: string;
  is_owner: boolean;
}

export default function Profile() {
  const { user, profile, loading, updateProfile, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    display_name: '',
    avatar_url: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (profile) {
      setProfileForm({
        display_name: profile.display_name || '',
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Load orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersData) {
        setOrders(ordersData);
      }

      // Load organizations (if user is ORG role)
      if (profile?.role === 'ORG' || profile?.role === 'ADMIN') {
        const { data: orgData } = await supabase
          .from('organization_users')
          .select(`
            organization_id,
            is_owner,
            organizations (
              id,
              name,
              slug,
              contact_email,
              logo_url
            )
          `)
          .eq('user_id', user.id);

        if (orgData) {
          const orgs = orgData.map(item => ({
            ...item.organizations,
            is_owner: item.is_owner
          })) as Organization[];
          setOrganizations(orgs);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await updateProfile(profileForm);
    
    if (error) {
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Profil zaktualizowany",
        description: "Zmiany zostały zapisane pomyślnie."
      });
    }
    
    setIsLoading(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Błąd",
        description: "Nowe hasła nie są identyczne",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: passwordForm.newPassword
    });

    if (error) {
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Hasło zmienione",
        description: "Twoje hasło zostało pomyślnie zaktualizowane."
      });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
      
      // Mark password as changed if this was a forced change
      if (profile?.must_change_password) {
        await updateProfile({ must_change_password: false });
      }
    }
    
    setIsLoading(false);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'destructive';
      case 'ORG': return 'default';
      case 'USER': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrator';
      case 'ORG': return 'Organizacja';
      case 'USER': return 'Użytkownik';
      default: return role;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="container mx-auto py-8">Ładowanie...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Force password change if required
  if (profile?.must_change_password) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Wymagana zmiana hasła
            </CardTitle>
            <CardDescription>
              Musisz zmienić hasło przed kontynuowaniem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nowe hasło</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Potwierdź nowe hasło</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Zmienianie...' : 'Zmień hasło'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback>
                {profile?.display_name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">
                {profile?.display_name || user.email}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getRoleBadgeVariant(profile?.role || 'USER')}>
                  {getRoleLabel(profile?.role || 'USER')}
                </Badge>
                <span className="text-sm text-muted-foreground">{user.email}</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Zamówienia
          </TabsTrigger>
          {(profile?.role === 'ORG' || profile?.role === 'ADMIN') && (
            <TabsTrigger value="organizations" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Organizacje
            </TabsTrigger>
          )}
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Ustawienia
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informacje o profilu</CardTitle>
              <CardDescription>
                Zarządzaj swoimi danymi osobowymi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display_name">Nazwa wyświetlana</Label>
                  <Input
                    id="display_name"
                    value={profileForm.display_name}
                    onChange={(e) => setProfileForm({ ...profileForm, display_name: e.target.value })}
                    placeholder="Twoja nazwa"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar_url">URL awatara</Label>
                  <Input
                    id="avatar_url"
                    value={profileForm.avatar_url}
                    onChange={(e) => setProfileForm({ ...profileForm, avatar_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Zapisywanie...' : 'Zapisz zmiany'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Historia zamówień</CardTitle>
              <CardDescription>
                Twoje poprzednie zakupy
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nie masz jeszcze żadnych zamówień
                </p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">#{order.order_number}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(order.total_amount)}</p>
                        <Badge variant="outline">{order.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {(profile?.role === 'ORG' || profile?.role === 'ADMIN') && (
          <TabsContent value="organizations">
            <Card>
              <CardHeader>
                <CardTitle>Moje organizacje</CardTitle>
                <CardDescription>
                  Organizacje, do których należysz
                </CardDescription>
              </CardHeader>
              <CardContent>
                {organizations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nie należysz do żadnej organizacji
                  </p>
                ) : (
                  <div className="space-y-4">
                    {organizations.map((org) => (
                      <div key={org.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <Avatar>
                          <AvatarImage src={org.logo_url} />
                          <AvatarFallback>{org.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-medium">{org.name}</h4>
                          <p className="text-sm text-muted-foreground">{org.contact_email}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={org.is_owner ? 'default' : 'secondary'}>
                            {org.is_owner ? 'Właściciel' : 'Członek'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Ustawienia konta</CardTitle>
              <CardDescription>
                Zarządzaj bezpieczeństwem konta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Zmiana hasła</h4>
                    <p className="text-sm text-muted-foreground">
                      Zaktualizuj hasło do swojego konta
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    className="flex items-center gap-2"
                  >
                    {showPasswordForm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {showPasswordForm ? 'Ukryj' : 'Zmień hasło'}
                  </Button>
                </div>

                {showPasswordForm && (
                  <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nowe hasło</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Potwierdź nowe hasło</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        required
                      />
                    </div>

                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Zmienianie...' : 'Zmień hasło'}
                    </Button>
                  </form>
                )}
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Wyloguj się</h4>
                  <p className="text-sm text-muted-foreground">
                    Zakończ bieżącą sesję
                  </p>
                </div>
                <Button variant="destructive" onClick={signOut}>
                  Wyloguj się
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}