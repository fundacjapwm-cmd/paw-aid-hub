import Navigation from "@/components/Navigation";
import AnimalFilters from "@/components/AnimalFilters";
import AnimalCard from "@/components/AnimalCard";
import { Button } from "@/components/ui/button";
import { Heart, Users, ShoppingBag, Sparkles, Footprints } from "lucide-react";

// Force rebuild to clear cached Paw import

// Import animal images
import cat1 from "@/assets/cat-1.jpg";
import dog1 from "@/assets/dog-1.jpg";
import dog2 from "@/assets/dog-2.jpg";
import cat2 from "@/assets/cat-2.jpg";

const allAnimals = [
  {
    id: 1,
    name: "Siupek",
    age: "W siup lat",
    species: "Pies",
    location: "Warszawa",
    organization: "Organizacja testowa",
    description: "Siupek jest słupowski długi opis. Bardzo przyjazny piesek, który kocha się bawić i potrzebuje kochającego domu. Uwielbia długie spacery i jest idealny dla rodziny z dziećmi.",
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
    description: "Cezar to wspaniały pies, który szuka domu pełnego miłości. Jest bardzo posłuszny i uwielbia długie spacery. Ma łagodny charakter i świetnie dogaduje się z innymi psami.",
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
    description: "Irys to delikatna suczka, która potrzebuje cierpliwego opiekuna. Bardzo łagodna i spokojna. Idealnie nadaje się dla osób szukających spokojnego towarzysza na długie spacery.",
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
    description: "Fred to spokojny kot, który uwielbia się przytulać. Idealny kompan dla osób szukających miękkiego przyjaciela. Lubi spać w ciepłych miejscach i obserwować świat przez okno.",
    image: cat2,
    wishlistProgress: 20,
    urgentNeeds: ["Drapak", "Karma", "Kuweta"]
  },
  {
    id: 5,
    name: "Elf",
    age: "2 lata",
    species: "Kot",
    location: "Poznań",
    organization: "Kotki Ratunkowe",
    description: "Młody i energiczny kot, który uwielbia zabawę. Potrzebuje aktywnego domu gdzie będzie mógł się wyszaleć. Ma piękne oczy i jest bardzo fotogeniczny.",
    image: cat1,
    wishlistProgress: 50,
    urgentNeeds: ["Zabawki", "Drapak", "Karma dla młodych kotów"]
  },
  {
    id: 6,
    name: "Jamie",
    age: "4 lata",
    species: "Pies",
    location: "Szczecin", 
    organization: "Schronisko Nowa Nadzieja",
    description: "Jamie to przyjazny pies rasy mieszanej, który kocha wszystkich ludzi. Ma wyjątkowo dobry charakter i nigdy nie odmówił zabawy. Świetny wybór dla rodzin.",
    image: dog1,
    wishlistProgress: 75,
    urgentNeeds: ["Karma sucha", "Zabawki gryzakowe", "Legowisko"]
  },
  {
    id: 7,
    name: "Budyt",
    age: "7 lat", 
    species: "Pies",
    location: "Lublin",
    organization: "Fundacja Cztery Łapy",
    description: "Starszy pies o złotym sercu. Budyt szuka spokojnego domu na emeryturę. Jest bardzo wdzięczny za każdą okazaną mu życzliwość i kocha spokojne spacery.",
    image: dog2,
    wishlistProgress: 30,
    urgentNeeds: ["Karma dla seniorów", "Witaminy", "Miękkie legowisko"]
  },
  {
    id: 8,
    name: "Gustek", 
    age: "1 rok",
    species: "Kot",
    location: "Gdynia",
    organization: "Miau Fundacja",
    description: "Gustek to młody kocur pełen energii i ciekawości świata. Uwielbia eksplorować i bawić się wszystkim co się rusza. Potrzebuje cierpliwego opiekuna.",
    image: cat2,
    wishlistProgress: 10,
    urgentNeeds: ["Karma dla kociąt", "Zabawki", "Drapak", "Kuweta"]
  }
];

const Zwierzeta = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main>
        {/* Header Section */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Nasi podopieczni
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Każde zwierzę ma swoją unikalną historię i potrzeby. Sprawdź kto potrzebuje Twojej pomocy już dziś!
              </p>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4 max-w-7xl">
            <AnimalFilters />
          </div>
        </section>

        {/* Animals Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allAnimals.map((animal) => (
                <AnimalCard key={animal.id} animal={animal} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Button variant="hero" size="lg">
                Załaduj więcej zwierząt
                <Heart className="h-5 w-5 fill-current" />
              </Button>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Przeglądaj według kategorii
              </h2>
              <p className="text-lg text-muted-foreground">
                Znajdź dokładnie to, czego szukasz
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white rounded-3xl p-8 shadow-card text-center transform hover:scale-105 transition-transform duration-300 cursor-pointer">
                <div className="bg-primary-light rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <span className="text-3xl">🐕</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Psy</h3>
                <p className="text-muted-foreground mb-4">
                  Wierni kompani szukający kochającego domu
                </p>
                <Button variant="outline" size="sm">
                  Zobacz psy ({allAnimals.filter(a => a.species === 'Pies').length})
                </Button>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-card text-center transform hover:scale-105 transition-transform duration-300 cursor-pointer">
                <div className="bg-secondary-light rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <span className="text-3xl">🐱</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Koty</h3>
                <p className="text-muted-foreground mb-4">
                  Niezależne, ale bardzo kochające istoty
                </p>
                <Button variant="outline" size="sm">
                  Zobacz koty ({allAnimals.filter(a => a.species === 'Kot').length})
                </Button>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-card text-center transform hover:scale-105 transition-transform duration-300 cursor-pointer">
                <div className="bg-accent-light rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <span className="text-3xl">🐾</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Wszystkie</h3>
                <p className="text-muted-foreground mb-4">
                  Przeglądaj wszystkich naszych podopiecznych
                </p>
                <Button variant="success" size="sm">
                  Zobacz wszystkie ({allAnimals.length})
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Emergency Needs */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="bg-accent-light rounded-3xl p-8 text-center">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl lg:text-4xl font-bold text-accent mb-6">
                  Pilne potrzeby! 🚨
                </h2>
                <p className="text-lg text-accent/80 mb-8">
                  Te zwierzęta potrzebują Twojej pomocy już dziś. Ich listy życzeń są prawie puste!
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {allAnimals
                    .filter(animal => animal.wishlistProgress < 30)
                    .slice(0, 3)
                    .map((animal) => (
                      <div key={animal.id} className="bg-white rounded-2xl p-6 shadow-card">
                        <div className="w-16 h-16 bg-accent/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <Heart className="h-8 w-8 text-accent fill-current" />
                        </div>
                        <h3 className="font-bold text-foreground mb-2">{animal.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{animal.location}</p>
                        <div className="w-full bg-muted rounded-full h-2 mb-3">
                          <div 
                            className="bg-accent h-2 rounded-full"
                            style={{ width: `${animal.wishlistProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-accent font-semibold">
                          {animal.wishlistProgress}% listy wypełnione
                        </p>
                      </div>
                    ))
                  }
                </div>

                <Button variant="default" size="hero" className="bg-accent hover:bg-accent/90">
                  Pomóż im już dziś!
                  <Heart className="h-6 w-6 fill-current" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-hero">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                Każda pomoc się liczy! 💝
              </h2>
              <p className="text-xl text-white/95 mb-8">
                Nie musisz kupować całej listy - każdy pojedynczy produkt to ogromna radość dla zwierzaka!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="light" size="hero">
                  Rozpocznij pomaganie
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
      <footer className="bg-foreground/5 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-6 w-6 text-primary fill-current" />
            <span className="text-lg font-bold text-primary">Pączki w Maśle</span>
          </div>
          <p className="text-muted-foreground">
            &copy; 2024 Fundacja Pączki w Maśle. Wszystkie prawa zastrzeżone.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Zwierzeta;