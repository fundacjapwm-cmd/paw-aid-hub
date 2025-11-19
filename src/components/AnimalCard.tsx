import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Calendar, ShoppingCart } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";

interface WishlistItem {
  id: number;
  name: string;
  price: number;
  urgent?: boolean;
  bought?: boolean;
}

interface Animal {
  id: number;
  name: string;
  age: string;
  species: string;
  location: string;
  organization: string;
  organizationSlug?: string;
  description: string;
  image: string;
  wishlistProgress: number;
  urgentNeeds: string[];
  wishlist?: WishlistItem[];
}

interface AnimalCardProps {
  animal: Animal;
}

const AnimalCard = ({ animal }: AnimalCardProps) => {
  const { addToCart, addAllForAnimal } = useCart();
  const navigate = useNavigate();
  
  const wishlistItems = animal.wishlist || [];
  
  // Calculate progress based on bought items
  const boughtCount = wishlistItems.filter(item => item.bought).length;
  const totalCount = wishlistItems.length;
  const progressPercent = totalCount > 0 ? Math.round((boughtCount / totalCount) * 100) : 0;
  
  // Dynamic gradient based on progress (red → yellow → green)
  const getProgressGradient = (percent: number) => {
    if (percent < 33) return 'from-red-500 to-red-400';
    if (percent < 66) return 'from-orange-500 to-yellow-400';
    return 'from-green-500 to-emerald-400';
  };

  const handleAddToCart = (e: React.MouseEvent, item: WishlistItem) => {
    e.stopPropagation();
    addToCart({
      productId: `${animal.id}-${item.id}`,
      productName: item.name,
      price: item.price,
      animalId: String(animal.id),
      animalName: animal.name,
    });
  };

  const handleBuyAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    const items = wishlistItems.map(item => ({
      productId: `${animal.id}-${item.id}`,
      productName: item.name,
      price: item.price,
      animalId: String(animal.id),
      animalName: animal.name,
    }));
    addAllForAnimal(items, animal.name);
  };

  const handleOrganizationClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/organizacje/${animal.organizationSlug || animal.organization.toLowerCase().replace(/\s+/g, '-')}`);
  };

  return (
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
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3 shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-foreground">
                Brzuszek pełny na {progressPercent}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div 
                className={`h-3 rounded-full transition-all duration-700 bg-gradient-to-r ${getProgressGradient(progressPercent)} relative overflow-hidden`}
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {boughtCount} z {totalCount} produktów zakupionych
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4 relative flex flex-col flex-1">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">{animal.name}</h3>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center space-x-1 bg-muted/50 px-2 py-1 rounded-full">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{animal.age}</span>
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
                        {item.price.toFixed(2)} zł
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
          <Button 
            variant="success" 
            size="sm" 
            className="w-full rounded-xl font-bold shadow-sm"
            onClick={handleBuyAll}
          >
            Kup wszystko na liście
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AnimalCard;