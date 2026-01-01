import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, PawPrint, Sparkles, MousePointer } from "lucide-react";
import { AnimalWithStats } from "@/hooks/useOrgDashboard";
import DashboardAnimalCard from "./DashboardAnimalCard";
import OnboardingTooltip from "./OnboardingTooltip";

interface DashboardAnimalListProps {
  animals: AnimalWithStats[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddClick: () => void;
  onEditClick: (animal: AnimalWithStats, e: React.MouseEvent) => void;
  onDeleteClick: (animal: AnimalWithStats, e: React.MouseEvent) => void;
  onAnimalClick: (animalId: string) => void;
  showOnboardingAnimal?: boolean;
  showOnboardingWishlist?: boolean;
  showCongratulations?: boolean;
  onboardingAnimalName?: string;
  onboardingAnimalId?: string;
  onDismissOnboarding?: () => void;
}

export default function DashboardAnimalList({
  animals,
  searchQuery,
  onSearchChange,
  onAddClick,
  onEditClick,
  onDeleteClick,
  onAnimalClick,
  showOnboardingAnimal = false,
  showOnboardingWishlist = false,
  showCongratulations = false,
  onboardingAnimalName,
  onboardingAnimalId,
  onDismissOnboarding,
}: DashboardAnimalListProps) {
  const filteredAnimals = animals.filter((animal) =>
    animal.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Find the target animal for highlighting
  const targetAnimal = onboardingAnimalId 
    ? animals.find(a => a.id === onboardingAnimalId)
    : animals[0];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
          <PawPrint className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          Nasi podopieczni
        </h2>
        <div className="flex gap-2 sm:gap-3 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Szukaj..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 rounded-xl sm:rounded-2xl h-9 sm:h-10 text-sm"
            />
          </div>
          <OnboardingTooltip
            message="Dodaj pierwszego podopiecznego!"
            show={showOnboardingAnimal}
            position="left"
            onDismiss={onDismissOnboarding}
          >
            <Button onClick={onAddClick} className="rounded-xl sm:rounded-2xl gap-2 h-9 sm:h-10 px-3 sm:px-4">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Dodaj</span>
            </Button>
          </OnboardingTooltip>
        </div>
      </div>

      {/* Congratulations Banner */}
      {showCongratulations && onboardingAnimalName && (
        <div className="bg-gradient-to-r from-success/20 to-emerald-500/20 border-2 border-success/40 rounded-2xl p-4 sm:p-6 text-center animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-success animate-pulse" />
            <h3 className="text-lg sm:text-xl font-bold text-success">
              🎉 Gratulacje!
            </h3>
            <Sparkles className="h-6 w-6 text-success animate-pulse" />
          </div>
          <p className="text-success/90 font-medium text-sm sm:text-base">
            <strong>{onboardingAnimalName}</strong> został dodany!
          </p>
        </div>
      )}

      {/* Wishlist Onboarding Instruction */}
      {showOnboardingWishlist && animals.length > 0 && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-400/50 rounded-2xl p-4 sm:p-5 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
              <MousePointer className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-emerald-700 dark:text-emerald-300 font-semibold text-sm sm:text-base">
                Kliknij na {onboardingAnimalName ? `kartę "${onboardingAnimalName}"` : 'podopiecznego'} poniżej
              </p>
              <p className="text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm mt-0.5">
                aby dodać produkty do listy potrzeb!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Animals List */}
      {filteredAnimals.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <PawPrint className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground/50 mb-3 sm:mb-4" />
          <p className="text-sm sm:text-base text-muted-foreground">
            {searchQuery
              ? "Nie znaleziono podopiecznych"
              : "Brak podopiecznych. Dodaj pierwszego!"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredAnimals.map((animal) => {
            const isHighlighted = showOnboardingWishlist && 
              (onboardingAnimalId ? animal.id === onboardingAnimalId : animal.id === targetAnimal?.id);
            
            return (
              <div 
                key={animal.id}
                className={`transition-all duration-500 ${
                  isHighlighted 
                    ? 'ring-4 ring-emerald-400 ring-offset-2 rounded-2xl sm:rounded-3xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 animate-pulse-slow' 
                    : ''
                }`}
              >
                <DashboardAnimalCard
                  animal={animal}
                  onEdit={onEditClick}
                  onDelete={onDeleteClick}
                  onClick={() => onAnimalClick(animal.id)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
