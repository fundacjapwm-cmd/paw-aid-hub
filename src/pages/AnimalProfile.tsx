import { useParams, useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ArrowLeft, MapPin, Calendar, Share2, ShoppingCart, Users } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";

// Import generated animal images
import cat1 from "@/assets/cat-1.jpg";
import dog1 from "@/assets/dog-1.jpg";
import dog2 from "@/assets/dog-2.jpg";
import cat2 from "@/assets/cat-2.jpg";

// Mock data - in real app this would come from API
const mockAnimalsData: Record<string, any> = {
  "1": {
    id: 1,
    name: "Filemon",
    age: "2 lata",
    species: "Kot",
    location: "Warszawa",
    organization: "Schronisko Paluch",
    description: "Filemon to spokojny i łagodny kot, który uwielbia się przytulać. Po trudnym początku życia na ulicy, teraz jest gotowy na nowy rozdział w ciepłym domu. Jest bardzo towarzyski, lubi kontakt z ludźmi i uwielbia być głaskany. Filemon jest zdrowy, zaszczepionym i wykastrowany. Szuka ciepłego domu gdzie będzie mógł spędzić resztę życia w spokoju i bezpieczeństwie.",
    images: [cat1, cat1, cat1],
    wishlistProgress: 65,
    urgentNeeds: ["Karma mokra", "Żwirek", "Zabawki"],
    wishlist: [
      { id: 1, name: "Karma mokra Premium dla kotów", price: 89.99, urgent: true, bought: false },
      { id: 2, name: "Żwirek bentonitowy 10kg", price: 45.50, urgent: true, bought: true },
      { id: 3, name: "Zabawki dla kotów - zestaw", price: 32.00, urgent: true, bought: false },
      { id: 4, name: "Legowisko dla kota", price: 120.00, urgent: false, bought: false },
      { id: 5, name: "Drapak sizalowy", price: 180.00, urgent: false, bought: true },
      { id: 6, name: "Miska ceramiczna", price: 25.00, urgent: false, bought: false }
    ],
    story: "Filemon został znaleziony jako mały kociak w parku, wychłodzony i głodny. Dzięki szybkiej reakcji przechodniów trafił do schroniska, gdzie odzyskał siły i zdrowie. Teraz to piękny, spokojny kot, który kocha ludzi i zasługuje na prawdziwy dom.",
    personality: ["Spokojny", "Łagodny", "Towarzyski", "Lubi głaski", "Przytulny"],
    medicalInfo: "Zdrowy, zaszczepiony, wykastrowany, odrobaczony"
  },
  "2": {
    id: 2,
    name: "Burek",
    age: "5 lat",
    species: "Pies",
    location: "Kraków",
    organization: "Fundacja Cztery Łapy",
    description: "Burek to energiczny golden retriever, który kocha spacery i zabawy. Idealny kompan dla aktywnej rodziny z dziećmi. Jest bardzo przyjazny, inteligentny i posłuszny.",
    images: [dog1, dog1, dog1],
    wishlistProgress: 40,
    urgentNeeds: ["Karma sucha", "Smycz", "Miska"],
    wishlist: [
      { id: 1, name: "Karma sucha dla psów dużych ras", price: 159.99, urgent: true, bought: false },
      { id: 2, name: "Smycz treningowa", price: 75.00, urgent: true, bought: false },
      { id: 3, name: "Miska stalowa antypoślizgowa", price: 45.00, urgent: true, bought: false },
      { id: 4, name: "Zabawki dla psów", price: 80.00, urgent: false, bought: true }
    ],
    story: "Burek trafił do schroniska gdy jego poprzedni właściciel nie mógł się nim dłużej opiekować. To pies pełen energii, który potrzebuje aktywnej rodziny.",
    personality: ["Energiczny", "Przyjazny", "Inteligentny", "Lubi dzieci", "Posłuszny"],
    medicalInfo: "Zdrowy, zaszczepiony, czipowany"
  },
  "3": {
    id: 3,
    name: "Luna",
    age: "3 lata",
    species: "Pies",
    location: "Gdańsk",
    organization: "Schronisko Promyk",
    description: "Inteligentna border collie, która potrzebuje mentalnej stymulacji. Świetnie nadaje się do nauki sztuczek.",
    images: [dog2, dog2, dog2],
    wishlistProgress: 80,
    urgentNeeds: ["Zabawki logiczne", "Karma premium"],
    wishlist: [
      { id: 1, name: "Zabawki logiczne dla psów", price: 120.00, urgent: true, bought: true },
      { id: 2, name: "Karma premium dla aktywnych psów", price: 180.00, urgent: true, bought: true },
      { id: 3, name: "Mata do jedzenia", price: 45.00, urgent: false, bought: false }
    ],
    story: "Luna to bardzo inteligentna suczka border collie. Potrzebuje rodziny, która zapewni jej odpowiednią ilość aktywności fizycznej i mentalnej.",
    personality: ["Bardzo inteligentna", "Aktywna", "Lojalny", "Uczciwa", "Potrzebuje stymulacji"],
    medicalInfo: "Zdrowa, zaszczepiona, sterylizowana"
  },
  "4": {
    id: 4,
    name: "Micia",
    age: "1 rok",
    species: "Kot",
    location: "Wrocław",
    organization: "Kotki Ratunkowe",
    description: "Młoda kotka pełna energii. Uwielbia bawić się i eksplorować. Szuka domu z ogrodem lub balkonem.",
    images: [cat2, cat2, cat2],
    wishlistProgress: 25,
    urgentNeeds: ["Drapak", "Karma dla kociąt", "Legowisko"],
    wishlist: [
      { id: 1, name: "Drapak sizalowy wysoki", price: 200.00, urgent: true, bought: false },
      { id: 2, name: "Karma dla młodych kotów", price: 95.00, urgent: true, bought: false },
      { id: 3, name: "Legowisko z poduszką", price: 85.00, urgent: true, bought: false },
      { id: 4, name: "Zabawki interaktywne", price: 65.00, urgent: false, bought: true }
    ],
    story: "Micia została znaleziona jako bezdomne kocię. Jest bardzo żywiołowa i ciekawska. Potrzebuje domu gdzie będzie mogła bezpiecznie eksplorować.",
    personality: ["Żywiołowa", "Ciekawska", "Młoda", "Energiczna", "Zabawna"],
    medicalInfo: "Zdrowa, zaszczepiona, sterylizowana"
  }
};

const AnimalProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart, cart: globalCart } = useCart();

  const animal = mockAnimalsData[id || "1"];

  if (!animal) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Zwierzę nie zostało znalezione</h1>
          <Button onClick={() => navigate("/")}>Wróć do strony głównej</Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = (item: any) => {
    addToCart({
      productId: item.id.toString(),
      productName: item.name,
      price: item.price,
      animalId: id,
      animalName: animal.name,
    });
  };

  const handleAddAllToCart = () => {
    const availableItems = animal.wishlist.filter((item: any) => !item.bought);
    availableItems.forEach((item: any) => {
      addToCart({
        productId: item.id.toString(),
        productName: item.name,
        price: item.price,
        animalId: id,
        animalName: animal.name,
      });
    });
  };

  const isInCart = (itemId: number) => {
    return globalCart.some(cartItem => cartItem.productId === itemId.toString());
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto max-w-7xl px-4 py-8">
        {/* Back button */}
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
          {/* Left Column - Photos, Info and Description */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Photo */}
            <Card className="overflow-hidden rounded-3xl">
              <div className="aspect-square relative">
                <img 
                  src={animal.images[currentImageIndex]} 
                  alt={`${animal.name} - zdjęcie ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Button variant="outline" size="sm" className="bg-white/90 backdrop-blur-sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Photo thumbnails */}
              {animal.images.length > 1 && (
                <div className="p-4 flex space-x-2">
                  {animal.images.map((_: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        currentImageIndex === index ? 'border-primary' : 'border-border'
                      }`}
                    >
                      <img 
                        src={animal.images[index]} 
                        alt={`Miniatura ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Basic Info Card */}
            <Card className="p-6 rounded-3xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-foreground">{animal.name}</h1>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{animal.age}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{animal.location}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <Link 
                    to="/organizacje" 
                    className="text-sm font-medium text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                  >
                    {animal.organization}
                  </Link>
                </div>
              </div>
            </Card>

            {/* Description and Story */}
            <Card className="p-6 rounded-3xl">
              <h2 className="text-xl font-bold text-foreground mb-4">O {animal.name}</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {animal.description}
              </p>
              <div className="bg-muted/50 rounded-2xl p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Historia:</strong> {animal.story}
                </p>
              </div>
            </Card>
          </div>

          {/* Right Column - Wishlist */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 rounded-3xl sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">Lista życzeń</h2>
                <span className="text-sm text-muted-foreground">
                  {animal.wishlistProgress}% spełnione
                </span>
              </div>
              
              <div className="w-full bg-muted rounded-full h-3 mb-6">
                <div 
                  className="bg-primary h-3 rounded-full transition-all duration-500"
                  style={{ width: `${animal.wishlistProgress}%` }}
                />
              </div>

              <div className="space-y-3 mb-6">
                {animal.wishlist.map((item: any) => (
                  <div 
                    key={item.id} 
                    className={`flex items-center justify-between p-3 rounded-2xl border ${
                      item.urgent ? 'border-accent/50 bg-accent/5' : 'border-border/50'
                    } ${item.bought ? 'opacity-60' : ''}`}
                  >
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${item.bought ? 'line-through' : ''}`}>
                        {item.name}
                        {item.urgent && <span className="text-accent text-xs ml-2">• PILNE</span>}
                      </p>
                      <p className="text-primary font-bold text-sm">{item.price.toFixed(2)} zł</p>
                    </div>
                    {!item.bought && (
                      <Button
                        variant={isInCart(item.id) ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => handleAddToCart(item)}
                      >
                        {isInCart(item.id) ? 'W koszyku' : 'Dodaj'}
                      </Button>
                    )}
                    {item.bought && (
                      <Badge variant="secondary" className="text-xs">
                        ✓ Kupione
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-border/50">
                <Button 
                  variant="default" 
                  size="lg" 
                  className="w-full"
                  onClick={handleAddAllToCart}
                >
                  Kup wszystko dla {animal.name}
                  <ShoppingCart className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnimalProfile;