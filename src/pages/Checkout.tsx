import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import Footer from '@/components/Footer';
import { Loader2, ShoppingCart, CreditCard } from 'lucide-react';
import { z } from 'zod';

const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, 'Imię i nazwisko musi mieć minimum 2 znaki').max(100, 'Imię i nazwisko za długie'),
  customerEmail: z.string().trim().email('Nieprawidłowy adres email').max(255, 'Email za długi'),
  password: z.string().min(6, 'Hasło musi mieć minimum 6 znaków').max(72, 'Hasło za długie').optional().or(z.literal('')),
  acceptTerms: z.boolean().refine(val => val === true, 'Musisz zaakceptować regulamin'),
  acceptPrivacy: z.boolean().refine(val => val === true, 'Musisz zaakceptować politykę prywatności'),
  acceptDataProcessing: z.boolean().refine(val => val === true, 'Musisz wyrazić zgodę na przetwarzanie danych'),
  newsletter: z.boolean().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cartMinimized, setCartMinimized] = useState(false);
  const [customerName, setCustomerName] = useState(profile?.display_name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptDataProcessing, setAcceptDataProcessing] = useState(false);
  const [newsletter, setNewsletter] = useState(false);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast({
        title: "Pusty koszyk",
        description: "Dodaj produkty do koszyka przed płatnością",
        variant: "destructive",
      });
      return;
    }

    // Validate form data
    try {
      checkoutSchema.parse({
        customerName,
        customerEmail,
        password: password || '',
        acceptTerms,
        acceptPrivacy,
        acceptDataProcessing,
        newsletter,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Błąd walidacji",
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-payu-order', {
        body: {
          items: cart,
          customerEmail,
          customerName,
          totalAmount: cartTotal,
          password: password || undefined,
          newsletter,
          isGuest: !user,
        },
      });

      if (error) throw error;

      console.log('PayU order created:', data);

      // Clear cart on successful order creation
      clearCart();

      // Redirect to PayU payment page
      window.location.href = data.redirectUri;

    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Błąd płatności",
        description: error.message || "Nie udało się zainicjować płatności",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-b from-background via-secondary/20 to-background pt-24 pb-12">
          <div className="container mx-auto px-4">
            <Card className="max-w-2xl mx-auto text-center py-12">
              <CardHeader>
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <CardTitle>Twój koszyk jest pusty</CardTitle>
                <CardDescription>
                  Dodaj produkty do koszyka, aby pomóc zwierzętom
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate('/')}>
                  Przeglądaj zwierzęta
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-background via-secondary/20 to-background pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Finalizacja darowizny
          </h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <Card>
              <CardHeader 
                className="cursor-pointer" 
                onClick={() => setCartMinimized(!cartMinimized)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Podsumowanie zamówienia</CardTitle>
                    <CardDescription>Sprawdź wybrane produkty</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" type="button">
                    {cartMinimized ? 'Rozwiń' : 'Zwiń'}
                  </Button>
                </div>
              </CardHeader>
              {!cartMinimized && (
                <CardContent>
                  <div className="space-y-4">
                    <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
                      {cart.map((item) => (
                        <div key={item.productId} className="flex justify-between items-start pb-4 border-b">
                          <div className="flex-1">
                            <p className="font-medium">{item.productName}</p>
                            {item.animalName && (
                              <p className="text-sm text-muted-foreground">dla {item.animalName}</p>
                            )}
                            <p className="text-sm text-muted-foreground">Ilość: {item.quantity}</p>
                          </div>
                          <p className="font-semibold">
                            {(item.price * item.quantity).toFixed(2)} zł
                          </p>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-4" />

                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Suma całkowita:</span>
                      <span className="text-primary">{cartTotal.toFixed(2)} zł</span>
                    </div>
                  </div>
                </CardContent>
              )}
              {cartMinimized && (
                <CardContent>
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Suma całkowita:</span>
                    <span className="text-primary">{cartTotal.toFixed(2)} zł</span>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Payment Form */}
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
                <form onSubmit={handleCheckout} className="space-y-4">
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
                        <Link to="/polityka-prywatnosci" className="text-primary hover:underline" target="_blank">
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

                  <p className="text-xs text-center text-muted-foreground mt-4">
                    * Pola wymagane
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Checkout;
