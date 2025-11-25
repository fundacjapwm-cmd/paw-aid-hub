import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";
import { WishlistProductCard } from "@/components/WishlistProductCard";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  bought?: number;
  quantity?: number;
}

interface Animal {
  id: string;
  name: string;
  age: string;
  description: string;
  products: Product[];
}

interface AnimalWishlistCardProps {
  animal: Animal;
}

const AnimalWishlistCard = ({ animal }: AnimalWishlistCardProps) => {
  const { addToCart, addAllForAnimal, cart: globalCart, removeFromCart } = useCart();
  const { toast } = useToast();
  
  // State for quantity counters - każdy produkt ma swoją ilość (domyślnie 1)
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>(
    animal.products.reduce((acc, product) => ({ ...acc, [product.id]: 1 }), {})
  );

  // Oblicz brakującą kwotę (tylko produkty, które nie są w pełni zrealizowane)
  const missingTotal = animal.products.reduce((sum, product) => {
    const bought = product.bought || 0;
    const needed = product.quantity || 1;
    const missing = Math.max(0, needed - bought);
    return sum + (product.price * missing);
  }, 0);

  // Oblicz sumę produktów w koszyku dla tego zwierzęcia
  const cartTotalForAnimal = globalCart
    .filter(item => item.animalId === animal.id)
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const isInCart = (productId: string) => {
    return globalCart.some(item => item.productId === productId);
  };

  const getCartQuantity = (productId: string) => {
    const cartItem = globalCart.find(item => item.productId === productId);
    return cartItem?.quantity || 0;
  };

  // Sprawdź czy wszystkie brakujące produkty są już w koszyku
  const allMissingInCart = animal.products.every((product) => {
    const bought = product.bought || 0;
    const needed = product.quantity || 1;
    const missing = Math.max(0, needed - bought);
    return missing === 0 || getCartQuantity(product.id) >= missing;
  });

  const handleQuantityChange = (productId: string, change: number, maxLimit: number) => {
    setSelectedQuantities((prev) => {
      const currentQty = prev[productId] || 1;
      const newQty = Math.max(1, Math.min(maxLimit, currentQty + change)); // Min: 1, Max: limit
      return { ...prev, [productId]: newQty };
    });
  };

  const handleSmartFill = (productId: string, missing: number) => {
    setSelectedQuantities((prev) => ({ ...prev, [productId]: missing }));
  };

  const handleAddProduct = (product: Product) => {
    const quantity = selectedQuantities[product.id] || 1;
    addToCart(
      {
        productId: product.id,
        productName: product.name,
        price: product.price,
        animalId: animal.id,
        animalName: animal.name,
      },
      quantity
    );
  };

  const handleBuyAllMissing = () => {
    // Dodaj tylko brakujące sztuki (te które jeszcze nie zostały kupione)
    const missingItems = animal.products
      .filter((product) => {
        const bought = product.bought || 0;
        const needed = product.quantity || 1;
        return bought < needed;
      })
      .map((product) => {
        const bought = product.bought || 0;
        const needed = product.quantity || 1;
        const missing = needed - bought;
        return {
          productId: product.id,
          productName: product.name,
          price: product.price,
          animalId: animal.id,
          animalName: animal.name,
          maxQuantity: missing,
        };
      });
    
    if (missingItems.length > 0) {
      const totalCount = missingItems.reduce((sum, item) => sum + (item.maxQuantity || 1), 0);
      const totalPrice = missingItems.reduce((sum, item) => sum + (item.price * (item.maxQuantity || 1)), 0);
      
      addAllForAnimal(missingItems, animal.name);
      
      toast({ title: `Dodano do koszyka ${totalCount} produktów (${totalPrice.toFixed(2)} zł) dla: ${animal.name}` });
    }
  };

  return (
    <Card className="overflow-hidden bg-card rounded-3xl border-0 shadow-card">
      <div className="grid md:grid-cols-2 gap-6 p-4 md:p-6">
        {/* Left Side: Animal Description */}
        <div className="space-y-4">
          <div>
            <Link
              to={`/zwierze/${animal.id}`}
              className="hover:text-primary transition-colors"
            >
              <h3 className="text-2xl font-bold text-foreground mb-1">
                {animal.name}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground">{animal.age}</p>
          </div>
          <p className="text-foreground leading-relaxed">{animal.description}</p>
        </div>

        {/* Right Side: Product Wishlist - Nowy Layout z Sticky Footer */}
        <div className="bg-muted/30 rounded-2xl flex flex-col h-full">
          {/* Header */}
          <div className="p-4 md:p-6 pb-4">
            <h4 className="font-bold text-lg text-foreground">
              Potrzeby {animal.name}
            </h4>
          </div>

          {animal.products.length > 0 ? (
            <>
              {/* Body - Scrollable List */}
              <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-3">
                {animal.products.map((product) => {
                  const quantity = selectedQuantities[product.id] || 1;
                  const bought = product.bought || 0;
                  const needed = product.quantity || 1;
                  const missing = Math.max(0, needed - bought);
                  const isFullyBought = bought >= needed;

                  return (
                    <WishlistProductCard
                      key={product.id}
                      product={{
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image_url: product.image,
                        quantity: needed,
                        bought: isFullyBought,
                      }}
                      quantity={quantity}
                      maxQuantity={missing}
                      isInCart={isInCart(product.id)}
                      cartQuantity={getCartQuantity(product.id)}
                      onQuantityChange={(_, change) => handleQuantityChange(product.id, change, missing)}
                      showSmartFill={missing > 1}
                      onSmartFill={(_, qty) => handleSmartFill(product.id, qty)}
                      onAddToCart={() => handleAddProduct(product)}
                      onRemoveFromCart={() => removeFromCart(product.id)}
                    />
                  );
                })}
              </div>

              {/* Footer - Sticky Summary */}
              <div className="bg-gradient-to-t from-muted/50 to-transparent p-5 border-t space-y-3">
                {/* Łącznie w koszyku */}
                {cartTotalForAnimal > 0 && (
                  <div className="flex items-center justify-between pb-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">
                      Łącznie w koszyku:
                    </span>
                    <span className="text-lg font-bold text-foreground">
                      {cartTotalForAnimal.toFixed(2)} zł
                    </span>
                  </div>
                )}
                
                {/* Kup wszystkie brakujące */}
                <Button
                  className={`w-full rounded-3xl md:rounded-xl font-semibold shadow-sm md:hover:shadow-md md:hover:scale-[1.02] transition-all ${
                    allMissingInCart && missingTotal > 0 ? 'bg-green-500 hover:bg-green-600' : ''
                  }`}
                  size="lg"
                  onClick={handleBuyAllMissing}
                  disabled={missingTotal === 0 || allMissingInCart}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {allMissingInCart && missingTotal > 0 
                    ? `Dodano (${missingTotal.toFixed(2)} zł)`
                    : `Kup wszystko co brakuje ${missingTotal > 0 ? `(${missingTotal.toFixed(2)} zł)` : ''}`
                  }
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <p className="text-center text-muted-foreground">
                Brak produktów w wishliście
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AnimalWishlistCard;
