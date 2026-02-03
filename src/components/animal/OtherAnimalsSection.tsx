import { useNavigate } from "react-router-dom";
import { PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import { calculateAnimalAge } from "@/lib/utils/ageCalculator";

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

// Paw progress indicator with percentage
function PawProgress({ progress }: { progress: number }) {
  const getColor = (percent: number) => {
    if (percent < 33) return '#ef4444';
    if (percent < 66) return '#f97316';
    return '#22c55e';
  };

  return (
    <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm">
      <div 
        className="relative"
        style={{ color: getColor(progress) }}
      >
        <PawPrint className="w-4 h-4" fill="currentColor" />
      </div>
      <span 
        className="text-xs font-bold"
        style={{ color: getColor(progress) }}
      >
        {progress}%
      </span>
    </div>
  );
}

export function OtherAnimalsSection({ 
  animals, 
  currentAnimalId, 
  organizationName,
  organizationSlug 
}: OtherAnimalsSectionProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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

  const calculateProgress = (wishlist: any[]) => {
    if (!wishlist || wishlist.length === 0) return 0;
    const totalNeeded = wishlist.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const totalPurchased = wishlist.reduce((sum, item) => {
      const purchased = item.purchasedQuantity || 0;
      const needed = item.quantity || 1;
      return sum + Math.min(purchased, needed);
    }, 0);
    return totalNeeded > 0 ? Math.round((totalPurchased / totalNeeded) * 100) : 0;
  };

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="md:container md:mx-auto md:max-w-7xl md:px-8 px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <PawPrint className="h-5 w-5 text-primary" />
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              Inne zwierzaki z {organizationName}
            </h2>
            <PawPrint className="h-5 w-5 text-primary" />
          </div>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: otherAnimals.length > 5,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-3">
            {otherAnimals.map((animal) => {
              const progress = calculateProgress(animal.wishlist || []);
              const ageDisplay = animal.birth_date 
                ? calculateAnimalAge(animal.birth_date)?.displayText 
                : animal.age;

              return (
                <CarouselItem 
                  key={animal.id} 
                  className="pl-2 md:pl-3 basis-[45%] sm:basis-[30%] md:basis-[22%] lg:basis-[18%]"
                >
                  <Card
                    className="overflow-hidden bg-card rounded-2xl border-0 shadow-card cursor-pointer"
                    onClick={() => handleAnimalClick(animal.id)}
                  >
                    {/* Image with paw progress overlay */}
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={animal.image || '/placeholder.svg'}
                        alt={animal.name}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Paw progress badge */}
                      {animal.wishlist && animal.wishlist.length > 0 && (
                        <div className="absolute bottom-2 right-2">
                          <PawProgress progress={progress} />
                        </div>
                      )}
                    </div>

                    {/* Info section */}
                    <div className="p-3 space-y-1">
                      <h3 className="text-sm font-bold text-foreground truncate">
                        {animal.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="bg-muted/60 px-2 py-0.5 rounded-full">
                          {animal.species}
                        </span>
                        {ageDisplay && (
                          <span className="truncate">
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
          
          {!isMobile && otherAnimals.length > 5 && (
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
            size="sm"
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
