import AnimalFilters from "@/components/AnimalFilters";
import AnimalCard from "@/components/AnimalCard";
import AnimalCardSkeleton from "@/components/AnimalCardSkeleton";
import { Button } from "@/components/ui/button";
import { Heart, Users, Home } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useAnimalsWithWishlists } from "@/hooks/useAnimalsWithWishlists";
import Footer from "@/components/Footer";
import LeadGenSection from "@/components/LeadGenSection";
import { Link } from "react-router-dom";
import PawPattern from "@/components/icons/PawPattern";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const Zwierzeta = () => {
  const { animals: allAnimals, loading, error } = useAnimalsWithWishlists();
  const [filters, setFilters] = useState({
    organization: "",
    species: "wszystkie",
    city: "",
    sortBy: "najmniej_najedzone"
  });
  const [visibleCount, setVisibleCount] = useState(8);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(8);
  }, [filters]);

  const filteredAndSortedAnimals = useMemo(() => {
    let filtered = allAnimals.filter((animal) => {
      const matchesOrganization = filters.organization === "" || 
                                  animal.organization_id === filters.organization;
      
      const matchesSpecies = filters.species === "wszystkie" || 
                            animal.species === filters.species;
      
      const matchesCity = filters.city === "" || 
                         (animal.city && animal.city.toLowerCase().includes(filters.city.toLowerCase()));
      
      return matchesOrganization && matchesSpecies && matchesCity;
    });

    // Calculate progress for sorting
    const calculateProgress = (animal: any) => {
      if (!animal.wishlist || animal.wishlist.length === 0) return 100;
      const boughtCount = animal.wishlist.filter((item: any) => item.bought).length;
      return (boughtCount / animal.wishlist.length) * 100;
    };

    // Sort animals
    if (filters.sortBy === "najmniej_najedzone") {
      filtered = filtered.sort((a, b) => {
        const aProgress = calculateProgress(a);
        const bProgress = calculateProgress(b);
        // 100% complete goes to the end
        if (aProgress === 100 && bProgress < 100) return 1;
        if (bProgress === 100 && aProgress < 100) return -1;
        // Sort by progress ascending (most needy first)
        if (aProgress !== bProgress) return aProgress - bProgress;
        // Same progress - sort by date descending
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
    } else if (filters.sortBy === "najbardziej_najedzone") {
      filtered = filtered.sort((a, b) => calculateProgress(b) - calculateProgress(a));
    } else if (filters.sortBy === "najnowsze") {
      filtered = filtered.sort((a, b) => 
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
    } else if (filters.sortBy === "najstarsze") {
      filtered = filtered.sort((a, b) => 
        new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
      );
    } else if (filters.sortBy === "alfabetycznie") {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [allAnimals, filters]);

  const visibleAnimals = filteredAndSortedAnimals.slice(0, visibleCount);

  const hasMoreAnimals = visibleCount < filteredAndSortedAnimals.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 8);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background relative">
        <PawPattern />
        <main className="relative z-10">
          <section className="py-12 md:py-20 bg-background">
            <div className="md:container md:mx-auto md:px-8 px-4">
              {/* Breadcrumbs */}
              <Breadcrumb className="mb-6">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/" className="flex items-center gap-1">
                        <Home className="h-4 w-4" />
                        <span className="hidden sm:inline">Strona główna</span>
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Zwierzęta</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>

              <div className="text-center">
                <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                  Nasi podopieczni
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
                  Każde zwierzę ma swoją unikalną historię i potrzeby. Sprawdź kto potrzebuje Twojej pomocy już dziś!
                </p>
              </div>
            </div>
          </section>

          {/* Filters Section */}
          <section className="py-8 bg-muted/30">
            <div className="md:container md:mx-auto md:px-8 md:max-w-7xl px-4">
              <AnimalFilters onFilterChange={setFilters} />
            </div>
          </section>

          {/* Skeleton Loading Section */}
          <section className="py-16">
            <div className="md:container md:mx-auto md:max-w-6xl md:px-8 px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <AnimalCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </section>

          <LeadGenSection />
        </main>
        <Footer />
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
    <div className="min-h-screen bg-background relative">
      <PawPattern />
      <main className="relative z-10">
        <section className="py-12 md:py-20 bg-background">
          <div className="md:container md:mx-auto md:px-8 px-4">
            {/* Breadcrumbs */}
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/" className="flex items-center gap-1">
                      <Home className="h-4 w-4" />
                      <span className="hidden sm:inline">Strona główna</span>
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Zwierzęta</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                Nasi podopieczni
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
                Każde zwierzę ma swoją unikalną historię i potrzeby. Sprawdź kto potrzebuje Twojej pomocy już dziś!
              </p>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-8 bg-muted/30">
          <div className="md:container md:mx-auto md:px-8 md:max-w-7xl px-4">
            <AnimalFilters onFilterChange={setFilters} />
          </div>
        </section>

        {/* Animals Section */}
        <section className="py-16">
          <div className="md:container md:mx-auto md:max-w-6xl md:px-8 px-4">
            {filteredAndSortedAnimals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  Nie znaleziono zwierząt spełniających wybrane kryteria.
                </p>
              </div>
            ) : (
              <>
                <div className="text-sm text-muted-foreground mb-4">
                  Znaleziono {filteredAndSortedAnimals.length} {filteredAndSortedAnimals.length === 1 ? 'zwierzę' : 'zwierząt'}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {visibleAnimals.map((animal) => (
                    <AnimalCard key={animal.id} animal={animal} />
                  ))}
                </div>

                {hasMoreAnimals && (
                  <div className="text-center mt-12">
                    <Button variant="hero" size="lg" onClick={handleLoadMore}>
                      Załaduj więcej zwierząt
                      <Heart className="h-5 w-5 fill-current" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Lead Generation Section */}
        <LeadGenSection />
      </main>

      <Footer />
    </div>
  );
};

export default Zwierzeta;