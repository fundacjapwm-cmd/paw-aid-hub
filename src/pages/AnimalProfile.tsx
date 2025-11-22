import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, MapPin, Calendar, ShoppingCart, Users, Cake, Heart, PawPrint, Plus, Minus } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import WishlistProgressBar from "@/components/WishlistProgressBar";
import { WishlistCelebration } from "@/components/WishlistCelebration";
import { useAnimalsWithWishlists } from "@/hooks/useAnimalsWithWishlists";
import { calculateAnimalAge, formatDetailedAge } from "@/lib/utils/ageCalculator";

const AnimalProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationShown, setCelebrationShown] = useState(false);
  const { addToCart, addAllForAnimal, cart: globalCart } = useCart();
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
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Ładowanie profilu zwierzęcia...</p>
        </div>
      </div>
    );
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
      maxQuantity: quantities[item.product_id] || 1,
    }));
    addAllForAnimal(items, animal.name);
  };

  const isInCart = (itemId: string) => {
    return globalCart.some(cartItem => cartItem.productId === itemId);
  };

  const getCartQuantity = (productId: string) => {
    const cartItem = globalCart.find(item => item.productId === productId);
    return cartItem?.quantity || 0;
  };

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
        <main className="container mx-auto max-w-7xl px-4 py-8">
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
              <Card className="p-8 rounded-3xl">
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
                        <div 
                          key={item.id}
                          className={`rounded-xl border transition-all duration-200 ${
                            item.bought 
                              ? 'bg-muted/30 border-muted p-3' 
                              : 'bg-card border-border hover:border-primary/30 hover:shadow-md p-4'
                          }`}
                        >
                          <div className="flex gap-3">
                            {/* Product Image */}
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
                              <img 
                                src={item.image_url || '/placeholder.svg'} 
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            {/* Product Info & Actions - Vertical Stack */}
                            <div className="flex-1 min-w-0 space-y-2">
                              {/* Top: Name & Price */}
                              <div>
                                <h4 className={`font-medium text-sm leading-tight line-clamp-2 ${item.bought ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                  {item.name}
                                </h4>
                                <div className="flex items-baseline gap-2 mt-1">
                                  <span className={`font-bold text-base ${item.bought ? 'text-muted-foreground' : 'text-primary'}`}>
                                    {Number(item.price).toFixed(2)} zł
                                  </span>
                                  {!item.bought && neededQuantity > 1 && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={() => setQuantities(prev => ({ ...prev, [item.product_id]: neededQuantity }))}
                                          className="text-xs text-muted-foreground hover:text-primary hover:underline cursor-pointer transition-colors"
                                        >
                                          potrzebne: {neededQuantity} szt
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="text-xs">Kliknij, aby ustawić {neededQuantity} szt</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                              </div>

                              {item.bought ? (
                                <Badge variant="secondary" className="text-xs w-fit">✓ Kupione</Badge>
                              ) : (
                                /* Actions Row */
                                <div className="flex items-center gap-2 flex-wrap">
                                  {/* Counter - minimalist */}
                                  <div className="flex items-center gap-1 bg-muted/50 rounded-lg px-1">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-6 w-6 hover:bg-background transition-all"
                                      onClick={() => handleQuantityChange(item.product_id, -1)}
                                      disabled={quantity <= 1}
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="w-6 text-center text-sm font-semibold text-foreground">
                                      {quantity}
                                    </span>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-6 w-6 hover:bg-background transition-all"
                                      onClick={() => handleQuantityChange(item.product_id, 1)}
                                      disabled={quantity >= neededQuantity}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>

                                  {/* Add Button with badge */}
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="relative ml-auto">
                                        <Button
                                          size="sm"
                                          disabled={itemInCart}
                                          className={`h-8 rounded-lg text-xs font-medium transition-all duration-200 ${
                                            itemInCart 
                                              ? 'bg-green-500 hover:bg-green-600' 
                                              : 'bg-primary hover:bg-primary/90 hover:scale-105'
                                          }`}
                                          onClick={() => handleAddToCart(item)}
                                        >
                                          {itemInCart ? (
                                            <span className="text-xs">✓ Dodano</span>
                                          ) : (
                                            <span className="flex items-center gap-1">
                                              <ShoppingCart className="h-3 w-3" />
                                              Dodaj {quantity > 1 ? `${quantity} szt` : ''}
                                            </span>
                                          )}
                                        </Button>
                                        {cartQuantity > 0 && (
                                          <Badge 
                                            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white border-2 border-background"
                                          >
                                            {cartQuantity}
                                          </Badge>
                                        )}
                                      </div>
                                    </TooltipTrigger>
                                    {cartQuantity > 0 && (
                                      <TooltipContent>
                                        <p className="text-xs">W koszyku: {cartQuantity} szt.</p>
                                      </TooltipContent>
                                    )}
                                  </Tooltip>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </TooltipProvider>
                </div>

                {/* Footer - Sticky Summary */}
                {animal.wishlist.some((item: any) => !item.bought) && (
                  <div className="bg-gradient-to-t from-primary/5 to-background p-5 border-t shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted-foreground font-medium">
                        Łącznie:
                      </span>
                      <span className="text-2xl font-bold text-primary">
                        {animal.wishlist
                          .filter((item: any) => !item.bought)
                          .reduce((sum: number, item: any) => sum + Number(item.price), 0)
                          .toFixed(2)} zł
                      </span>
                    </div>
                    <Button 
                      size="default"
                      onClick={handleAddAllToCart}
                      className="w-full rounded-xl font-semibold text-sm h-11 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Kup wszystkie produkty
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
