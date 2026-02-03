import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { calculateAnimalAge } from "@/lib/utils/ageCalculator";
import { useIsMobile } from "@/hooks/use-mobile";
import WishlistProgressBar from "@/components/WishlistProgressBar";

interface OtherAnimal {
  id: string;
  name: string;
  species: string;
  age?: string;
  birth_date?: string | null;
  image: string;
  organization: string;
  organizationSlug?: string;
  wishlist?: any[];
}

interface OtherAnimalsSectionProps {
  animals: OtherAnimal[];
  currentAnimalId: string;
  organizationName: string;
  organizationSlug?: string;
}

export function OtherAnimalsSection({ 
  animals, 
  currentAnimalId, 
  organizationName,
  organizationSlug 
}: OtherAnimalsSectionProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Filter out the current animal
  const otherAnimals = animals.filter(a => a.id !== currentAnimalId);

  if (otherAnimals.length === 0) {
    return null;
  }

  const handleAnimalClick = (animalId: string) => {
    navigate(`/zwierze/${animalId}`, {
      state: {
        fromOrganizationProfile: true,
        organizationName,
        organizationSlug,
      }
    });
  };

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="md:container md:mx-auto md:max-w-7xl md:px-8 px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <PawPrint className="h-6 w-6 text-primary" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Inne zwierzaki z {organizationName}
            </h2>
            <PawPrint className="h-6 w-6 text-primary" />
          </div>
          <p className="text-muted-foreground">
            Poznaj innych podopiecznych tej organizacji
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: otherAnimals.length > 3,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {otherAnimals.map((animal) => {
              const ageDisplay = animal.birth_date 
                ? calculateAnimalAge(animal.birth_date)?.displayText 
                : animal.age;

              return (
                <CarouselItem 
                  key={animal.id} 
                  className="pl-2 md:pl-4 basis-[85%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  <Card
                    className="overflow-hidden bg-card rounded-3xl border-0 shadow-card cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg"
                    onClick={() => handleAnimalClick(animal.id)}
                  >
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={animal.image || '/placeholder.svg'}
                        alt={animal.name}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Progress indicator overlay */}
                      {animal.wishlist && animal.wishlist.length > 0 && (
                        <div className="absolute bottom-3 left-3 right-3">
                          <WishlistProgressBar wishlist={animal.wishlist} compact />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-foreground mb-1">
                        {animal.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="bg-muted/50 px-2 py-0.5 rounded-full">
                          {animal.species}
                        </span>
                        {ageDisplay && (
                          <span className="bg-muted/50 px-2 py-0.5 rounded-full">
                            {ageDisplay}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          
          {!isMobile && otherAnimals.length > 4 && (
            <>
              <CarouselPrevious className="hidden md:flex -left-4 bg-white shadow-bubbly border-0" />
              <CarouselNext className="hidden md:flex -right-4 bg-white shadow-bubbly border-0" />
            </>
          )}
        </Carousel>

        {/* View all link */}
        <div className="text-center mt-8">
          <Button
            variant="outline"
            className="rounded-full px-6"
            onClick={() => navigate(`/organizacje/${organizationSlug}#animals`)}
          >
            Zobacz wszystkich podopiecznych
          </Button>
        </div>
      </div>
    </section>
  );
}
