import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import OrgLayout from "@/components/organization/OrgLayout";
import OrgProfileForm from "@/components/organization/OrgProfileForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function OrgProfile() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
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
      .select("organization_id, is_owner, organizations(name)")
      .eq("user_id", user?.id)
      .single();

    if (orgUser) {
      setOrganizationId(orgUser.organization_id);
      setIsOwner(orgUser.is_owner || false);
      setOrganizationName((orgUser.organizations as any).name);
    }
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

  if (!user || profile?.role !== "ORG") {
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
          </CardContent>
        </Card>
      </div>
    </OrgLayout>
  );
}
