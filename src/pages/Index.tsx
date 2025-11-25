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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

const Index = () => {
  const location = useLocation();
  const { animals, loading, error } = useAnimalsWithWishlists();
  const [filters, setFilters] = useState({
    organization: "",
    species: "wszystkie",
    city: ""
  });
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

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

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    setCount(carouselApi.scrollSnapList().length);
    setCurrent(carouselApi.selectedScrollSnap() + 1);

    carouselApi.on("select", () => {
      setCurrent(carouselApi.selectedScrollSnap() + 1);
    });
  }, [carouselApi]);

  const filteredAnimals = useMemo(() => {
    return animals.filter((animal) => {
      const matchesOrganization = filters.organization === "" || 
                                  animal.organization_id === filters.organization;
      
      const matchesSpecies = filters.species === "wszystkie" || 
                            animal.species === filters.species;
      
      const matchesCity = filters.city === "" || 
                         (animal.city && animal.city.toLowerCase().includes(filters.city.toLowerCase()));
      
      return matchesOrganization && matchesSpecies && matchesCity;
    });
  }, [animals, filters]);

  const newestAnimals = useMemo(() => {
    return [...animals]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);
  }, [animals]);

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
        <section className="py-12 px-4 md:px-8">
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

            {loading ? (
              <div>
                <Carousel
                  opts={{
                    align: "start",
                    loop: false,
                  }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-2 md:-ml-4">
                    {[1, 2, 3, 4].map((i) => (
                      <CarouselItem key={i} className="pl-2 md:pl-4 basis-full md:basis-1/2">
                        <AnimalCardSkeleton />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <div className="hidden md:block">
                    <CarouselPrevious />
                    <CarouselNext />
                  </div>
                </Carousel>
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

                <div>
                  <Carousel
                    setApi={setCarouselApi}
                    opts={{
                      align: "start",
                      loop: true,
                    }}
                    className="w-full"
                  >
                    <CarouselContent className="-ml-2 md:-ml-4">
                      {newestAnimals.map((animal) => (
                        <CarouselItem key={animal.id} className="pl-2 md:pl-4 basis-full md:basis-1/2">
                          <AnimalCard animal={animal} />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <div className="hidden md:block">
                      <CarouselPrevious />
                      <CarouselNext />
                    </div>
                  </Carousel>
                  
                  {/* Dot indicators for mobile */}
                  <div className="flex justify-center gap-2 mt-4 md:hidden">
                    {Array.from({ length: count }).map((_, index) => (
                      <button
                        key={index}
                        className={`h-2 rounded-full transition-all ${
                          index === current - 1
                            ? "w-8 bg-primary"
                            : "w-2 bg-muted-foreground/30"
                        }`}
                        onClick={() => carouselApi?.scrollTo(index)}
                        aria-label={`Przejdź do slajdu ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
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