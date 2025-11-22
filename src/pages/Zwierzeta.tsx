import AnimalFilters from "@/components/AnimalFilters";
import AnimalCard from "@/components/AnimalCard";
import { Button } from "@/components/ui/button";
import { Heart, Users } from "lucide-react";
import { useState, useMemo } from "react";
import { useAnimalsWithWishlists } from "@/hooks/useAnimalsWithWishlists";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const Zwierzeta = () => {
  const { animals: allAnimals, loading, error } = useAnimalsWithWishlists();
  const [filters, setFilters] = useState({
    organization: "",
    species: "wszystkie",
    city: ""
  });

  const filteredAnimals = useMemo(() => {
    return allAnimals.filter((animal) => {
      const matchesOrganization = filters.organization === "" || 
                                  animal.organization_id === filters.organization;
      
      const matchesSpecies = filters.species === "wszystkie" || 
                            animal.species === filters.species;
      
      const matchesCity = filters.city === "" || 
                         (animal.city && animal.city.toLowerCase().includes(filters.city.toLowerCase()));
      
      return matchesOrganization && matchesSpecies && matchesCity;
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
        <section className="py-12 md:py-20 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Nasi podopieczni
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
              Każde zwierzę ma swoją unikalną historię i potrzeby. Sprawdź kto potrzebuje Twojej pomocy już dziś!
            </p>
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

        {/* Call to Action - Organization Signup */}
        <section className="py-20 bg-gradient-to-br from-primary via-primary-glow to-primary">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/20">
                <div className="text-center mb-6">
                  <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                    Jesteś fundacją?
                  </h2>
                  <p className="text-xl text-white/95 mb-8">
                    Dołącz do naszej platformy i pozwól darczyńcom pomagać Twoim podopiecznym! To całkowicie bezpłatne.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-start gap-3 text-white/90">
                    <div className="bg-white/20 rounded-full p-3 mt-1">
                      <Heart className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-lg mb-1">Bezpośrednie dostawy</div>
                      <div className="text-white/80">Produkty trafiają prosto do Ciebie</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-white/90">
                    <div className="bg-white/20 rounded-full p-3 mt-1">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-lg mb-1">Większy zasięg</div>
                      <div className="text-white/80">Dotrzesz do tysięcy darczyńców</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-white/90">
                    <div className="bg-white/20 rounded-full p-3 mt-1">
                      <Heart className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-lg mb-1">Bezpłatna platforma</div>
                      <div className="text-white/80">Bez ukrytych kosztów i opłat</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-white/90">
                    <div className="bg-white/20 rounded-full p-3 mt-1">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-lg mb-1">Łatwe zarządzanie</div>
                      <div className="text-white/80">Intuicyjny panel dla organizacji</div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <a href="/#dolacz">
                    <Button 
                      variant="light" 
                      size="hero" 
                      className="w-full md:w-auto"
                    >
                      Zgłoś swoją organizację
                    </Button>
                  </a>
                </div>
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