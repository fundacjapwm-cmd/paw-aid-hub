import HeroSection from "@/components/HeroSection";
import AnimalFilters from "@/components/AnimalFilters";
import AnimalCard from "@/components/AnimalCard";
import { Button } from "@/components/ui/button";
import { useAnimalsWithWishlists } from "@/hooks/useAnimalsWithWishlists";
import { useState } from "react";
import LeadGenSection from "@/components/LeadGenSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import StatsSection from "@/components/StatsSection";
import Footer from "@/components/Footer";

const Index = () => {
  const { animals, loading, error } = useAnimalsWithWishlists();
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all');

  const filteredAnimals = selectedSpecies === 'all' 
    ? animals 
    : animals.filter(animal => animal.species.toLowerCase() === selectedSpecies.toLowerCase());

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
        <HeroSection />
        
        {/* Stats Section */}
        <StatsSection />

        {/* How It Works Section */}
        <HowItWorksSection />

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
              {filteredAnimals.length > 0 ? (
                filteredAnimals.map((animal) => (
                  <AnimalCard key={animal.id} animal={animal} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-lg text-muted-foreground">Brak zwierząt do wyświetlenia</p>
                </div>
              )}
            </div>

            <div className="text-center mt-12">
              <Button variant="hero" size="lg">
                Zobacz wszystkie zwierzęta
              </Button>
            </div>
          </div>
        </section>

        {/* Lead Generation Section */}
        <LeadGenSection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;