import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Heart, User, Mail, Lock, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const emailSchema = z.string().trim().email({ message: "Nieprawidłowy adres email" });

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const confirmed = searchParams.get('confirmed');
  const { signIn, signUp, user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  
  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });

  // Check for password recovery from email link
  useEffect(() => {
    const checkRecoverySession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // If user came from password reset email, Supabase will auto-login and add access_token to URL
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get('type');
      
      if (type === 'recovery' || (session && window.location.hash.includes('type=recovery'))) {
        console.log('Password recovery detected');
        setShowResetForm(true);
      }
    };
    
    checkRecoverySession();
  }, []);

  // Redirect if already logged in (but not during password reset)
  useEffect(() => {
    const checkUserAndRedirect = async () => {
      if (user && !loading && !showResetForm) {
        // Pobierz profil, aby sprawdzić rolę i wymuszenie zmiany hasła
        const { data: profileData } = await supabase
          .from('profiles')
          .select('must_change_password, role')
          .eq('id', user.id)
          .single();
        
        // 1. Priorytet: Wymuszona zmiana hasła
        if (profileData?.must_change_password) {
          navigate('/set-password');
          return;
        }

        // 2. Sprawdź czy jest parametr ?redirect (np. z koszyka)
        const redirectParam = searchParams.get('redirect');
        if (redirectParam) {
          navigate(redirectParam);
          return;
        }

        // 3. Inteligentne przekierowanie na podstawie roli
        switch (profileData?.role) {
          case 'ADMIN':
            navigate('/admin');
            break;
          case 'ORG':
            navigate('/organizacja');
            break;
          default:
            // Dla roli USER (Darczyńca)
            navigate('/profil');
            break;
        }
      }
    };
    
    checkUserAndRedirect();
  }, [user, loading, navigate, searchParams, showResetForm]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { error } = await signIn(loginForm.email, loginForm.password);
    
    if (error) {
      setError(error.message);
      toast({
        title: "Błąd logowania",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Zalogowano pomyślnie",
        description: "Witamy z powrotem!"
      });
    }
    
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Hasła nie są identyczne');
      setIsLoading(false);
      return;
    }

    if (signupForm.password.length < 6) {
      setError('Hasło musi mieć co najmniej 6 znaków');
      setIsLoading(false);
      return;
    }

    const { error } = await signUp(
      signupForm.email, 
      signupForm.password,
      signupForm.displayName
    );
    
    if (error) {
      setError(error.message);
      toast({
        title: "Błąd rejestracji",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Konto utworzone!",
        description: "Sprawdź email aby potwierdzić konto. Po potwierdzeniu będziesz mógł się zalogować."
      });
    }
    
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate email
    const validation = emailSchema.safeParse(resetEmail);
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      setIsLoading(false);
      return;
    }

    try {
      // Get the correct app URL from environment or construct it
      const appUrl = window.location.origin;
      const redirectUrl = `${appUrl}/set-password`;
      
      console.log('Reset password redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      setResetSent(true);
      toast({
        title: "Email wysłany!",
        description: "Sprawdź swoją skrzynkę email i kliknij w link aby zresetować hasło.",
      });
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (newPassword !== confirmNewPassword) {
      setError('Hasła nie są identyczne');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Hasło musi mieć co najmniej 6 znaków');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Hasło zmienione!",
        description: "Twoje hasło zostało pomyślnie zmienione. Możesz się teraz zalogować.",
      });

      // Sign out user after password change
      await supabase.auth.signOut();
      
      setShowResetForm(false);
      setNewPassword('');
      setConfirmNewPassword('');
      
      // Clear hash from URL
      window.history.replaceState(null, '', '/auth');
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-8 w-8 animate-pulse text-primary mx-auto mb-4" />
          <p>Ładowanie...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground">Fundacja PWM</h1>
          <p className="text-muted-foreground">Pomagamy znajdować domy dla zwierząt</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {showResetForm 
                ? 'Ustaw nowe hasło' 
                : showForgotPassword 
                  ? 'Resetowanie hasła' 
                  : 'Witamy'
              }
            </CardTitle>
            <CardDescription>
              {showResetForm
                ? "Wprowadź nowe hasło dla swojego konta"
                : showForgotPassword 
                  ? "Wprowadź swój adres email, a wyślemy Ci link do zresetowania hasła"
                  : confirmed 
                    ? "Email potwierdzony! Możesz się teraz zalogować." 
                    : "Zaloguj się lub utwórz konto, aby korzystać z platformy"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showResetForm ? (
              <div className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nowe hasło</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="new-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Nowe hasło"
                        className="pl-10 pr-10"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-new-password">Potwierdź nowe hasło</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-new-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Powtórz nowe hasło"
                        className="pl-10"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Aktualizowanie...' : 'Zmień hasło'}
                  </Button>
                </form>
              </div>
            ) : showForgotPassword ? (
              <div className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {resetSent ? (
                  <div className="space-y-4">
                    <Alert>
                      <AlertDescription>
                        Link do resetowania hasła został wysłany na adres <strong>{resetEmail}</strong>.
                        Sprawdź swoją skrzynkę email (również folder spam).
                      </AlertDescription>
                    </Alert>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setResetSent(false);
                        setResetEmail('');
                        setError('');
                      }}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Powrót do logowania
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="twoj@email.com"
                          className="pl-10"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading ? 'Wysyłanie...' : 'Wyślij link resetujący'}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setError('');
                        setResetEmail('');
                      }}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Powrót do logowania
                    </Button>
                  </form>
                )}
              </div>
            ) : (
              <Tabs defaultValue="login" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Logowanie</TabsTrigger>
                  <TabsTrigger value="signup">Rejestracja</TabsTrigger>
                </TabsList>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="twoj@email.com"
                        className="pl-10"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Hasło</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Twoje hasło"
                        className="pl-10 pr-10"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logowanie...' : 'Zaloguj się'}
                  </Button>

                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm text-muted-foreground hover:text-primary"
                      onClick={() => {
                        setShowForgotPassword(true);
                        setError('');
                      }}
                    >
                      Zapomniałeś hasła?
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nazwa wyświetlana</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Twoja nazwa"
                        className="pl-10"
                        value={signupForm.displayName}
                        onChange={(e) => setSignupForm({ ...signupForm, displayName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="twoj@email.com"
                        className="pl-10"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Hasło</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Minimum 6 znaków"
                        className="pl-10 pr-10"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Potwierdź hasło</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-confirm"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Powtórz hasło"
                        className="pl-10"
                        value={signupForm.confirmPassword}
                        onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Tworzenie konta...' : 'Utwórz konto'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-muted-foreground"
          >
            ← Powrót do strony głównej
          </Button>
        </div>
      </div>
    </div>
  );
}