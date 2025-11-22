import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, ShoppingCart, Users, Cake, Heart, PawPrint } from "lucide-react";
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

  // Check if wishlist is 100% complete
  const allItemsBought = animal?.wishlist?.length > 0 && animal.wishlist.every((item: any) => item.bought);
  
  useEffect(() => {
    if (allItemsBought && !celebrationShown) {
      setShowCelebration(true);
      setCelebrationShown(true);
    }
  }, [allItemsBought, celebrationShown]);

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

  const handleAddToCart = (item: any) => {
    if (!item.product_id) return;
    addToCart({
      productId: item.product_id,
      productName: item.name,
      price: item.price,
      animalId: id,
      animalName: animal.name,
    });
  };

  const handleAddAllToCart = () => {
    const availableItems = animal.wishlist.filter((item: any) => !item.bought);
    const items = availableItems.map((item: any) => ({
      productId: item.product_id,
      productName: item.name,
      price: item.price,
      animalId: id,
      animalName: animal.name,
    }));
    addAllForAnimal(items, animal.name);
  };

  const isInCart = (itemId: string) => {
    return globalCart.some(cartItem => cartItem.productId === itemId);
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
              <WishlistProgressBar wishlist={animal.wishlist} />

              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-foreground">Lista potrzeb</h2>
                  {animal.wishlist.some((item: any) => !item.bought) && (
                    <Button 
                      size="sm"
                      onClick={handleAddAllToCart}
                      className="text-xs"
                    >
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Kup wszystko
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  {animal.wishlist.map((item: any) => {
                    const itemInCart = isInCart(item.product_id);
                    return (
                      <div 
                        key={item.id}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          item.bought 
                            ? 'bg-muted/50 border-muted' 
                            : 'bg-card border-border'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className={`font-medium ${item.bought ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                              {item.name}
                            </h4>
                            {item.bought && (
                              <Badge variant="secondary" className="mt-1">✓ Kupione</Badge>
                            )}
                          </div>
                          <span className={`font-bold ml-2 ${item.bought ? 'text-muted-foreground' : 'text-primary'}`}>
                            {Number(item.price).toFixed(2)} zł
                          </span>
                        </div>
                        {!item.bought && (
                          <Button 
                            size="sm"
                            className="w-full mt-2"
                            variant={itemInCart ? "secondary" : "default"}
                            onClick={() => handleAddToCart(item)}
                            disabled={itemInCart}
                          >
                            {itemInCart ? (
                              <>
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                W koszyku
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Dodaj do koszyka
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AnimalProfile;
