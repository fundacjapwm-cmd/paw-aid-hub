import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, RefreshCw, Home, HelpCircle, Mail } from 'lucide-react';
import Footer from '@/components/Footer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const PaymentFailure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errorReason, setErrorReason] = useState<string>('');

  useEffect(() => {
    // Get order ID and error details from URL params
    // HotPay uses ID_ZAMOWIENIA and STATUS, PayU uses extOrderId
    const extOrderId = searchParams.get('extOrderId') || searchParams.get('ID_ZAMOWIENIA');
    const error = searchParams.get('error') || searchParams.get('STATUS');
    
    setOrderId(extOrderId);
    setErrorReason(error || 'Nieznany błąd');

    // Update order status if we have order ID
    if (extOrderId) {
      updateOrderStatus(extOrderId);
    }
  }, [searchParams]);

  const updateOrderStatus = async (orderId: string) => {
    try {
      await supabase
        .from('orders')
        .update({
          payment_status: 'failed',
          status: 'cancelled'
        })
        .eq('id', orderId);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleRetryPayment = () => {
    navigate('/checkout');
  };

  const getErrorMessage = (reason: string) => {
    switch (reason) {
      case 'CANCELLED':
      case 'FAILURE':
        return 'Płatność została anulowana lub odrzucona';
      case 'TIMEOUT':
        return 'Upłynął limit czasu na dokonanie płatności';
      case 'REJECTED':
        return 'Płatność została odrzucona przez bank';
      default:
        return 'Wystąpił problem podczas przetwarzania płatności';
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-background via-secondary/20 to-background pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Error Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
              <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
              Płatność nieudana
            </h1>
            <p className="text-xl text-muted-foreground">
              Niestety, nie udało się przetworzyć płatności
            </p>
          </div>

          {/* Error Details Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Co się stało?</CardTitle>
              <CardDescription>
                {orderId && (
                  <>
                    Numer zamówienia: <span className="font-mono font-semibold">{orderId.substring(0, 8).toUpperCase()}</span>
                  </>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Błąd płatności</AlertTitle>
                <AlertDescription>
                  {getErrorMessage(errorReason)}
                </AlertDescription>
              </Alert>

              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong>Możliwe przyczyny:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Niewystarczające środki na koncie</li>
                  <li>Anulowanie płatności przez użytkownika</li>
                  <li>Problem z połączeniem internetowym</li>
                  <li>Przekroczenie limitu czasu</li>
                  <li>Odrzucenie transakcji przez bank</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Help Card */}
          <Card className="mb-6 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-300">
                <HelpCircle className="w-5 h-5" />
                Potrzebujesz pomocy?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-blue-900/80 dark:text-blue-300/80">
              <p>
                Jeśli problem się powtarza, skontaktuj się z naszym zespołem wsparcia.
              </p>
              <a 
                href="mailto:kontakt@paczkiwmasle.pl" 
                className="flex items-center gap-2 text-primary hover:underline font-medium"
              >
                <Mail className="w-4 h-4" />
                kontakt@paczkiwmasle.pl
              </a>
              <p>
                Możesz również spróbować użyć innej metody płatności lub karty.
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleRetryPayment}
              className="flex-1"
              size="lg"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Spróbuj ponownie
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <Home className="mr-2 h-4 w-4" />
              Wróć do strony głównej
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Zamówienie zostało anulowane i nie zostałeś obciążony.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Dziękujemy za chęć wsparcia zwierząt w potrzebie. 🐾
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentFailure;