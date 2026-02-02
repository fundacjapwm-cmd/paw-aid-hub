import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface CartItem {
  productId: string;
  productName: string;
  price: number;
  netPrice?: number;
  quantity: number;
  animalName?: string;
}

interface CheckoutOrderSummaryProps {
  cart: CartItem[];
  cartTotal: number;
  cartMinimized: boolean;
  onToggleMinimize: () => void;
}

export function CheckoutOrderSummary({ 
  cart, 
  cartTotal, 
  cartMinimized, 
  onToggleMinimize 
}: CheckoutOrderSummaryProps) {
  return (
    <Card>
      <CardHeader 
        className="cursor-pointer" 
        onClick={onToggleMinimize}
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

            <div className="space-y-2">
              {(() => {
                // Calculate VAT for each item separately based on actual net prices
                let totalNet = 0;
                let totalVat = 0;
                
                cart.forEach(item => {
                  const itemTotal = item.price * item.quantity;
                  // Use actual net price if available, otherwise estimate based on price
                  const itemNetPrice = item.netPrice || (item.price / 1.08); // Default to 8% VAT for food
                  const itemNetTotal = itemNetPrice * item.quantity;
                  const itemVat = itemTotal - itemNetTotal;
                  
                  totalNet += itemNetTotal;
                  totalVat += itemVat;
                });
                
                return (
                  <>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Wartość netto:</span>
                      <span>{totalNet.toFixed(2)} zł</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>VAT:</span>
                      <span>{totalVat.toFixed(2)} zł</span>
                    </div>
                  </>
                );
              })()}
              <div className="flex justify-between items-center text-lg font-bold pt-2 border-t">
                <span>Suma brutto:</span>
                <span className="text-primary">{cartTotal.toFixed(2)} zł</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Ceny zawierają podatek VAT. Koszt dostawy do organizacji wliczony w cenę.
            </p>
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
  );
}
