import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Filter, X, Building2, MapPin } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FiltersProps {
  onFilterChange?: (filters: {
    organization: string;
    species: string;
    city: string;
    sortBy: string;
  }) => void;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  city?: string;
}

const AnimalFilters = ({ onFilterChange }: FiltersProps) => {
  const [organizationName, setOrganizationName] = useState("");
  const [species, setSpecies] = useState("wszystkie");
  const [city, setCity] = useState("");
  const [sortBy, setSortBy] = useState("najmniej_najedzone");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [isOrgOpen, setIsOrgOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);

  useEffect(() => {
    fetchOrganizations();
    fetchCities();
  }, []);

  const fetchOrganizations = async () => {
    const { data, error } = await supabase
      .from("organizations")
      .select("id, name, slug, logo_url, city")
      .eq("active", true)
      .order("name");
    
    if (!error && data) {
      setOrganizations(data);
    }
  };

  const fetchCities = async () => {
    const { data, error } = await supabase
      .from("organizations")
      .select("city")
      .eq("active", true)
      .not("city", "is", null);
    
    if (!error && data) {
      const uniqueCities = Array.from(new Set(data.map(org => org.city).filter(Boolean))) as string[];
      setCities(uniqueCities.sort());
    }
  };

  const orgSuggestions = useMemo(() => {
    if (organizationName.length < 3) return [];
    return organizations.filter((org) => 
      org.name.toLowerCase().includes(organizationName.toLowerCase())
    ).slice(0, 5);
  }, [organizations, organizationName]);

  const citySuggestions = useMemo(() => {
    if (city.length < 3) return [];
    return cities.filter((c) => 
      c.toLowerCase().includes(city.toLowerCase())
    ).slice(0, 5);
  }, [cities, city]);

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
    if (key === 'sortBy') {
      setSortBy(value);
    }
    
    // Get current organization ID for the filter
    const currentOrgId = key === 'organization' ? value : 
      organizations.find(org => org.name.toLowerCase() === organizationName.toLowerCase())?.id || "";
    
    const newFilters = {
      organization: currentOrgId,
      species: key === 'species' ? value : species,
      city: key === 'city' ? value : city,
      sortBy: key === 'sortBy' ? value : sortBy,
    };
    
    onFilterChange?.(newFilters);
  };

  const handleClearFilters = () => {
    setOrganizationName("");
    setSpecies("wszystkie");
    setCity("");
    setSortBy("najmniej_najedzone");
    onFilterChange?.({
      organization: "",
      species: "wszystkie",
      city: "",
      sortBy: "najmniej_najedzone"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Organization Filter with Autocomplete */}
        <Popover open={isOrgOpen && organizationName.length >= 3 && orgSuggestions.length > 0} onOpenChange={setIsOrgOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input 
                placeholder="Organizacja..." 
                className="pl-10 rounded-2xl border-2 text-sm bg-background"
                value={organizationName}
                onChange={(e) => {
                  setOrganizationName(e.target.value);
                  if (e.target.value.length >= 3) {
                    setIsOrgOpen(true);
                  }
                }}
                onFocus={() => {
                  if (organizationName.length >= 3 && orgSuggestions.length > 0) {
                    setIsOrgOpen(true);
                  }
                }}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-[320px] p-0 bg-popover border-2 border-border rounded-2xl z-[100]" align="start" sideOffset={8}>
            <Command className="bg-popover">
              <CommandList className="max-h-[300px]">
                <CommandGroup heading="Organizacje" className="text-muted-foreground px-2 py-1.5 text-xs font-semibold">
                  {orgSuggestions.map((org) => (
                    <CommandItem
                      key={org.id}
                      value={org.name}
                      onSelect={() => {
                        setOrganizationName(org.name);
                        setIsOrgOpen(false);
                      }}
                      className="cursor-pointer px-3 py-2.5 hover:bg-accent rounded-xl my-1"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Avatar className="h-8 w-8 border-2 border-border">
                          <AvatarImage src={org.logo_url} alt={org.name} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                            {org.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground text-sm truncate">{org.name}</div>
                          {org.city && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                              <MapPin className="h-3 w-3" />
                              <span>{org.city}</span>
                            </div>
                          )}
                        </div>
                      </div>
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
            <SelectValue placeholder="Wybierz typ" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-2 border-border rounded-2xl z-50">
            <SelectItem value="wszystkie">Wszystkie zwierzęta</SelectItem>
            <SelectItem value="Pies">Pies</SelectItem>
            <SelectItem value="Kot">Kot</SelectItem>
            <SelectItem value="Inne">Inne</SelectItem>
          </SelectContent>
        </Select>

        {/* City Filter with Autocomplete */}
        <Popover open={isCityOpen && city.length >= 3 && citySuggestions.length > 0} onOpenChange={setIsCityOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input 
                placeholder="Miejscowość..." 
                className="pl-10 rounded-2xl border-2 text-sm bg-background"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  handleFilterChange('city', e.target.value);
                  if (e.target.value.length >= 3) {
                    setIsCityOpen(true);
                  }
                }}
                onFocus={() => {
                  if (city.length >= 3 && citySuggestions.length > 0) {
                    setIsCityOpen(true);
                  }
                }}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-0 bg-popover border-2 border-border rounded-2xl z-[100]" align="start" sideOffset={8}>
            <Command className="bg-popover">
              <CommandList className="max-h-[250px]">
                <CommandGroup heading="Miasta" className="text-muted-foreground px-2 py-1.5 text-xs font-semibold">
                  {citySuggestions.map((cityName) => (
                    <CommandItem
                      key={cityName}
                      value={cityName}
                      onSelect={() => {
                        setCity(cityName);
                        handleFilterChange('city', cityName);
                        setIsCityOpen(false);
                      }}
                      className="cursor-pointer px-3 py-2.5 hover:bg-accent rounded-xl my-1"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-medium text-foreground text-sm">{cityName}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Sort Filter */}
        <Select value={sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
          <SelectTrigger className="rounded-2xl border-2 text-sm">
            <SelectValue placeholder="Sortowanie" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-2 border-border rounded-2xl z-50">
            <SelectItem value="najnowsze">Najnowsze</SelectItem>
            <SelectItem value="najstarsze">Najstarsze</SelectItem>
            <SelectItem value="alfabetycznie">Alfabetycznie A-Z</SelectItem>
            <SelectItem value="najbardziej_najedzone">Brzuszek: od najbardziej najedzonych</SelectItem>
            <SelectItem value="najmniej_najedzone">Brzuszek: od najmniej najedzonych</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default AnimalFilters;