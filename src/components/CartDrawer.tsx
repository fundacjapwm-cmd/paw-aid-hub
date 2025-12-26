import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

const CartDrawer = () => {
  const { cart, cartTotal, cartCount, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleCheckout = () => {
    setOpen(false);
    navigate('/checkout');
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>Koszyk</SheetTitle>
          <SheetDescription>
            {cartCount > 0 ? `${cartCount} produktów w koszyku` : 'Twój koszyk jest pusty'}
          </SheetDescription>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Dodaj produkty do koszyka, aby pomóc zwierzętom
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Scrollable products area */}
            <div className="flex-1 overflow-y-auto mt-4 space-y-4 pr-2">
              {Object.entries(
                cart.reduce((groups, item) => {
                  const animalName = item.animalName || 'Inne';
                  if (!groups[animalName]) {
                    groups[animalName] = [];
                  }
                  groups[animalName].push(item);
                  return groups;
                }, {} as Record<string, typeof cart>)
              ).map(([animalName, items]) => (
                <div key={animalName} className="space-y-3">
                  <h3 className="font-bold text-foreground text-lg sticky top-0 bg-background py-2 border-b">
                    {animalName}
                  </h3>
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.productName}</h4>
                        <p className="text-sm font-semibold mt-1">{item.price.toFixed(2)} zł</p>
                        {item.maxQuantity && (
                          <p className="text-xs text-muted-foreground">
                            Potrzeba: {item.maxQuantity} szt.
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.animalId)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.animalId)}
                            disabled={item.maxQuantity ? item.quantity >= item.maxQuantity : false}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.productId, item.animalId)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        <p className="font-semibold">
                          {(item.price * item.quantity).toFixed(2)} zł
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Fixed bottom section with checkout button */}
            <div className="border-t pt-4 mt-4 space-y-4 bg-background">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Suma:</span>
                <span className="text-primary">{cartTotal.toFixed(2)} zł</span>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full"
                size="lg"
              >
                Przejdź do płatności
              </Button>

              <Button
                onClick={clearCart}
                variant="outline"
                className="w-full"
              >
                Wyczyść koszyk
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;