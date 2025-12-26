import HeroSection from "@/components/HeroSection";
import AnimalFilters from "@/components/AnimalFilters";
import AnimalCard from "@/components/AnimalCard";
import AnimalCardSkeleton from "@/components/AnimalCardSkeleton";
import { Button } from "@/components/ui/button";
import { useAnimalsWithWishlists } from "@/hooks/useAnimalsWithWishlists";
import { useState, useMemo, useEffect } from "react";
import LeadGenSection from "@/components/LeadGenSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import StatsSection from "@/components/StatsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { Link, useLocation } from "react-router-dom";

const Index = () => {
  const location = useLocation();
  const { animals, loading, error } = useAnimalsWithWishlists();
  const [filters, setFilters] = useState({
    organization: "",
    species: "wszystkie",
    city: "",
    sortBy: "najmniej_najedzone"
  });
  const [visibleCount, setVisibleCount] = useState(4);

  // Handle scrolling to anchor after navigation
  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
    }
  }, [location]);

  // Calculate wishlist progress for an animal
  const calculateProgress = (animal: any) => {
    if (!animal.wishlist || animal.wishlist.length === 0) return 0;
    
    const totalNeeded = animal.wishlist.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
    const totalPurchased = animal.wishlist.reduce((sum: number, item: any) => sum + (item.purchased_quantity || 0), 0);
    
    if (totalNeeded === 0) return 100;
    return (totalPurchased / totalNeeded) * 100;
  };

  const filteredAndSortedAnimals = useMemo(() => {
    let result = animals.filter((animal) => {
      const matchesOrganization = filters.organization === "" || 
                                  animal.organization_id === filters.organization;
      
      const matchesSpecies = filters.species === "wszystkie" || 
                            animal.species === filters.species;
      
      const matchesCity = filters.city === "" || 
                         (animal.city && animal.city.toLowerCase().includes(filters.city.toLowerCase()));
      
      return matchesOrganization && matchesSpecies && matchesCity;
    });

    // Sort based on selected option
    switch (filters.sortBy) {
      case "najstarsze":
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "alfabetycznie":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "najbardziej_najedzone":
        result.sort((a, b) => calculateProgress(b) - calculateProgress(a));
        break;
      case "najmniej_najedzone":
        result.sort((a, b) => calculateProgress(a) - calculateProgress(b));
        break;
      case "najnowsze":
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return result;
  }, [animals, filters]);

  const visibleAnimals = filteredAndSortedAnimals.slice(0, visibleCount);
  const hasMoreAnimals = visibleCount < filteredAndSortedAnimals.length;

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 4);
  };

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(4);
  }, [filters]);

  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection />
        
        {/* Stats Section */}
        <StatsSection />

        {/* How It Works Section */}
        <HowItWorksSection />

        {/* CTA Section */}
        <CTASection />

        {/* Animals Section */}
        <section className="py-8 md:py-12">
          <div className="md:container md:mx-auto md:max-w-6xl md:px-8 px-4">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 md:mb-4">
                Nasi podopieczni
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
                Poznaj zwierzęta, które czekają na Twoją pomoc. Każde z nich ma swoją historię 
                i lista potrzeb, które możesz spełnić jednym kliknięciem.
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <AnimalCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="py-20 text-center">
                <p className="text-lg text-destructive">Błąd ładowania: {error}</p>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <AnimalFilters onFilterChange={setFilters} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {visibleAnimals.map((animal) => (
                    <AnimalCard key={animal.id} animal={animal} />
                  ))}
                </div>

                {visibleAnimals.length === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground">Brak zwierząt spełniających kryteria</p>
                  </div>
                )}

                {hasMoreAnimals && (
                  <div className="text-center mt-8">
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={handleShowMore}
                      className="rounded-3xl md:rounded-2xl"
                    >
                      Pokaż więcej
                    </Button>
                  </div>
                )}
              </>
            )}

            <div className="text-center mt-12">
              <Link to="/zwierzeta">
                <Button variant="hero" size="lg">
                  Zobacz wszystkie zwierzęta
                </Button>
              </Link>
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
