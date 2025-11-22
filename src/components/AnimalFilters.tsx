import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Filter, X, Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  const [organization, setOrganization] = useState("");
  const [species, setSpecies] = useState("wszystkie");
  const [city, setCity] = useState("");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [orgSearch, setOrgSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedOrgName, setSelectedOrgName] = useState("");

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

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(orgSearch.toLowerCase())
  );

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'organization') {
      setOrganization(value);
    }
    if (key === 'species') {
      setSpecies(value);
    }
    if (key === 'city') {
      setCity(value);
    }
    
    const newFilters = {
      organization: key === 'organization' ? value : organization,
      species: key === 'species' ? value : species,
      city: key === 'city' ? value : city,
    };
    
    onFilterChange?.(newFilters);
  };

  const handleClearFilters = () => {
    setOrganization("");
    setSpecies("wszystkie");
    setCity("");
    setSelectedOrgName("");
    setOrgSearch("");
    onFilterChange?.({
      organization: "",
      species: "wszystkie",
      city: ""
    });
  };

  const hasActiveFilters = organization !== "" || species !== "wszystkie" || city !== "";
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
        {/* Organization Filter with Autocomplete */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between rounded-2xl border-2 text-sm font-normal h-10"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">
                  {selectedOrgName || "Wybierz organizację..."}
                </span>
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0 bg-popover border-2 border-border rounded-2xl z-50">
            <Command>
              <CommandInput 
                placeholder="Szukaj organizacji..." 
                value={orgSearch}
                onValueChange={setOrgSearch}
                className="h-9"
              />
              <CommandList>
                <CommandEmpty>Nie znaleziono organizacji.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value=""
                    onSelect={() => {
                      setOrganization("");
                      setSelectedOrgName("");
                      setOrgSearch("");
                      setOpen(false);
                      handleFilterChange('organization', "");
                    }}
                  >
                    Wszystkie organizacje
                  </CommandItem>
                  {filteredOrganizations.map((org) => (
                    <CommandItem
                      key={org.id}
                      value={org.name}
                      onSelect={() => {
                        setOrganization(org.id);
                        setSelectedOrgName(org.name);
                        setOpen(false);
                        handleFilterChange('organization', org.id);
                      }}
                    >
                      {org.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Species Filter */}
        <Select value={species} onValueChange={(value) => handleFilterChange('species', value)}>
          <SelectTrigger className="rounded-2xl border-2 text-sm">
            <SelectValue placeholder="Typ zwierzęcia" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-2 border-border rounded-2xl z-50">
            <SelectItem value="wszystkie">Wszystkie</SelectItem>
            <SelectItem value="Pies">Pies</SelectItem>
            <SelectItem value="Kot">Kot</SelectItem>
            <SelectItem value="Inne">Inne</SelectItem>
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