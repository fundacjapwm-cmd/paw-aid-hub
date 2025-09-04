import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import AnimalFilters from "@/components/AnimalFilters";
import AnimalCard from "@/components/AnimalCard";
import { Button } from "@/components/ui/button";
import { Heart, Users, ShoppingBag, Sparkles } from "lucide-react";

// Import generated animal images
import cat1 from "@/assets/cat-1.jpg";
import dog1 from "@/assets/dog-1.jpg";
import dog2 from "@/assets/dog-2.jpg";
import cat2 from "@/assets/cat-2.jpg";

// Mock data for demonstration
const mockAnimals = [
  {
    id: 1,
    name: "Siupek",
    age: "W siup lat",
    species: "Pies",
    location: "Warszawa",
    organization: "Organizacja testowa",
    description: "Siupek jest słupowski długi opis. Bardzo przyjazny piesek, który kocha się bawić i potrzebuje kochającego domu.",
    image: dog1,
    wishlistProgress: 65,
    urgentNeeds: ["Karma mokra", "Zabawki", "Legowisko"]
  },
  {
    id: 2,
    name: "Cezar",
    age: "6 lat",
    species: "Pies",
    location: "Kraków",
    organization: "Schronisko Przyjazne Łapy",
    description: "Cezar to wspaniały pies, który szuka domu pełnego miłości. Jest bardzo posłuszny i uwielbia długie spacery.",
    image: dog2,
    wishlistProgress: 40,
    urgentNeeds: ["Karma sucha", "Smycz", "Miska"]
  },
  {
    id: 3,
    name: "Irys",
    age: "4 lata",
    species: "Pies",
    location: "Gdańsk",
    organization: "Fundacja Psia Miłość",
    description: "Irys to delikatna suczka, która potrzebuje cierpliwego opiekuna. Bardzo łagodna i spokojna.",
    image: cat1,
    wishlistProgress: 85,
    urgentNeeds: ["Karma mokra", "Zabawki"]
  },
  {
    id: 4,
    name: "Fred",
    age: "4 lata",
    species: "Kot",
    location: "Wrocław",
    organization: "Koci Azyl",
    description: "Fred to spokojny kot, który uwielbia się przytulać. Idealny kompan dla osób szukających miękkiego przyjaciela.",
    image: cat2,
    wishlistProgress: 20,
    urgentNeeds: ["Drapak", "Karma", "Kuweta"]
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main>
        <HeroSection />
        
        {/* Stats Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="bg-primary rounded-3xl p-4 w-16 h-16 mx-auto flex items-center justify-center">
                <Heart className="h-8 w-8 text-white fill-white" />
              </div>
              <p className="text-2xl font-bold text-foreground">1,247</p>
              <p className="text-sm text-muted-foreground">Wspartych zwierząt</p>
            </div>
            <div className="space-y-2">
              <div className="bg-secondary rounded-3xl p-4 w-16 h-16 mx-auto flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <p className="text-2xl font-bold text-foreground">89</p>
              <p className="text-sm text-muted-foreground">Organizacji</p>
            </div>
            <div className="space-y-2">
              <div className="bg-accent rounded-3xl p-4 w-16 h-16 mx-auto flex items-center justify-center">
                <ShoppingBag className="h-8 w-8 text-white" />
              </div>
              <p className="text-2xl font-bold text-foreground">15,623</p>
              <p className="text-sm text-muted-foreground">Zakupionych produktów</p>
            </div>
            <div className="space-y-2">
              <div className="bg-primary rounded-3xl p-4 w-16 h-16 mx-auto flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <p className="text-2xl font-bold text-foreground ">328,445 zł</p>
              <p className="text-sm text-muted-foreground">Zebranych środków</p>
            </div>
            </div>
          </div>
        </section>

        {/* Animals Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Nasi podopieczni
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Poznaj zwierzęta, które czekają na Twoją pomoc. Każde z nich ma swoją historię 
                i lista potrzeb, które możesz spełnić jednym kliknięciem.
              </p>
            </div>

            <div className="mb-8">
              <AnimalFilters />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mockAnimals.map((animal) => (
                <AnimalCard key={animal.id} animal={animal} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Button variant="hero" size="lg">
                Zobacz wszystkie zwierzęta
                <Heart className="h-5 w-5 fill-current" />
              </Button>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-20 bg-hero">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                Zacznij pomagać już dziś!
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Każdy gest ma znaczenie. Wybierz zwierzaka lub organizację i kup produkty z ich listy życzeń. 
                To proste, szybkie i przynosi prawdziwą radość!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="light" size="hero">
                  Przeglądaj zwierzęta
                  <Heart className="h-6 w-6 fill-current" />
                </Button>
                <Button variant="outline" size="hero" className="border-white text-white hover:bg-white hover:text-primary">
                  Zobacz organizacje
                  <Users className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-foreground/5 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-6 w-6 text-primary fill-current" />
                <span className="text-lg font-bold text-primary">Pączki w Maśle</span>
              </div>
              <p className="text-muted-foreground max-w-md">
                Platforma umożliwiająca wspieranie zwierząt i organizacji poprzez zakup potrzebnych produktów. 
                Każdy zakup to realna pomoc.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Nawigacja</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="/o-nas" className="hover:text-primary transition-colors">O nas</a></li>
                <li><a href="/jak-to-dziala" className="hover:text-primary transition-colors">Jak to działa?</a></li>
                <li><a href="/organizacje" className="hover:text-primary transition-colors">Organizacje</a></li>
                <li><a href="/kontakt" className="hover:text-primary transition-colors">Kontakt</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Pomoc</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="/faq" className="hover:text-primary transition-colors">FAQ</a></li>
                <li><a href="/regulamin" className="hover:text-primary transition-colors">Regulamin</a></li>
                <li><a href="/prywatnosc" className="hover:text-primary transition-colors">Prywatność</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Pączki w Maśle. Wszystkie prawa zastrzeżone.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;