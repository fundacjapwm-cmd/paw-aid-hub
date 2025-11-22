import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { ShoppingCart, Plus, Minus, Check, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";

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
    const items = animal.products
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
    
    if (items.length > 0) {
      addAllForAnimal(items, animal.name);
    }
  };

  return (
    <Card className="overflow-hidden bg-card rounded-3xl border-0 shadow-card">
      <div className="grid md:grid-cols-2 gap-6 p-6">
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
          <div className="p-6 pb-4">
            <h4 className="font-bold text-lg text-foreground">
              Potrzeby {animal.name}
            </h4>
          </div>

          {animal.products.length > 0 ? (
            <>
              {/* Body - Scrollable List */}
              <TooltipProvider>
                <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-3">
                  {animal.products.map((product) => {
                    const quantity = selectedQuantities[product.id] || 1;
                    const bought = product.bought || 0;
                    const needed = product.quantity || 1;
                    const missing = Math.max(0, needed - bought);
                    const isFullyBought = bought >= needed;
                    const progress = (bought / needed) * 100;
                    const itemInCart = isInCart(product.id);
                    const cartQuantity = getCartQuantity(product.id);

                    return (
                      <div
                        key={product.id}
                        className="bg-background rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex gap-3">
                          {/* Product Image */}
                          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>

                          {/* Product Info & Actions - Vertical Stack */}
                          <div className="flex-1 min-w-0 space-y-2">
                            {/* Top Row: Name & Price */}
                            <div>
                              <p className="font-bold text-foreground text-sm leading-tight line-clamp-2">
                                {product.name}
                              </p>
                              <div className="flex items-baseline gap-2 mt-1">
                                <p className="text-primary font-bold text-base">
                                  {product.price.toFixed(2)} zł
                                </p>
                                {!isFullyBought && missing > 1 && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={() => handleSmartFill(product.id, missing)}
                                        className="text-xs text-primary underline hover:text-primary/80 cursor-pointer transition-colors font-medium"
                                      >
                                        potrzebne: {missing} szt
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs">Kliknij, aby ustawić {missing} szt</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-1">
                              <Progress value={progress} className="h-1.5" />
                              <p className="text-xs text-muted-foreground">
                                {bought} / {needed} szt
                              </p>
                            </div>

                            {/* Actions Row */}
                            {isFullyBought ? (
                              <div className="flex items-center gap-2 text-green-600 font-medium text-sm pt-1">
                                <Check className="h-4 w-4" />
                                <span>Zrealizowane</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 pt-1 flex-wrap">
                                {/* Smart Badge */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant="secondary"
                                      className="cursor-pointer hover:bg-primary/10 text-xs font-medium px-2.5 py-1 transition-colors"
                                      onClick={() => handleSmartFill(product.id, missing)}
                                    >
                                      Brakuje: {missing}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Kliknij, aby dodać wszystkie</p>
                                  </TooltipContent>
                                </Tooltip>

                                  {/* Counter & Add Button */}
                                  <div className="flex items-center gap-2 ml-auto">
                                    <div className="flex items-center gap-1 bg-muted/50 rounded-lg px-1">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 hover:bg-background"
                                        onClick={() => handleQuantityChange(product.id, -1, missing)}
                                        disabled={quantity <= 1}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <span className="w-7 text-center font-semibold text-sm text-foreground">
                                        {quantity}
                                      </span>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 hover:bg-background"
                                        onClick={() => handleQuantityChange(product.id, 1, missing)}
                                        disabled={quantity >= missing}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>

                                    {/* Remove from cart if already added */}
                                    {itemInCart && (
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                                        onClick={() => removeFromCart(product.id)}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    )}

                                    {/* Add to Cart Button */}
                                    <div className="relative">
                                      <Button
                                        size="sm"
                                        className="h-8 px-3 rounded-lg bg-primary hover:bg-primary/90 hover:scale-105 transition-transform text-xs font-medium"
                                        onClick={() => handleAddProduct(product)}
                                        disabled={itemInCart}
                                      >
                                        <ShoppingCart className="h-3 w-3 mr-1" />
                                        {itemInCart ? 'Dodano' : 'Dodaj'}
                                      </Button>
                                      {cartQuantity > 0 && (
                                        <Badge 
                                          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white border-2 border-background"
                                        >
                                          {cartQuantity}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TooltipProvider>

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
                  className="w-full rounded-xl font-semibold shadow-sm hover:shadow-md hover:scale-[1.02] transition-all"
                  size="lg"
                  onClick={handleBuyAllMissing}
                  disabled={missingTotal === 0}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Kup wszystko co brakuje {missingTotal > 0 && `(${missingTotal.toFixed(2)} zł)`}
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
