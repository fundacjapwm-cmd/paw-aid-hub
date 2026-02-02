import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Calendar, ShoppingCart, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import WishlistProgressBar from "@/components/WishlistProgressBar";
import { useState, useEffect } from "react";
import { calculateAnimalAge } from "@/lib/utils/ageCalculator";
import { WishlistProductCard } from "@/components/WishlistProductCard";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface WishlistItem {
  id: string | number;
  name: string;
  price: number;
  netPrice?: number;
  urgent?: boolean;
  bought?: boolean;
  product_id?: string;
  quantity: number;
  purchasedQuantity?: number;
  image_url?: string;
  description?: string;
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
  fromOrganizationProfile?: boolean;
}

const AnimalCard = ({ animal, fromOrganizationProfile = false }: AnimalCardProps) => {
  const { addToCart, addAllForAnimal, isAnimalFullyAdded, markAnimalAsAdded, cart: globalCart, removeFromCart, removeAllForAnimal } = useCart();
  const navigate = useNavigate();
  
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
  
  // Check if "Add All" was already used
  const fullyAdded = isAnimalFullyAdded(String(animal.id));

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
      netPrice: item.netPrice,
      maxQuantity: item.quantity,
      animalId: String(animal.id),
      animalName: animal.name,
    }, quantity);
  };

  const handleRemoveFromCart = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    removeFromCart(productId, String(animal.id));
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
      netPrice: item.netPrice,
      maxQuantity: item.quantity, // Dodaj pełną potrzebną ilość
      animalId: String(animal.id),
      animalName: animal.name,
    }));
    
    const totalCount = availableItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const totalPrice = availableItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    
    addAllForAnimal(items, animal.name);
    markAnimalAsAdded(String(animal.id));
    
    toast.success(`Dodano do koszyka ${totalCount} produktów (${totalPrice.toFixed(2)} zł) dla: ${animal.name}`);
  };

  const handleRemoveAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeAllForAnimal(String(animal.id), animal.name);
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
      <Card
      className="overflow-hidden bg-card rounded-[50px] md:rounded-3xl border-0 shadow-card cursor-pointer relative flex flex-col animate-fade-in"
      onClick={() => navigate(`/zwierze/${animal.id}`, { 
        state: fromOrganizationProfile ? { 
          fromOrganizationProfile: true, 
          organizationName: animal.organization,
          organizationSlug: animal.organizationSlug 
        } : undefined 
      })}
    >
      {/* Decorative bubbly elements */}
      <div className="absolute top-2 left-2 w-4 h-4 bg-primary/20 rounded-full animate-bounce-gentle z-10"></div>
      <div className="absolute top-6 right-6 w-2 h-2 bg-accent/30 rounded-full animate-bounce-gentle delay-300 z-10"></div>
      
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-t-3xl">
        <img 
          src={animal.image} 
          alt={`${animal.name} - ${animal.species.toLowerCase()} szukający domu`}
          className="w-full h-full object-cover"
        />
        
        {/* Progress indicator overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <WishlistProgressBar wishlist={wishlistItems} compact />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 space-y-4 relative flex flex-col flex-1">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-2">{animal.name}</h3>
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
            className="text-sm text-primary-dark md:hover:text-primary-dark/80 font-semibold transition-colors underline-offset-2 md:hover:underline"
          >
            {animal.organization}
          </button>
        </div>

        {/* Wishlist - scrollable with modern design */}
        {wishlistItems.length > 0 && (
          <div className="flex-1 flex flex-col min-h-0">
            <h4 className="text-sm font-semibold text-foreground mb-2">Lista życzeń:</h4>
            <ScrollArea className="h-[250px] pr-4">
              <div className="space-y-2">
                {wishlistItems.map((item) => {
                  const productId = item.product_id || String(item.id);
                  const quantity = quantities[productId] || 1;
                  const neededQuantity = item.quantity || 1;
                  const isFullyBought = item.bought || false;

                  return (
                    <div key={item.id} onClick={(e) => e.stopPropagation()}>
                      <WishlistProductCard
                        product={{
                          id: productId,
                          name: item.name,
                          price: item.price,
                          image_url: item.image_url,
                          description: item.description,
                          quantity: neededQuantity,
                          purchasedQuantity: item.purchasedQuantity || 0,
                          bought: isFullyBought,
                        }}
                        quantity={quantity}
                        maxQuantity={neededQuantity}
                        isInCart={isInCart(productId)}
                        cartQuantity={getCartQuantity(productId)}
                        onQuantityChange={(_, change) => handleQuantityChange(productId, change, neededQuantity)}
                        showSmartFill={neededQuantity > 1 && !isFullyBought}
                        onSmartFill={(_, qty) => setQuantities(prev => ({ ...prev, [productId]: qty }))}
                        onAddToCart={() => handleAddToCart({ stopPropagation: () => {} } as any, item)}
                        onRemoveFromCart={() => removeFromCart(productId, String(animal.id))}
                      />
                    </div>
                  );
                })}
              </div>
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
                  size="lg" 
                  className={`w-full rounded-3xl md:rounded-xl font-bold shadow-sm py-6 transition-all md:hover:shadow-md md:hover:scale-[1.02] ${
                    allItemsInCart ? 'bg-green-500 hover:bg-green-600' : ''
                  }`}
                  onClick={handleBuyAll}
                  disabled={allBought || allItemsInCart}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {allBought 
                    ? 'Wszystko kupione!' 
                    : allItemsInCart 
                    ? `Dodano (${totalWishlistCost.toFixed(2)} zł)` 
                    : `Dodaj wszystko! (${totalWishlistCost.toFixed(2)} zł)`
                  }
                </Button>
                
                {/* Remove all button - shows when items are in cart */}
                {cartTotalForAnimal > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full rounded-3xl md:rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Usuń wszystko z koszyka
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Czy na pewno chcesz usunąć?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Wszystkie produkty dla {animal.name} zostaną usunięte z koszyka.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Anuluj</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRemoveAll} className="bg-destructive hover:bg-destructive/90">
                          Usuń
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
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