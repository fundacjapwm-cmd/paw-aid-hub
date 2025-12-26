import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, PawPrint } from "lucide-react";
import { AnimalWithStats } from "@/hooks/useOrgDashboard";
import DashboardAnimalCard from "./DashboardAnimalCard";

interface DashboardAnimalListProps {
  animals: AnimalWithStats[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddClick: () => void;
  onEditClick: (animal: AnimalWithStats, e: React.MouseEvent) => void;
  onDeleteClick: (animal: AnimalWithStats, e: React.MouseEvent) => void;
  onAnimalClick: (animalId: string) => void;
}

export default function DashboardAnimalList({
  animals,
  searchQuery,
  onSearchChange,
  onAddClick,
  onEditClick,
  onDeleteClick,
  onAnimalClick,
}: DashboardAnimalListProps) {
  const filteredAnimals = animals.filter((animal) =>
    animal.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <Button onClick={onAddClick} className="rounded-xl sm:rounded-2xl gap-2 h-9 sm:h-10 px-3 sm:px-4">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline text-sm">Dodaj</span>
          </Button>
        </div>
      </div>

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
          {filteredAnimals.map((animal) => (
            <DashboardAnimalCard
              key={animal.id}
              animal={animal}
              onEdit={onEditClick}
              onDelete={onDeleteClick}
              onClick={() => onAnimalClick(animal.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
