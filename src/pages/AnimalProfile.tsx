import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, ShoppingCart, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import WishlistProgressBar from "@/components/WishlistProgressBar";
import { WishlistCelebration } from "@/components/WishlistCelebration";
import { useAnimalsWithWishlists } from "@/hooks/useAnimalsWithWishlists";

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
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Card className="overflow-hidden rounded-3xl">
                    <div className="aspect-square relative">
                      <img 
                        src={animal.image || '/placeholder.svg'} 
                        alt={animal.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Card>
                  
                  {/* Gallery Images */}
                  {animal.gallery && animal.gallery.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {animal.gallery.map((img: any) => (
                        <Card key={img.id} className="overflow-hidden rounded-2xl">
                          <div className="aspect-square relative">
                            <img 
                              src={img.image_url} 
                              alt={`${animal.name} gallery`}
                              className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            />
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                <Card className="p-6">
                  <h1 className="text-3xl font-bold text-foreground mb-2">{animal.name}</h1>
                  <div className="flex items-center text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{animal.age}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{animal.location}</span>
                  </div>
                  <div className="flex items-center text-primary font-medium">
                    <Users className="h-4 w-4 mr-2" />
                    <Link to={`/organizacje/${animal.organizationSlug}`} className="hover:underline">
                      {animal.organization}
                    </Link>
                  </div>
                </Card>
              </div>

              {animal.description && (
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-foreground mb-4">O mnie</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {animal.description}
                  </p>
                </Card>
              )}

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Szczegóły</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gatunek:</span>
                    <span className="font-medium text-foreground">{animal.species}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Wiek:</span>
                    <span className="font-medium text-foreground">{animal.age}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Liczba potrzeb:</span>
                    <Badge variant="default">
                      {animal.wishlist.length} {animal.wishlist.length === 1 ? 'produkt' : 'produkty'}
                    </Badge>
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
