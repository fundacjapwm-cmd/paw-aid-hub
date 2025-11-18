import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { useState } from "react";

interface FiltersProps {
  onFilterChange?: (filters: {
    search: string;
    species: string;
    province: string;
    city: string;
  }) => void;
}

const AnimalFilters = ({ onFilterChange }: FiltersProps) => {
  const [search, setSearch] = useState("");
  const [species, setSpecies] = useState("wszystkie");
  const [province, setProvince] = useState("wszystkie");
  const [city, setCity] = useState("");

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = {
      search,
      species,
      province,
      city,
    };
    
    if (key === 'search') setSearch(value);
    if (key === 'species') setSpecies(value);
    if (key === 'province') setProvince(value);
    if (key === 'city') setCity(value);
    
    onFilterChange?.({
      ...newFilters,
      [key]: value
    });
  };
  return (
    <div className="bg-card rounded-3xl p-4 sm:p-6 shadow-card border border-border/50">
      <div className="flex items-center space-x-2 mb-4 sm:mb-6">
        <Filter className="h-5 w-5 text-primary" />
        <h2 className="text-base sm:text-lg font-semibold text-foreground">Filtry</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Szukaj..." 
            className="pl-10 rounded-2xl border-2 text-sm"
            value={search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        {/* Species Filter */}
        <Select value={species} onValueChange={(value) => handleFilterChange('species', value)}>
          <SelectTrigger className="rounded-2xl border-2 text-sm">
            <SelectValue placeholder="Gatunek" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-2 border-border rounded-2xl z-50">
            <SelectItem value="wszystkie">Wszystkie</SelectItem>
            <SelectItem value="psy">Psy</SelectItem>
            <SelectItem value="koty">Koty</SelectItem>
            <SelectItem value="inne">Inne</SelectItem>
          </SelectContent>
        </Select>

        {/* Province Filter */}
        <Select value={province} onValueChange={(value) => handleFilterChange('province', value)}>
          <SelectTrigger className="rounded-2xl border-2 text-sm">
            <SelectValue placeholder="Województwo" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-2 border-border rounded-2xl z-50">
            <SelectItem value="wszystkie">Wszystkie</SelectItem>
            <SelectItem value="mazowieckie">Mazowieckie</SelectItem>
            <SelectItem value="slaskie">Śląskie</SelectItem>
            <SelectItem value="malopolskie">Małopolskie</SelectItem>
            <SelectItem value="wielkopolskie">Wielkopolskie</SelectItem>
          </SelectContent>
        </Select>

        {/* City Filter */}
        <div>
          <Input 
            placeholder="Miejscowość..." 
            className="rounded-2xl border-2 text-sm"
            value={city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default AnimalFilters;