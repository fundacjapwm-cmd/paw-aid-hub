import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MapPin, Calendar, ShoppingCart, Plus, Minus, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import WishlistProgressBar from "@/components/WishlistProgressBar";
import { WishlistCelebration } from "@/components/WishlistCelebration";
import { useState, useEffect } from "react";
import { calculateAnimalAge } from "@/lib/utils/ageCalculator";

interface WishlistItem {
  id: string | number;
  name: string;
  price: number;
  urgent?: boolean;
  bought?: boolean;
  product_id?: string;
  quantity: number;
  image_url?: string;
}

interface Animal {
  id: string | number;
  name: string;
  age: string;
  species: string;
  location: string;
  organization: string;
  organizationSlug?: string;
  description: string;
  image: string;
  wishlist?: WishlistItem[];
  birth_date?: string | null;
}

interface AnimalCardProps {
  animal: Animal;
}

const AnimalCard = ({ animal }: AnimalCardProps) => {
  const { addToCart, addAllForAnimal, isAnimalFullyAdded, markAnimalAsAdded, cart: globalCart, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationShown, setCelebrationShown] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  
  const wishlistItems = animal.wishlist || [];
  
  // Initialize quantities when wishlist loads
  useEffect(() => {
    if (wishlistItems.length > 0) {
      const initialQuantities = wishlistItems.reduce((acc: Record<string, number>, item) => {
        const productId = item.product_id || String(item.id);
        if (!item.bought) {
          acc[productId] = 1;
        }
        return acc;
      }, {});
      setQuantities(initialQuantities);
    }
  }, [wishlistItems]);
  
  // Check if wishlist is 100% complete
  const allItemsBought = wishlistItems.length > 0 && wishlistItems.every(item => item.bought);
  
  // Check if "Add All" was already used
  const fullyAdded = isAnimalFullyAdded(String(animal.id));
  
  useEffect(() => {
    if (allItemsBought && !celebrationShown) {
      setShowCelebration(true);
      setCelebrationShown(true);
    }
  }, [allItemsBought, celebrationShown]);

  const isInCart = (productId: string) => {
    return globalCart.some(item => item.productId === productId);
  };

  const getCartQuantity = (productId: string) => {
    const cartItem = globalCart.find(item => item.productId === productId);
    return cartItem?.quantity || 0;
  };

  // Calculate cart total for this animal
  const cartTotalForAnimal = globalCart
    .filter(item => item.animalId === String(animal.id))
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Calculate total wishlist cost (price × full needed quantity for all items)
  const totalWishlistCost = wishlistItems
    .filter(item => !item.bought)
    .reduce((sum, item) => {
      return sum + (item.price * (item.quantity || 1));
    }, 0);

  // Check if all items are in cart with needed quantities
  const allItemsInCart = wishlistItems.length > 0 && wishlistItems
    .filter(item => !item.bought)
    .every(item => {
      const productId = item.product_id || String(item.id);
      return getCartQuantity(productId) >= (item.quantity || 1);
    });

  const handleQuantityChange = (productId: string, change: number, maxLimit: number) => {
    setQuantities((prev) => {
      const currentQty = prev[productId] || 1;
      const newQty = Math.max(1, Math.min(maxLimit, currentQty + change));
      return { ...prev, [productId]: newQty };
    });
  };

  const handleAddToCart = (e: React.MouseEvent, item: WishlistItem) => {
    e.stopPropagation();
    const productId = item.product_id || String(item.id);
    const quantity = quantities[productId] || 1;
    addToCart({
      productId,
      productName: item.name,
      price: item.price,
      maxQuantity: item.quantity,
      animalId: String(animal.id),
      animalName: animal.name,
    }, quantity);
  };

  const handleRemoveFromCart = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    removeFromCart(productId);
  };

  const handleBuyAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Filter out items that are already bought
    const availableItems = wishlistItems.filter(item => !item.bought);
    
    if (availableItems.length === 0) {
      return; // Don't add anything if all items are bought
    }
    
    const items = availableItems.map(item => ({
      productId: item.product_id || String(item.id),
      productName: item.name,
      price: item.price,
      maxQuantity: item.quantity, // Dodaj pełną potrzebną ilość
      animalId: String(animal.id),
      animalName: animal.name,
    }));
    addAllForAnimal(items, animal.name);
    markAnimalAsAdded(String(animal.id));
  };

  const handleOrganizationClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/organizacje/${animal.organizationSlug || animal.organization.toLowerCase().replace(/\s+/g, '-')}`);
  };

  // Calculate age display
  const ageDisplay = animal.birth_date 
    ? calculateAnimalAge(animal.birth_date)?.displayText 
    : animal.age;

  return (
    <>
      {showCelebration && (
        <WishlistCelebration 
          animalName={animal.name} 
          onComplete={() => setShowCelebration(false)}
        />
      )}
      <Card
      className="group overflow-hidden bg-card hover:shadow-bubbly transition-all duration-300 hover:-translate-y-3 rounded-[50px] md:rounded-3xl border-0 shadow-card cursor-pointer relative flex flex-col animate-fade-in"
      onClick={() => navigate(`/zwierze/${animal.id}`)}
    >
      {/* Decorative bubbly elements */}
      <div className="absolute top-2 left-2 w-4 h-4 bg-primary/20 rounded-full animate-bounce-gentle z-10"></div>
      <div className="absolute top-6 right-6 w-2 h-2 bg-accent/30 rounded-full animate-bounce-gentle delay-300 z-10"></div>
      
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-t-3xl">
        <img 
          src={animal.image} 
          alt={`${animal.name} - ${animal.species.toLowerCase()} szukający domu`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Progress indicator overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <WishlistProgressBar wishlist={wishlistItems} compact />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4 relative flex flex-col flex-1">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">{animal.name}</h3>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center space-x-1 bg-muted/50 px-2 py-1 rounded-full">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{ageDisplay}</span>
            </div>
            <div className="flex items-center space-x-1 bg-muted/50 px-2 py-1 rounded-full">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">{animal.location}</span>
            </div>
          </div>
          
          {/* Organization - clickable */}
          <button
            onClick={handleOrganizationClick}
            className="text-sm text-primary hover:text-primary/80 font-semibold transition-colors underline-offset-2 hover:underline"
          >
            {animal.organization}
          </button>
        </div>

        {/* Wishlist - scrollable with modern design */}
        {wishlistItems.length > 0 && (
          <div className="flex-1 flex flex-col min-h-0">
            <h4 className="text-sm font-semibold text-foreground mb-2">Lista życzeń:</h4>
            <ScrollArea className="h-[250px] pr-4">
              <TooltipProvider>
                <div className="space-y-2">
                  {wishlistItems.map((item) => {
                    const productId = item.product_id || String(item.id);
                    const quantity = quantities[productId] || 1;
                    const itemInCart = isInCart(productId);
                    const cartQuantity = getCartQuantity(productId);
                    const neededQuantity = item.quantity || 1;
                    
                    return (
                      <div 
                        key={item.id} 
                        className={`flex gap-3 p-3 rounded-xl transition-all ${
                          item.bought 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-white border border-gray-100 shadow-sm hover:border-primary/20'
                        }`}
                      >
                        {/* 1. KOLUMNA: Obrazek produktu (Fixed Width) */}
                        <div className="shrink-0">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted border border-border">
                            <img 
                              src={item.image_url || '/placeholder.svg'} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>

                        {/* 2. KOLUMNA: Informacje o produkcie (Flex-1) */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div>
                            <p className={`text-sm font-bold leading-tight line-clamp-2 mb-1 ${
                              item.bought ? 'text-green-700 line-through' : 'text-foreground'
                            }`} title={item.name}>
                              {item.name}
                            </p>
                            {!item.bought && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setQuantities(prev => ({ ...prev, [productId]: neededQuantity }));
                                    }}
                                    className="text-xs text-muted-foreground hover:text-primary transition-colors text-left underline decoration-dotted"
                                  >
                                    Potrzeba: {neededQuantity} szt
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">Kliknij, aby ustawić {neededQuantity} szt</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                          <div className={`text-base font-bold ${
                            item.bought ? 'text-green-600' : 'text-primary'
                          }`}>
                            {item.price.toFixed(2)} zł
                          </div>
                        </div>

                        {/* 3. KOLUMNA: Akcje (Fixed Width, Horizontal Layout) */}
                        <div className="flex flex-col justify-end items-end shrink-0 pl-2">
                          {item.bought ? (
                            <span className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg font-semibold">
                              ✓ Kupione
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              {/* Licznik ilości */}
                              <div className="flex items-center bg-gray-50 rounded-lg h-9 p-1 shadow-inner">
                                <button 
                                  className="w-6 h-full flex items-center justify-center text-gray-500 hover:text-primary hover:bg-white rounded-md transition-all disabled:opacity-30"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuantityChange(productId, -1, neededQuantity);
                                  }}
                                  disabled={quantity <= 1}
                                >
                                  -
                                </button>
                                <span className="w-6 text-center text-sm font-bold tabular-nums">
                                  {quantity}
                                </span>
                                <button 
                                  className="w-6 h-full flex items-center justify-center text-gray-500 hover:text-primary hover:bg-white rounded-md transition-all disabled:opacity-30"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuantityChange(productId, 1, neededQuantity);
                                  }}
                                  disabled={quantity >= neededQuantity}
                                >
                                  +
                                </button>
                              </div>

                              {/* Przycisk Usuń z koszyka (jeśli dodano) */}
                              {itemInCart && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-9 w-9 rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors"
                                  onClick={(e) => handleRemoveFromCart(e, productId)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}

                              {/* Przycisk Dodaj/Dodano do koszyka */}
                              <div className="relative">
                                <Button
                                  size="icon"
                                  className={`h-9 w-9 rounded-xl transition-all ${
                                    itemInCart 
                                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                                      : 'bg-primary hover:bg-primary/90 text-white shadow-bubbly hover:scale-105'
                                  }`}
                                  onClick={(e) => handleAddToCart(e, item)}
                                  disabled={itemInCart}
                                >
                                  <ShoppingCart className="h-4 w-4" />
                                </Button>
                                {cartQuantity > 0 && (
                                  <Badge 
                                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white border-2 border-background rounded-full"
                                  >
                                    {cartQuantity}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TooltipProvider>
            </ScrollArea>
          </div>
        )}

        {/* Buy All Button with improved footer */}
        <div className="pt-3 border-t border-border/30 space-y-2">
          {(() => {
            const availableItems = wishlistItems.filter(item => !item.bought);
            const allBought = availableItems.length === 0;
            
            return (
              <>
                {/* Cart Total for this animal */}
                {cartTotalForAnimal > 0 && (
                  <div className="flex items-center justify-between text-sm pb-2 border-b border-border/30">
                    <span className="text-muted-foreground">Łącznie w koszyku:</span>
                    <span className="font-bold text-foreground">{cartTotalForAnimal.toFixed(2)} zł</span>
                  </div>
                )}

                <Button 
                  variant="success" 
                  size="sm" 
                  className={`w-full rounded-xl font-bold shadow-sm ${
                    allItemsInCart ? 'bg-green-500 hover:bg-green-600' : ''
                  }`}
                  onClick={handleBuyAll}
                  disabled={allBought}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {allBought 
                    ? 'Wszystko kupione!' 
                    : allItemsInCart 
                    ? `Dodano (${totalWishlistCost.toFixed(2)} zł)` 
                    : `Dodaj wszystko! (${totalWishlistCost.toFixed(2)} zł)`
                  }
                </Button>
              </>
            );
          })()}
        </div>
      </div>
    </Card>
    </>
  );
};

export default AnimalCard;