import AnimalFilters from "@/components/AnimalFilters";
import AnimalCard from "@/components/AnimalCard";
import { Button } from "@/components/ui/button";
import { Heart, Users } from "lucide-react";
import { useState, useMemo } from "react";
import { useAnimalsWithWishlists } from "@/hooks/useAnimalsWithWishlists";
import Footer from "@/components/Footer";

const Zwierzeta = () => {
  const { animals: allAnimals, loading, error } = useAnimalsWithWishlists();
  const [filters, setFilters] = useState({
    search: "",
    species: "wszystkie",
    province: "wszystkie",
    city: ""
  });

  const filteredAnimals = useMemo(() => {
    return allAnimals.filter((animal) => {
      const matchesSearch = animal.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                           animal.description.toLowerCase().includes(filters.search.toLowerCase()) ||
                           animal.organization.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesSpecies = filters.species === "wszystkie" || 
                            animal.species.toLowerCase() === filters.species.toLowerCase();
      
      const matchesCity = filters.city === "" || 
                         animal.location.toLowerCase().includes(filters.city.toLowerCase());
      
      return matchesSearch && matchesSpecies && matchesCity;
    });
  }, [allAnimals, filters]);

  const totalAnimals = allAnimals.length;
  const totalCats = allAnimals.filter(a => a.species.toLowerCase() === 'kot').length;
  const totalDogs = allAnimals.filter(a => a.species.toLowerCase() === 'pies').length;
  const urgentNeedsCount = allAnimals.filter(a => 
    a.wishlist?.some(item => item.urgent && !item.bought)
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-lg text-muted-foreground">Ładowanie zwierząt...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-lg text-destructive">Błąd ładowania: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Header Section */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-6">
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
            <AnimalFilters onFilterChange={setFilters} />
          </div>
        </section>

        {/* Animals Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-7xl">
            {filteredAnimals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  Nie znaleziono zwierząt spełniających wybrane kryteria.
                </p>
              </div>
            ) : (
              <>
                <div className="text-sm text-muted-foreground mb-4">
                  Znaleziono {filteredAnimals.length} {filteredAnimals.length === 1 ? 'zwierzę' : 'zwierząt'}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredAnimals.map((animal) => (
                    <AnimalCard key={animal.id} animal={animal} />
                  ))}
                </div>

                <div className="text-center mt-12">
                  <Button variant="hero" size="lg">
                    Załaduj więcej zwierząt
                    <Heart className="h-5 w-5 fill-current" />
                  </Button>
                </div>
              </>
            )}
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

      <Footer />
    </div>
  );
};

export default Zwierzeta;