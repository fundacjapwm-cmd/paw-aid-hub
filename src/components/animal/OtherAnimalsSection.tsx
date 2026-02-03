import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
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
            {otherAnimals.map((animal) => (
              <CarouselItem 
                key={animal.id} 
                className="pl-2 md:pl-3 basis-[22%] sm:basis-[20%] md:basis-[18%] lg:basis-[14%]"
              >
                <Card
                  className="overflow-hidden bg-card rounded-2xl border-0 shadow-card cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg animate-fade-in"
                  onClick={() => handleAnimalClick(animal.id)}
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden rounded-t-2xl">
                    <img
                      src={animal.image || '/placeholder.svg'}
                      alt={animal.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Name and minimal progress bar */}
                  <div className="p-2 space-y-1.5">
                    <h3 className="text-sm font-semibold text-foreground truncate text-center">
                      {animal.name}
                    </h3>
                    {animal.wishlist && animal.wishlist.length > 0 && (
                      <WishlistProgressBar wishlist={animal.wishlist} minimal />
                    )}
                  </div>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {!isMobile && otherAnimals.length > 6 && (
            <>
              <CarouselPrevious className="hidden md:flex -left-4 bg-white shadow-bubbly border-0" />
              <CarouselNext className="hidden md:flex -right-4 bg-white shadow-bubbly border-0" />
            </>
          )}
        </Carousel>

        {/* View all link */}
        <div className="text-center mt-6">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full px-5"
            onClick={() => navigate(`/organizacje/${organizationSlug}#animals`)}
          >
            Zobacz wszystkich podopiecznych
          </Button>
        </div>
      </div>
    </section>
  );
}
