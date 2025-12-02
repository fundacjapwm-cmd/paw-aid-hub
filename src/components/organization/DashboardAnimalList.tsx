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
    <div className="space-y-6">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <PawPrint className="h-6 w-6 text-primary" />
          Nasi podopieczni
        </h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Szukaj po imieniu..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 rounded-2xl"
            />
          </div>
          <Button onClick={onAddClick} className="rounded-2xl gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Dodaj</span>
          </Button>
        </div>
      </div>

      {/* Animals List */}
      {filteredAnimals.length === 0 ? (
        <div className="text-center py-12">
          <PawPrint className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
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
