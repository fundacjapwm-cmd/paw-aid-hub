import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserOrganization } from "@/hooks/useUserOrganization";
import OrgLayout from "@/components/organization/OrgLayout";
import OrgProfileForm from "@/components/organization/OrgProfileForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Shield, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { LoginHistory } from "@/components/LoginHistory";
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

export default function OrgProfile() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const { hasOrganization, isOwner, organization, loading: orgLoading } = useUserOrganization();
  const navigate = useNavigate();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isSigningOutAll, setIsSigningOutAll] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Wait for organization loading to complete
    if (orgLoading) return;

    // Allow access if user has ORG role OR is assigned to an organization
    const canAccess = profile?.role === "ORG" || hasOrganization;
    if (!canAccess) {
      navigate("/");
      return;
    }

    // Set organization data from hook
    if (organization) {
      setOrganizationId(organization.organization_id);
      setOrganizationName(organization.organization_name || "");
    }
  }, [user, profile, hasOrganization, orgLoading, organization, navigate]);


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

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Błąd",
        description: "Hasło musi mieć minimum 6 znaków",
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
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
      
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

  // Wait for loading or redirect if no access
  const canAccess = profile?.role === "ORG" || hasOrganization;
  if (!user || orgLoading || !canAccess) {
    return null;
  }

  return (
    <OrgLayout organizationName={organizationName}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 sm:mb-3 md:mb-4">
            Profil Organizacji
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
            Zarządzaj danymi swojej organizacji
          </p>
        </div>

        {organizationId && (
          <OrgProfileForm organizationId={organizationId} isOwner={isOwner} />
        )}

        {/* Account Settings Section */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Ustawienia konta
            </CardTitle>
            <CardDescription>
              Zarządzaj bezpieczeństwem swojego konta
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
                      placeholder="Minimum 6 znaków"
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

        {/* Login History */}
        <LoginHistory />
      </div>
    </OrgLayout>
  );
}
