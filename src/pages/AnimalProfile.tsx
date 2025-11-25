import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ArrowLeft, MapPin, Calendar, ShoppingCart, Users, Cake, Heart, PawPrint } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import WishlistProgressBar from "@/components/WishlistProgressBar";
import { WishlistCelebration } from "@/components/WishlistCelebration";
import { useAnimalsWithWishlists } from "@/hooks/useAnimalsWithWishlists";
import { calculateAnimalAge, formatDetailedAge } from "@/lib/utils/ageCalculator";
import AnimalProfileSkeleton from "@/components/AnimalProfileSkeleton";
import { WishlistProductCard } from "@/components/WishlistProductCard";
import { toast } from "sonner";

const AnimalProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationShown, setCelebrationShown] = useState(false);
  const { addToCart, addAllForAnimal, cart: globalCart, removeFromCart } = useCart();
  const { animals, loading } = useAnimalsWithWishlists();

  const animal = animals.find(a => a.id === id);

  // State for quantity counters
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Check if wishlist is 100% complete
  const allItemsBought = animal?.wishlist?.length > 0 && animal.wishlist.every((item: any) => item.bought);
  
  useEffect(() => {
    if (allItemsBought && !celebrationShown) {
      setShowCelebration(true);
      setCelebrationShown(true);
    }
  }, [allItemsBought, celebrationShown]);

  // Initialize quantities when animal loads
  useEffect(() => {
    if (animal?.wishlist) {
      const initialQuantities = animal.wishlist.reduce((acc: Record<string, number>, item: any) => {
        if (!item.bought) {
          acc[item.product_id] = 1;
        }
        return acc;
      }, {});
      setQuantities(initialQuantities);
    }
  }, [animal?.wishlist]);

  if (loading) {
    return <AnimalProfileSkeleton />;
  }

  if (!animal) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Zwierzę nie zostało znalezione</h1>
          <Button onClick={() => navigate("/")}>Wróć do strony głównej</Button>
        </div>
      </div>
    );
  }

  const handleQuantityChange = (productId: string, change: number) => {
    setQuantities((prev) => {
      const currentQty = prev[productId] || 1;
      const newQty = Math.max(1, currentQty + change); // Min: 1
      return { ...prev, [productId]: newQty };
    });
  };

  const handleAddToCart = (item: any) => {
    if (!item.product_id) return;
    const quantity = quantities[item.product_id] || 1;
    addToCart(
      {
        productId: item.product_id,
        productName: item.name,
        price: item.price,
        animalId: id,
        animalName: animal.name,
      },
      quantity
    );
  };

  const handleAddAllToCart = () => {
    const availableItems = animal.wishlist.filter((item: any) => !item.bought);
    const items = availableItems.map((item: any) => ({
      productId: item.product_id,
      productName: item.name,
      price: item.price,
      animalId: id,
      animalName: animal.name,
      maxQuantity: item.quantity || 1,
    }));
    
    const totalCount = availableItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
    const totalPrice = availableItems.reduce((sum: number, item: any) => sum + (item.price * (item.quantity || 1)), 0);
    
    addAllForAnimal(items, animal.name);
    
    toast.success(`Dodano do koszyka ${totalCount} produktów (${totalPrice.toFixed(2)} zł) dla: ${animal.name}`);
  };

  const isInCart = (itemId: string) => {
    return globalCart.some(cartItem => cartItem.productId === itemId);
  };

  const getCartQuantity = (productId: string) => {
    const cartItem = globalCart.find(item => item.productId === productId);
    return cartItem?.quantity || 0;
  };

  // Oblicz łącznie za produkty w koszyku dla tego zwierzęcia
  const cartTotalForAnimal = globalCart
    .filter(item => item.animalId === id)
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Oblicz kwotę wszystkich brakujących produktów (cena × potrzebna ilość dla każdego produktu)
  const totalMissingCost = animal?.wishlist
    .filter((item: any) => !item.bought)
    .reduce((sum: number, item: any) => {
      const productId = item.product_id || String(item.id);
      const neededQuantity = (item.quantity || 1) - getCartQuantity(productId);
      return sum + (Number(item.price) * Math.max(0, neededQuantity));
    }, 0) || 0;

  // Oblicz całkowitą wartość wishlisty (ile kosztuje wypełnienie całej listy)
  const totalWishlistCost = animal?.wishlist
    .filter((item: any) => !item.bought)
    .reduce((sum: number, item: any) => {
      return sum + (Number(item.price) * (item.quantity || 1));
    }, 0) || 0;

  // Sprawdź czy wszystkie potrzebne produkty są już w koszyku
  const allItemsInCart = animal?.wishlist
    .filter((item: any) => !item.bought)
    .every((item: any) => {
      const neededQuantity = item.quantity || 1;
      return getCartQuantity(item.product_id) >= neededQuantity;
    }) && animal?.wishlist.some((item: any) => !item.bought);

  // Calculate age display
  const ageInfo = animal?.birth_date ? calculateAnimalAge(animal.birth_date) : null;
  const ageDisplay = animal?.birth_date 
    ? formatDetailedAge(animal.birth_date)
    : animal?.age || 'Wiek nieznany';

  return (
    <>
      {showCelebration && animal && (
        <WishlistCelebration 
          animalName={animal.name} 
          onComplete={() => setShowCelebration(false)}
        />
      )}
      <div className="min-h-screen bg-background">
        <main className="md:container md:mx-auto md:max-w-7xl md:px-8 py-8 px-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Wróć do listy zwierząt
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Main Card with Name, Image, Details and Gallery */}
              <Card className="p-6 md:p-8 rounded-3xl">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-shrink-0">
                    <div className="w-64 h-64 rounded-3xl overflow-hidden border-4 border-primary/20 shadow-bubbly mb-3">
                      <img 
                        src={animal.image || '/placeholder.svg'} 
                        alt={animal.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Gallery thumbnails - small under profile photo */}
                    {animal.gallery && animal.gallery.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 w-64">
                        {animal.gallery.slice(0, 3).map((img: any) => (
                          <div key={img.id} className="aspect-square rounded-lg overflow-hidden border border-border cursor-pointer hover:opacity-90 transition-opacity">
                            <img 
                              src={img.image_url} 
                              alt={`${animal.name} gallery`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-6">
                    <div>
                      <h1 className="text-4xl font-bold text-foreground mb-4">{animal.name}</h1>
                      <div className="flex flex-wrap gap-3 mb-4">
                        <Badge variant="secondary" className="text-sm px-3 py-1">
                          <PawPrint className="h-4 w-4 mr-1" />
                          {animal.species}
                        </Badge>
                      </div>
                    </div>

                    {/* Metryczka */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Heart className="h-5 w-5 text-primary" />
                        Metryczka
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                          <div className="flex items-center gap-2">
                            <PawPrint className="h-4 w-4 text-primary" />
                            <span className="text-sm text-muted-foreground">Gatunek</span>
                          </div>
                          <span className="text-sm font-semibold text-foreground">{animal.species}</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                          <div className="flex items-center gap-2">
                            <Cake className="h-4 w-4 text-primary" />
                            <span className="text-sm text-muted-foreground">Wiek</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-semibold text-foreground block">{ageDisplay}</span>
                            {ageInfo && (
                              <span className="text-xs text-muted-foreground">
                                {ageInfo.days} dni / {ageInfo.weeks} tyg. / {ageInfo.months} mies.
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            <span className="text-sm text-muted-foreground">Organizacja</span>
                          </div>
                          <Link 
                            to={`/organizacje/${animal.organizationSlug}`}
                            className="text-sm font-semibold text-primary hover:text-primary/80 hover:underline"
                          >
                            {animal.organization}
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* O mnie */}
                    {animal.description && (
                      <div>
                        <h2 className="text-lg font-bold text-foreground mb-3">O mnie</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {animal.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Modernized Wishlist Card with Sticky Footer */}
              <Card className="p-0 flex flex-col h-[600px] rounded-3xl overflow-hidden shadow-lg">
                {/* Header with Progress */}
                <div className="p-6 pb-4 border-b bg-gradient-to-r from-primary/5 to-transparent space-y-4">
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary fill-primary" />
                    Potrzeby {animal.name}
                  </h2>
                  <WishlistProgressBar wishlist={animal.wishlist} />
                </div>

                {/* Body - Scrollable List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <TooltipProvider>
                    {animal.wishlist.map((item: any) => {
                      const itemInCart = isInCart(item.product_id);
                      const cartQuantity = getCartQuantity(item.product_id);
                      const quantity = quantities[item.product_id] || 1;
                      const neededQuantity = item.quantity || 1;
                      
                      return (
                        <WishlistProductCard
                          key={item.id}
                          product={{
                            id: item.id,
                            product_id: item.product_id,
                            name: item.name,
                            price: item.price,
                            image_url: item.image_url,
                            quantity: neededQuantity,
                            bought: item.bought,
                          }}
                          quantity={quantity}
                          maxQuantity={neededQuantity}
                          isInCart={itemInCart}
                          cartQuantity={cartQuantity}
                          onQuantityChange={(productId, change) => handleQuantityChange(productId, change)}
                          onAddToCart={handleAddToCart}
                          onRemoveFromCart={removeFromCart}
                          showSmartFill={!item.bought}
                          onSmartFill={(productId, qty) => setQuantities(prev => ({ ...prev, [productId]: qty }))}
                        />
                      );
                    })}
                  </TooltipProvider>
                </div>

                {/* Footer - Sticky Summary */}
                {animal.wishlist.some((item: any) => !item.bought) && (
                  <div className="bg-gradient-to-t from-primary/5 to-background p-5 border-t shadow-lg space-y-3">
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
                    
                    {/* Dodaj wszystko do koszyka */}
                    <Button 
                      size="default"
                      onClick={handleAddAllToCart}
                      disabled={!animal.wishlist.some((item: any) => !item.bought)}
                      className={`w-full rounded-3xl md:rounded-xl font-semibold text-sm h-11 shadow-md md:hover:shadow-lg md:hover:scale-[1.02] transition-all duration-200 ${
                        allItemsInCart ? 'bg-green-500 md:hover:bg-green-600' : ''
                      }`}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {allItemsInCart 
                        ? `Dodano (${totalWishlistCost.toFixed(2)} zł)` 
                        : `Dodaj wszystko! (${totalWishlistCost.toFixed(2)} zł)`
                      }
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AnimalProfile;
