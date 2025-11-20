import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Check, X, Eye, EyeOff } from 'lucide-react';

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
  met: boolean;
}

const SetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Musisz być zalogowany, aby zmienić hasło');
        navigate('/auth');
      }
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, [navigate]);
  
  const [requirements, setRequirements] = useState<PasswordRequirement[]>([
    { label: 'Minimum 8 znaków', test: (p) => p.length >= 8, met: false },
    { label: 'Jedna duża litera', test: (p) => /[A-Z]/.test(p), met: false },
    { label: 'Jedna cyfra', test: (p) => /[0-9]/.test(p), met: false },
  ]);

  useEffect(() => {
    // Update requirements based on password
    setRequirements(prev =>
      prev.map(req => ({
        ...req,
        met: req.test(password)
      }))
    );
  }, [password]);

  const allRequirementsMet = requirements.every(req => req.met);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const getPasswordStrength = () => {
    const metCount = requirements.filter(req => req.met).length;
    if (metCount === 0) return { label: '', color: '' };
    if (metCount === 1) return { label: 'Słabe', color: 'text-red-500' };
    if (metCount === 2) return { label: 'Średnie', color: 'text-yellow-500' };
    return { label: 'Silne', color: 'text-green-500' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!allRequirementsMet) {
      toast.error('Hasło nie spełnia wszystkich wymagań');
      return;
    }

    if (!passwordsMatch) {
      toast.error('Hasła nie są identyczne');
      return;
    }

    setIsLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Musisz być zalogowany');
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      // Update profile to remove must_change_password flag
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ must_change_password: false })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }

      toast.success('Hasło zostało zmienione! Zaloguj się ponownie nowym hasłem.');
      
      // Sign out and redirect to login
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error: any) {
      console.error('Error setting password:', error);
      toast.error(error.message || 'Nie udało się zmienić hasła');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Sprawdzanie autoryzacji...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Zmień hasło</CardTitle>
          <CardDescription>
            Ustaw nowe hasło dla swojego konta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password">Hasło</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Wprowadź hasło"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          requirements.filter(r => r.met).length === 1
                            ? 'w-1/3 bg-red-500'
                            : requirements.filter(r => r.met).length === 2
                            ? 'w-2/3 bg-yellow-500'
                            : requirements.filter(r => r.met).length === 3
                            ? 'w-full bg-green-500'
                            : 'w-0'
                        }`}
                      />
                    </div>
                    <span className={`text-sm font-medium ${strength.color}`}>
                      {strength.label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Password Requirements */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Wymagania hasła:</p>
              {requirements.map((req, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    req.met ? 'text-green-600' : 'text-yellow-600'
                  }`}
                >
                  {req.met ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  <span>{req.label}</span>
                </div>
              ))}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Wprowadź hasło ponownie"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {confirmPassword.length > 0 && (
                <div
                  className={`flex items-center gap-2 text-sm ${
                    passwordsMatch ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {passwordsMatch ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Hasła są identyczne</span>
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4" />
                      <span>Hasła nie są identyczne</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={!allRequirementsMet || !passwordsMatch || isLoading}
            >
              {isLoading ? 'Ustawianie hasła...' : 'Ustaw hasło'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetPassword;
