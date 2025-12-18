import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, Package, ArrowRight } from 'lucide-react';
import Footer from '@/components/Footer';
import { Separator } from '@/components/ui/separator';
import { WishlistCelebration } from '@/components/WishlistCelebration';

interface CompletedAnimal {
  id: string;
  name: string;
}

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [completedAnimals, setCompletedAnimals] = useState<CompletedAnimal[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentCelebrationIndex, setCurrentCelebrationIndex] = useState(0);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // Get order ID from URL params (PayU sends it as extOrderId)
        const orderId = searchParams.get('extOrderId');
        
        if (!orderId) {
          setError('Brak identyfikatora zamówienia');
          setLoading(false);
          return;
        }

        // Use edge function to fetch order (bypasses RLS for guest orders)
        const { data, error: fetchError } = await supabase.functions.invoke('get-order-details', {
          body: { orderId }
        });

        if (fetchError) throw fetchError;
        if (data.error) throw new Error(data.error);

        setOrderDetails(data.order);
        
        // Check which animals had their wishlists completed by this purchase
        if (data.order?.order_items) {
          const animalIds = [...new Set(data.order.order_items
            .filter((item: any) => item.animal_id)
            .map((item: any) => item.animal_id)
          )] as string[];
          
          if (animalIds.length > 0) {
            const completed = await checkCompletedWishlists(animalIds);
            if (completed.length > 0) {
              setCompletedAnimals(completed);
              setShowCelebration(true);
            }
          }
        }
      } catch (err: any) {
        console.error('Error fetching order:', err);
        setError('Nie udało się pobrać szczegółów zamówienia');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [searchParams]);

  // Check if any animal's wishlist is now 100% complete
  const checkCompletedWishlists = async (animalIds: string[]): Promise<CompletedAnimal[]> => {
    const completed: CompletedAnimal[] = [];
    
    for (const animalId of animalIds) {
      // Get animal name
      const { data: animal } = await supabase
        .from('animals')
        .select('id, name')
        .eq('id', animalId)
        .single();
      
      if (!animal) continue;
      
      // Get wishlist items for this animal
      const { data: wishlistItems } = await supabase
        .from('animal_wishlists')
        .select('id, quantity, product_id')
        .eq('animal_id', animalId);
      
      if (!wishlistItems || wishlistItems.length === 0) continue;
      
      // Get purchased quantities for each wishlist item
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .eq('animal_id', animalId);
      
      // Calculate if wishlist is 100% complete
      const purchasedByProduct: Record<string, number> = {};
      orderItems?.forEach(item => {
        if (item.product_id) {
          purchasedByProduct[item.product_id] = (purchasedByProduct[item.product_id] || 0) + item.quantity;
        }
      });
      
      const allComplete = wishlistItems.every(item => {
        const needed = item.quantity || 1;
        const bought = purchasedByProduct[item.product_id!] || 0;
        return bought >= needed;
      });
      
      if (allComplete) {
        completed.push({ id: animal.id, name: animal.name });
      }
    }
    
    return completed;
  };

  const handleCelebrationComplete = () => {
    if (currentCelebrationIndex < completedAnimals.length - 1) {
      setCurrentCelebrationIndex(prev => prev + 1);
    } else {
      setShowCelebration(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-b from-background via-secondary/20 to-background flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-6 text-center">
              <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-muted-foreground">Sprawdzanie statusu płatności...</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !orderDetails) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-b from-background via-secondary/20 to-background flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle className="text-destructive">Wystąpił błąd</CardTitle>
              <CardDescription>{error || 'Nie znaleziono zamówienia'}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/')} className="w-full">
                Wróć do strony głównej
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      {showCelebration && completedAnimals.length > 0 && (
        <WishlistCelebration 
          animalName={completedAnimals[currentCelebrationIndex].name}
          onComplete={handleCelebrationComplete}
        />
      )}
      <div className="min-h-screen bg-gradient-to-b from-background via-secondary/20 to-background pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
              Płatność zakończona sukcesem!
            </h1>
            <p className="text-xl text-muted-foreground">
              Dziękujemy za Twoje wsparcie ❤️
            </p>
          </div>

          {/* Order Details Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Potwierdzenie zamówienia
              </CardTitle>
              <CardDescription>
                Numer zamówienia: <span className="font-mono font-semibold">{orderDetails.id.substring(0, 8).toUpperCase()}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Status płatności</p>
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      orderDetails.payment_status === 'completed' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {orderDetails.payment_status === 'completed' ? 'Opłacono' : 'W trakcie weryfikacji'}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Zakupione produkty:</h3>
                  <div className="space-y-3">
                    {orderDetails.order_items?.map((item: any, index: number) => (
                      <div key={index} className="flex gap-3 items-center p-3 bg-secondary/50 rounded-lg">
                        {item.products?.image_url && (
                          <img 
                            src={item.products.image_url} 
                            alt={item.products.name}
                            className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.products?.name}</p>
                          {item.animals?.name && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              {item.animals?.image_url && (
                                <img 
                                  src={item.animals.image_url} 
                                  alt={item.animals.name}
                                  className="w-5 h-5 object-cover rounded-full"
                                />
                              )}
                              <span>dla {item.animals.name}</span>
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground">Ilość: {item.quantity}</p>
                        </div>
                        <p className="font-semibold flex-shrink-0">
                          {(item.unit_price * item.quantity).toFixed(2)} zł
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Suma całkowita:</span>
                  <span className="text-primary">{orderDetails.total_amount.toFixed(2)} zł</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="mb-6 bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <p className="text-sm">
                  <strong>✉️ Potwierdzenie email:</strong> Wysłaliśmy szczegóły zamówienia na Twój adres email
                </p>
                <p className="text-sm">
                  <strong>📦 Dostawa produktów:</strong> Produkty zostaną dostarczone bezpośrednio do schroniska/organizacji
                </p>
                <p className="text-sm">
                  <strong>🏆 Historia:</strong> Wszystkie Twoje darowizny znajdziesz w profilu użytkownika
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => navigate('/profil')}
              variant="outline"
              className="flex-1"
            >
              Zobacz historię darowizn
            </Button>
            <Button
              onClick={() => navigate('/')}
              className="flex-1"
            >
              Wróć do strony głównej
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentSuccess;