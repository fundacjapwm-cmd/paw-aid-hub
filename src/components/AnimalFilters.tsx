import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Filter, X, Building2, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FiltersProps {
  onFilterChange?: (filters: {
    organization: string;
    species: string;
    city: string;
  }) => void;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
}

const AnimalFilters = ({ onFilterChange }: FiltersProps) => {
  const [organizationName, setOrganizationName] = useState("");
  const [species, setSpecies] = useState("wszystkie");
  const [city, setCity] = useState("");
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    const { data, error } = await supabase
      .from("organizations")
      .select("id, name, slug")
      .eq("active", true)
      .order("name");
    
    if (!error && data) {
      setOrganizations(data);
    }
  };

  // Debounced search for organization
  useEffect(() => {
    const timer = setTimeout(() => {
      const matchingOrg = organizations.find(org => 
        org.name.toLowerCase() === organizationName.toLowerCase()
      );
      handleFilterChange('organization', matchingOrg?.id || "");
    }, 300);

    return () => clearTimeout(timer);
  }, [organizationName, organizations]);

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'species') {
      setSpecies(value);
    }
    if (key === 'city') {
      setCity(value);
    }
    
    const newFilters = {
      organization: key === 'organization' ? value : "",
      species: key === 'species' ? value : species,
      city: key === 'city' ? value : city,
    };
    
    onFilterChange?.(newFilters);
  };

  const handleClearFilters = () => {
    setOrganizationName("");
    setSpecies("wszystkie");
    setCity("");
    onFilterChange?.({
      organization: "",
      species: "wszystkie",
      city: ""
    });
  };

  const hasActiveFilters = organizationName !== "" || species !== "wszystkie" || city !== "";
  return (
    <div className="bg-card rounded-3xl p-4 sm:p-6 shadow-card border border-border/50">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-primary" />
          <h2 className="text-base sm:text-lg font-semibold text-foreground">Filtry</h2>
        </div>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearFilters}
            className="text-xs sm:text-sm"
          >
            <X className="h-4 w-4 mr-1" />
            Wyczyść
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Organization Filter */}
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Organizacja..." 
            className="pl-10 rounded-2xl border-2 text-sm"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            list="organizations"
          />
          <datalist id="organizations">
            {organizations.map((org) => (
              <option key={org.id} value={org.name} />
            ))}
          </datalist>
        </div>

        {/* Species Filter */}
        <Select value={species} onValueChange={(value) => handleFilterChange('species', value)}>
          <SelectTrigger className="rounded-2xl border-2 text-sm">
            <SelectValue placeholder="Wybierz typ" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-2 border-border rounded-2xl z-50">
            <SelectItem value="wszystkie">Wszystkie</SelectItem>
            <SelectItem value="Pies">Pies</SelectItem>
            <SelectItem value="Kot">Kot</SelectItem>
            <SelectItem value="Inne">Inne</SelectItem>
          </SelectContent>
        </Select>

        {/* City Filter */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Miejscowość..." 
            className="pl-10 rounded-2xl border-2 text-sm"
            value={city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default AnimalFilters;