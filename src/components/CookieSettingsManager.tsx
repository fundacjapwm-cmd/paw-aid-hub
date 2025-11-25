import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

export const CookieSettingsManager = () => {
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (consent) {
      try {
        const parsed = JSON.parse(consent);
        setPreferences(parsed.preferences || defaultPreferences);
        setHasConsent(true);
      } catch {
        setPreferences(defaultPreferences);
      }
    }
  }, []);

  const savePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      preferences,
      timestamp: new Date().toISOString(),
    }));
    setHasConsent(true);
    toast.success('Preferencje cookies zostały zapisane');
  };

  const resetConsent = () => {
    localStorage.removeItem('cookie-consent');
    setPreferences(defaultPreferences);
    setHasConsent(false);
    toast.success('Preferencje cookies zostały zresetowane');
  };

  return (
    <div className="bg-muted/30 rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Zarządzaj cookies</h3>
        </div>
        {hasConsent && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Check className="h-3 w-3 text-green-500" />
            Zgoda zapisana
          </span>
        )}
      </div>

      <div className="space-y-4">
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

      <div className="flex flex-col sm:flex-row gap-2 pt-2">
        <Button onClick={savePreferences} className="flex-1">
          Zapisz preferencje
        </Button>
        {hasConsent && (
          <Button variant="outline" onClick={resetConsent} className="flex-1">
            Resetuj zgodę
          </Button>
        )}
      </div>
    </div>
  );
};
