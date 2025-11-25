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
                        className="flex gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
                      >
                        {/* 1. KOLUMNA: ZDJĘCIE (Fixed) */}
                        <div className="shrink-0">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-20 h-20 rounded-xl object-cover bg-gray-50"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-xl bg-gray-50 flex items-center justify-center">
                              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* 2. KOLUMNA: TREŚĆ (Flexible) */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          {/* Góra: Nazwa produktu */}
                          <h4 
                            className="text-sm font-semibold text-foreground line-clamp-2 leading-tight" 
                            title={product.name}
                          >
                            {product.name}
                          </h4>
                          
                          {/* Dół: Cena + Progress + Smart Shortcut */}
                          <div className="space-y-1">
                            <div className="text-primary font-bold text-base">
                              {product.price.toFixed(2)} zł
                            </div>
                            
                            {/* Progress Bar */}
                            {!isFullyBought && (
                              <div className="space-y-0.5">
                                <Progress value={progress} className="h-1.5" />
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-muted-foreground">
                                    {bought} / {needed} szt
                                  </p>
                                  {/* Smart Shortcut */}
                                  {missing > 1 && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={() => handleSmartFill(product.id, missing)}
                                          className="text-xs text-muted-foreground hover:text-primary transition-colors underline decoration-dotted"
                                        >
                                          Brakuje: {missing} szt
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="text-xs">Kliknij, aby ustawić {missing} szt</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Status gdy w pełni kupione */}
                            {isFullyBought && (
                              <div className="flex items-center gap-1.5 text-green-600 font-medium text-xs">
                                <Check className="h-3.5 w-3.5" />
                                <span>Zrealizowane</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 3. KOLUMNA: AKCJE (Poziomy układ) */}
                        {!isFullyBought && (
                          <div className="flex flex-col justify-end items-end shrink-0 pl-2">
                            {/* Kontener Akcji: Licznik + Przyciski w jednym rzędzie */}
                            <div className="flex items-center gap-2">
                              
                              {/* Licznik */}
                              <div className="flex items-center bg-gray-50 rounded-lg h-9 p-1 shadow-inner">
                                <button 
                                  className="w-6 h-full flex items-center justify-center text-gray-500 hover:text-primary hover:bg-white rounded-md transition-all disabled:opacity-30"
                                  onClick={() => handleQuantityChange(product.id, -1, missing)}
                                  disabled={quantity <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-6 text-center text-sm font-bold tabular-nums">
                                  {quantity}
                                </span>
                                <button 
                                  className="w-6 h-full flex items-center justify-center text-gray-500 hover:text-primary hover:bg-white rounded-md transition-all"
                                  onClick={() => handleQuantityChange(product.id, 1, missing)}
                                  disabled={quantity >= missing}
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>

                              {/* Przycisk Usuń (jeśli w koszyku) */}
                              {itemInCart && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      className="h-9 w-9 rounded-xl bg-destructive/10 hover:bg-destructive hover:text-destructive-foreground transition-all"
                                      onClick={() => removeFromCart(product.id)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Usuń z koszyka</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}

                              {/* Przycisk Dodaj */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="relative">
                                    <Button 
                                      size="icon" 
                                      className={`h-9 w-9 rounded-xl shadow-sm hover:scale-105 transition-all ${
                                        itemInCart 
                                          ? 'bg-green-500 hover:bg-green-600' 
                                          : 'bg-primary hover:bg-primary/90'
                                      }`}
                                      onClick={() => handleAddProduct(product)}
                                      disabled={itemInCart}
                                    >
                                      {itemInCart ? (
                                        <Check className="h-4 w-4" />
                                      ) : (
                                        <ShoppingCart className="h-4 w-4" />
                                      )}
                                    </Button>
                                    {cartQuantity > 0 && (
                                      <Badge 
                                        className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white border-2 border-background"
                                      >
                                        {cartQuantity}
                                      </Badge>
                                    )}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">
                                    {itemInCart ? `${cartQuantity} szt. w koszyku` : 'Dodaj do koszyka'}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        )}
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
