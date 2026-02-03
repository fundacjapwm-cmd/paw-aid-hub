import { useNavigate } from "react-router-dom";
import { Heart, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";

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

// Circular progress ring component
function ProgressRing({ progress, size = 40 }: { progress: number; size?: number }) {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  const getColor = (percent: number) => {
    if (percent < 33) return '#ef4444';
    if (percent < 66) return '#f97316';
    return '#22c55e';
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor(progress)}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Heart 
          className="w-4 h-4 text-white drop-shadow-sm" 
          fill={progress > 0 ? getColor(progress) : 'transparent'}
          strokeWidth={2}
        />
      </div>
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
    <section className="py-12 md:py-16 bg-gradient-to-b from-muted/20 to-muted/40">
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
          <CarouselContent className="-ml-3 md:-ml-4">
            {otherAnimals.map((animal) => {
              const progress = calculateProgress(animal.wishlist || []);
              
              return (
                <CarouselItem 
                  key={animal.id} 
                  className="pl-3 md:pl-4 basis-[28%] sm:basis-[22%] md:basis-[18%] lg:basis-[14%]"
                >
                  <div
                    className="group cursor-pointer text-center"
                    onClick={() => handleAnimalClick(animal.id)}
                  >
                    {/* Circular avatar with progress ring overlay */}
                    <div className="relative mx-auto mb-2 w-20 h-20 md:w-24 md:h-24">
                      {/* Main image - circular */}
                      <div className="w-full h-full rounded-full overflow-hidden border-3 border-white shadow-lg">
                        <img
                          src={animal.image || '/placeholder.svg'}
                          alt={animal.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Progress ring badge */}
                      {animal.wishlist && animal.wishlist.length > 0 && (
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-md">
                          <ProgressRing progress={progress} size={32} />
                        </div>
                      )}
                      
                      {/* Decorative paw */}
                      <div className="absolute -top-1 -left-1 bg-primary/90 rounded-full p-1.5 shadow-sm">
                        <PawPrint className="w-3 h-3 text-white" />
                      </div>
                    </div>

                    {/* Name */}
                    <h3 className="text-sm font-bold text-foreground truncate px-1">
                      {animal.name}
                    </h3>
                    
                    {/* Species tag */}
                    <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                      {animal.species}
                    </span>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          
          {!isMobile && otherAnimals.length > 6 && (
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
            className="rounded-full px-6 border-primary/30 text-primary hover:bg-primary/5"
            onClick={() => navigate(`/organizacje/${organizationSlug}#animals`)}
          >
            <PawPrint className="w-4 h-4 mr-2" />
            Zobacz wszystkich podopiecznych
          </Button>
        </div>
      </div>
    </section>
  );
}
