import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import Footer from '@/components/Footer';
import { Loader2, ShoppingCart, CreditCard } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState(profile?.display_name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Wymagane logowanie",
        description: "Musisz być zalogowany aby dokonać płatności",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Pusty koszyk",
        description: "Dodaj produkty do koszyka przed płatnością",
        variant: "destructive",
      });
      return;
    }

    if (!customerName.trim() || !customerEmail.trim()) {
      toast({
        title: "Wypełnij dane",
        description: "Imię i email są wymagane",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-payu-order', {
        body: {
          items: cart,
          customerEmail,
          customerName,
          totalAmount: cartTotal,
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
              <CardHeader>
                <CardTitle>Podsumowanie zamówienia</CardTitle>
                <CardDescription>Sprawdź wybrane produkty</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
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

                  <Separator className="my-4" />

                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Suma całkowita:</span>
                    <span className="text-primary">{cartTotal.toFixed(2)} zł</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Dane do płatności
                </CardTitle>
                <CardDescription>Wprowadź swoje dane</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCheckout} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Imię i nazwisko</Label>
                    <Input
                      id="name"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Jan Kowalski"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="jan@example.com"
                      required
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Na ten adres otrzymasz potwierdzenie darowizny
                    </p>
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
                    Klikając "Zapłać" akceptujesz regulamin i zostaniesz przekierowany do bezpiecznej płatności PayU
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