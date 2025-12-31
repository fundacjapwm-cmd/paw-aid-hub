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
import { Settings, ShoppingBag, Building2, Shield, Eye, EyeOff, Trash2, Clock } from 'lucide-react';
import { LoginHistory } from '@/components/LoginHistory';
import { toast } from '@/hooks/use-toast';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isSigningOutAll, setIsSigningOutAll] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    display_name: '',
    first_name: '',
    last_name: '',
    billing_address: '',
    billing_city: '',
    billing_postal_code: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (profile) {
      // Profile from DB may have additional fields we need to fetch
      fetchProfileDetails();
    }
  }, [profile]);

  const fetchProfileDetails = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, billing_address, billing_city, billing_postal_code')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setProfileForm(prev => ({
          ...prev,
          display_name: profile?.display_name || '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          billing_address: data.billing_address || '',
          billing_city: data.billing_city || '',
          billing_postal_code: data.billing_postal_code || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching profile details:', error);
    }
  };

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
        setOrders(ordersData as any);
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

    try {
      // Update profile with all fields including new billing info
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: profileForm.display_name,
          first_name: profileForm.first_name,
          last_name: profileForm.last_name,
          billing_address: profileForm.billing_address,
          billing_city: profileForm.billing_city,
          billing_postal_code: profileForm.billing_postal_code,
        })
        .eq('id', user!.id);
      
      if (error) throw error;
      
      toast({
        title: "Profil zaktualizowany",
        description: "Zmiany zostały zapisane pomyślnie."
      });
      setIsEditingProfile(false);
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive"
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

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany",
          variant: "destructive"
        });
        return;
      }

      const response = await supabase.functions.invoke('delete-user-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (response.error || response.data?.error) {
        toast({
          title: "Błąd",
          description: response.data?.error || "Nie udało się usunąć konta",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Konto usunięte",
        description: "Twoje konto zostało pomyślnie usunięte"
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Błąd",
        description: "Wystąpił błąd podczas usuwania konta",
        variant: "destructive"
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleSignOutAllDevices = async () => {
    setIsSigningOutAll(true);
    
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        toast({
          title: "Błąd",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Wylogowano ze wszystkich urządzeń",
        description: "Wszystkie sesje zostały zakończone"
      });
      
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out all devices:', error);
      toast({
        title: "Błąd",
        description: "Wystąpił błąd podczas wylogowywania",
        variant: "destructive"
      });
    } finally {
      setIsSigningOutAll(false);
    }
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
    return <div className="md:container md:mx-auto md:px-8 py-8 px-4">Ładowanie...</div>;
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
    <div className="md:container md:mx-auto md:px-8 py-8 px-4 space-y-6">
      {/* Profile Header with editable fields */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
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
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditingProfile(!isEditingProfile)}
            >
              {isEditingProfile ? 'Anuluj' : 'Edytuj profil'}
            </Button>
          </div>
        </CardHeader>
        {isEditingProfile && (
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="first_name">Imię</Label>
                  <Input
                    id="first_name"
                    value={profileForm.first_name}
                    onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                    placeholder="Jan"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Nazwisko</Label>
                  <Input
                    id="last_name"
                    value={profileForm.last_name}
                    onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                    placeholder="Kowalski"
                  />
                </div>
              </div>
              
              <Separator className="my-4" />
              <h3 className="font-medium text-sm text-muted-foreground">Adres do płatności</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="billing_address">Adres</Label>
                  <Input
                    id="billing_address"
                    value={profileForm.billing_address}
                    onChange={(e) => setProfileForm({ ...profileForm, billing_address: e.target.value })}
                    placeholder="ul. Przykładowa 10/5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing_postal_code">Kod pocztowy</Label>
                  <Input
                    id="billing_postal_code"
                    value={profileForm.billing_postal_code}
                    onChange={(e) => setProfileForm({ ...profileForm, billing_postal_code: e.target.value })}
                    placeholder="00-000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing_city">Miasto</Label>
                  <Input
                    id="billing_city"
                    value={profileForm.billing_city}
                    onChange={(e) => setProfileForm({ ...profileForm, billing_city: e.target.value })}
                    placeholder="Warszawa"
                  />
                </div>
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Zapisywanie...' : 'Zapisz zmiany'}
              </Button>
            </form>
          </CardContent>
        )}
      </Card>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
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
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Historia
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Ustawienia
          </TabsTrigger>
        </TabsList>

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

        <TabsContent value="security">
          <LoginHistory />
        </TabsContent>

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

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Wyloguj ze wszystkich urządzeń</h4>
                  <p className="text-sm text-muted-foreground">
                    Zakończ wszystkie aktywne sesje na wszystkich urządzeniach
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline">
                      Wyloguj wszędzie
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Wylogować ze wszystkich urządzeń?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Zostaniesz wylogowany ze wszystkich urządzeń, w tym z tego. Będziesz musiał zalogować się ponownie.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Anuluj</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleSignOutAllDevices}
                        disabled={isSigningOutAll}
                      >
                        {isSigningOutAll ? 'Wylogowywanie...' : 'Tak, wyloguj wszędzie'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-destructive">Usuń konto</h4>
                  <p className="text-sm text-muted-foreground">
                    Trwale usuń swoje konto i wszystkie dane
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Usuń konto
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Czy na pewno chcesz usunąć konto?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Ta akcja jest nieodwracalna. Twoje konto i wszystkie powiązane dane zostaną trwale usunięte.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Anuluj</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={isDeletingAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeletingAccount ? 'Usuwanie...' : 'Tak, usuń konto'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}