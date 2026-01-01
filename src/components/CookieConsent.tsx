import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Cookie, Settings, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const defaultPreferences: CookiePreferences = {
  necessary: true, // Always true, cannot be disabled
  analytics: false,
  marketing: false,
};

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Small delay to avoid layout shift on page load
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      preferences: prefs,
      timestamp: new Date().toISOString(),
    }));
    setIsVisible(false);
  };

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    saveConsent(allAccepted);
  };

  const rejectOptional = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    setPreferences(onlyNecessary);
    saveConsent(onlyNecessary);
  };

  const saveCustom = () => {
    saveConsent(preferences);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-2xl animate-in slide-in-from-bottom-4 duration-300">
        <Card className="shadow-2xl border-border/50 bg-background/95 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Cookie className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Polityka cookies</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -mr-2 -mt-2"
                onClick={rejectOptional}
                aria-label="Zamknij i odrzuć opcjonalne cookies"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription className="text-sm">
              Używamy plików cookies, aby zapewnić najlepsze doświadczenie na naszej stronie. 
              Niezbędne cookies są wymagane do działania serwisu. Możesz dostosować swoje preferencje 
              lub zaakceptować wszystkie cookies.{' '}
              <Link to="/prywatnosc" className="text-primary hover:underline">
                Dowiedz się więcej
              </Link>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {showDetails && (
              <div className="space-y-4 py-4 border-t border-b">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Niezbędne</Label>
                    <p className="text-xs text-muted-foreground">
                      Wymagane do działania strony (sesja, bezpieczeństwo)
                    </p>
                  </div>
                  <Switch checked={true} disabled />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Analityczne</Label>
                    <p className="text-xs text-muted-foreground">
                      Pomagają nam zrozumieć, jak korzystasz ze strony
                    </p>
                  </div>
                  <Switch
                    checked={preferences.analytics}
                    onCheckedChange={(checked) =>
                      setPreferences((prev) => ({ ...prev, analytics: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Marketingowe</Label>
                    <p className="text-xs text-muted-foreground">
                      Używane do personalizacji reklam i treści
                    </p>
                  </div>
                  <Switch
                    checked={preferences.marketing}
                    onCheckedChange={(checked) =>
                      setPreferences((prev) => ({ ...prev, marketing: checked }))
                    }
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="flex-1 gap-2"
              >
                <Settings className="h-4 w-4" />
                {showDetails ? 'Ukryj szczegóły' : 'Dostosuj'}
              </Button>
              
              {showDetails ? (
                <Button size="sm" onClick={saveCustom} className="flex-1">
                  Zapisz preferencje
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={rejectOptional}
                    className="flex-1"
                  >
                    Tylko niezbędne
                  </Button>
                  <Button size="sm" onClick={acceptAll} className="flex-1">
                    Akceptuj wszystkie
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
