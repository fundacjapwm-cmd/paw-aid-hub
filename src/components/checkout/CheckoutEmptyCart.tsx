import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import Footer from '@/components/Footer';

export function CheckoutEmptyCart() {
  const navigate = useNavigate();

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
