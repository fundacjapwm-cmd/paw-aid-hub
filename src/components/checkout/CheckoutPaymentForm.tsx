import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, CreditCard } from 'lucide-react';

interface CheckoutPaymentFormProps {
  user: any;
  loading: boolean;
  cartTotal: number;
  customerName: string;
  setCustomerName: (value: string) => void;
  customerEmail: string;
  setCustomerEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  acceptTerms: boolean;
  setAcceptTerms: (value: boolean) => void;
  acceptPrivacy: boolean;
  setAcceptPrivacy: (value: boolean) => void;
  acceptDataProcessing: boolean;
  setAcceptDataProcessing: (value: boolean) => void;
  newsletter: boolean;
  setNewsletter: (value: boolean) => void;
  allConsentsChecked: boolean;
  onSelectAll: (checked: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onTestSubmit?: () => void;
}

export function CheckoutPaymentForm({
  user,
  loading,
  cartTotal,
  customerName,
  setCustomerName,
  customerEmail,
  setCustomerEmail,
  password,
  setPassword,
  acceptTerms,
  setAcceptTerms,
  acceptPrivacy,
  setAcceptPrivacy,
  acceptDataProcessing,
  setAcceptDataProcessing,
  newsletter,
  setNewsletter,
  allConsentsChecked,
  onSelectAll,
  onSubmit,
  onTestSubmit,
}: CheckoutPaymentFormProps) {
  return (
    <Card className="md:sticky md:top-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Dane do płatności
        </CardTitle>
        <CardDescription>
          {user ? 'Potwierdź swoje dane' : 'Możesz kupić jako gość lub założyć konto'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Imię i nazwisko *</Label>
            <Input
              id="name"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Jan Kowalski"
              required
              maxLength={100}
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="jan@example.com"
              required
              maxLength={255}
              disabled={!!user}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Na ten adres otrzymasz potwierdzenie darowizny
            </p>
          </div>

          {!user && (
            <div>
              <Label htmlFor="password">Hasło (opcjonalne)</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Zostaw puste aby kupić jako gość"
                maxLength={72}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Jeśli podasz hasło, utworzymy dla Ciebie konto
              </p>
            </div>
          )}

          <Separator className="my-6" />

          {/* RODO Checkboxes */}
          <div className="space-y-3">
            {/* Select All Option */}
            <div className="flex items-center space-x-2 pb-2 border-b">
              <Checkbox
                id="selectAll"
                checked={allConsentsChecked}
                onCheckedChange={(checked) => onSelectAll(checked as boolean)}
              />
              <label
                htmlFor="selectAll"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Zaznacz wszystkie zgody
              </label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="acceptDataProcessing"
                checked={acceptDataProcessing}
                onCheckedChange={(checked) => setAcceptDataProcessing(checked as boolean)}
                required
              />
              <label
                htmlFor="acceptDataProcessing"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Wyrażam zgodę na przetwarzanie moich danych osobowych w celu realizacji darowizny *
              </label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="acceptTerms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                required
              />
              <label
                htmlFor="acceptTerms"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Akceptuję{' '}
                <Link to="/regulamin" className="text-primary hover:underline" target="_blank">
                  regulamin platformy
                </Link>{' '}
                *
              </label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="acceptPrivacy"
                checked={acceptPrivacy}
                onCheckedChange={(checked) => setAcceptPrivacy(checked as boolean)}
                required
              />
              <label
                htmlFor="acceptPrivacy"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Akceptuję{' '}
                <Link to="/prywatnosc" className="text-primary hover:underline" target="_blank">
                  politykę prywatności
                </Link>{' '}
                *
              </label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="newsletter"
                checked={newsletter}
                onCheckedChange={(checked) => setNewsletter(checked as boolean)}
              />
              <label
                htmlFor="newsletter"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Chcę otrzymywać newsletter z informacjami o zwierzętach (opcjonalne)
              </label>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="bg-secondary/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              Płatność zostanie przetworzona przez PayU
            </p>
            <p className="text-sm font-medium">
              Bezpieczna płatność zabezpieczona przez PayU
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Przetwarzanie...
              </>
            ) : (
              <>
                Zapłać {cartTotal.toFixed(2)} zł
              </>
            )}
          </Button>

          {onTestSubmit && (
            <Button 
              type="button"
              onClick={onTestSubmit}
              variant="outline"
              className="w-full" 
              size="lg"
              disabled={loading}
            >
              🧪 Zapłać Test (Symulacja)
            </Button>
          )}

          <p className="text-xs text-center text-muted-foreground mt-4">
            * Pola wymagane
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
