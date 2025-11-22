import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Calendar, ShoppingCart } from "lucide-react";
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
  const { addToCart, addAllForAnimal, isAnimalFullyAdded, markAnimalAsAdded } = useCart();
  const navigate = useNavigate();
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationShown, setCelebrationShown] = useState(false);
  
  const wishlistItems = animal.wishlist || [];
  
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

  const handleAddToCart = (e: React.MouseEvent, item: WishlistItem) => {
    e.stopPropagation();
    addToCart({
      productId: item.product_id || String(item.id),
      productName: item.name,
      price: item.price,
      maxQuantity: item.quantity,
      animalId: String(animal.id),
      animalName: animal.name,
    });
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
      maxQuantity: item.quantity,
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
      className="group overflow-hidden bg-card hover:shadow-bubbly transition-all duration-300 hover:-translate-y-3 rounded-3xl border-0 shadow-card cursor-pointer relative flex flex-col"
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

        {/* Wishlist - scrollable */}
        {wishlistItems.length > 0 && (
          <div className="flex-1 flex flex-col min-h-0">
            <h4 className="text-sm font-semibold text-foreground mb-2">Lista życzeń:</h4>
            <ScrollArea className="flex-1 pr-4" style={{ maxHeight: '200px' }}>
              <div className="space-y-2">
                {wishlistItems.map((item) => (
                  <div 
                    key={item.id} 
                    className={`flex items-center justify-between gap-2 p-2 rounded-lg transition-all ${
                      item.bought 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-muted/30 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium truncate ${
                          item.bought ? 'text-green-700 line-through' : 'text-foreground'
                        }`}>
                          {item.name}
                        </p>
                        {item.bought && (
                          <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                            ✓ Kupione
                          </span>
                        )}
                      </div>
                      <p className={`text-xs font-semibold ${
                        item.bought ? 'text-green-600' : 'text-primary'
                      }`}>
                        {item.price.toFixed(2)} zł {item.quantity > 1 && `(x${item.quantity})`}
                      </p>
                    </div>
                    {!item.bought && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={(e) => handleAddToCart(e, item)}
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Buy All Button */}
        <div className="pt-3 border-t border-border/30">
          {(() => {
            const availableItems = wishlistItems.filter(item => !item.bought);
            const allBought = availableItems.length === 0;
            const totalPrice = availableItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            return (
              <Button 
                variant="success" 
                size="sm" 
                className="w-full rounded-xl font-bold shadow-sm"
                onClick={handleBuyAll}
                disabled={allBought || fullyAdded}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {allBought 
                  ? 'Wszystko kupione!' 
                  : fullyAdded 
                  ? 'Już dodano do koszyka!' 
                  : `Dodaj wszystko do koszyka (${totalPrice.toFixed(2)} zł)`
                }
              </Button>
            );
          })()}
        </div>
      </div>
    </Card>
    </>
  );
};

export default AnimalCard;