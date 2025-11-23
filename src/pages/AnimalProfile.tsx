import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, MapPin, Calendar, ShoppingCart, Users, Cake, Heart, PawPrint, Plus, Minus, X } from "lucide-react";
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
      maxQuantity: item.quantity || 1,
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
                          className="flex gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-primary/20 transition-colors"
                        >
                          {/* 1. KOLUMNA: ZDJĘCIE (Fixed) */}
                          <div className="shrink-0">
                            <img 
                              src={item.image_url || '/placeholder.svg'} 
                              alt={item.name}
                              className="w-20 h-20 rounded-xl object-cover bg-gray-50"
                            />
                          </div>

                          {/* 2. KOLUMNA: TREŚĆ (Flexible) */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                            {/* Góra: Nazwa produktu */}
                            <h4 
                              className={`text-sm font-semibold leading-tight line-clamp-2 ${item.bought ? 'text-muted-foreground line-through' : 'text-foreground'}`}
                              title={item.name}
                            >
                              {item.name}
                            </h4>
                            
                            {/* Dół: Cena + Smart Shortcut */}
                            <div>
                              <div className={`font-bold text-base ${item.bought ? 'text-muted-foreground' : 'text-primary'}`}>
                                {Number(item.price).toFixed(2)} zł
                              </div>
                              
                              {!item.bought && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() => setQuantities(prev => ({ ...prev, [item.product_id]: neededQuantity }))}
                                      className="text-xs text-muted-foreground hover:text-primary transition-colors text-left underline decoration-dotted"
                                    >
                                      Brakuje: {neededQuantity} szt
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Kliknij, aby ustawić {neededQuantity} szt</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}

                              {item.bought && (
                                <Badge variant="secondary" className="text-xs w-fit mt-1">✓ Kupione</Badge>
                              )}
                            </div>
                          </div>

                          {/* 3. KOLUMNA: AKCJE (Poziomy układ) */}
                          {!item.bought && (
                            <div className="flex flex-col justify-end items-end shrink-0 pl-2">
                              {/* Kontener Akcji: Licznik + Przyciski w jednym rzędzie */}
                              <div className="flex items-center gap-2">
                                
                                {/* Licznik */}
                                <div className="flex items-center bg-gray-50 rounded-lg h-9 p-1 shadow-inner">
                                  <button 
                                    className="w-6 h-full flex items-center justify-center text-gray-500 hover:text-primary hover:bg-white rounded-md transition-all disabled:opacity-30"
                                    onClick={() => handleQuantityChange(item.product_id, -1)}
                                    disabled={quantity <= 1}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </button>
                                  <span className="w-6 text-center text-sm font-bold tabular-nums">
                                    {quantity}
                                  </span>
                                  <button 
                                    className="w-6 h-full flex items-center justify-center text-gray-500 hover:text-primary hover:bg-white rounded-md transition-all disabled:opacity-30"
                                    onClick={() => handleQuantityChange(item.product_id, 1)}
                                    disabled={quantity >= neededQuantity}
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
                                        onClick={() => removeFromCart(item.product_id)}
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
                                        onClick={() => handleAddToCart(item)}
                                        disabled={itemInCart}
                                      >
                                        {itemInCart ? (
                                          <ShoppingCart className="h-4 w-4" />
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
                      className={`w-full rounded-xl font-semibold text-sm h-11 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 ${
                        allItemsInCart ? 'bg-green-500 hover:bg-green-600' : ''
                      }`}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {allItemsInCart 
                        ? `Dodano do koszyka (${totalWishlistCost.toFixed(2)} zł)` 
                        : `Dodaj wszystko do koszyka! (${totalWishlistCost.toFixed(2)} zł)`
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
