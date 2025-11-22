import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Heart, MapPin, Users, Phone, Mail, Filter, Search, X } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";

interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  city?: string;
  province?: string;
  address?: string;
  postal_code?: string;
  contact_phone?: string;
  contact_email: string;
  logo_url?: string;
  animalsCount?: number;
}

const Organizacje = () => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [orgType, setOrgType] = useState("wszystkie");
  const [city, setCity] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const { data: orgsData, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("active", true);

      if (error) throw error;

      // Count animals for each organization
      const orgsWithCounts = await Promise.all(
        (orgsData || []).map(async (org) => {
          const { count } = await supabase
            .from("animals")
            .select("*", { count: "exact", head: true })
            .eq("organization_id", org.id)
            .eq("active", true);

          return {
            ...org,
            animalsCount: count || 0,
          };
        })
      );

      setOrganizations(orgsWithCounts);
    } catch (error) {
      console.error("Error fetching organizations:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrganizations = useMemo(() => {
    return organizations.filter((org) => {
      const matchesSearch = org.name.toLowerCase().includes(search.toLowerCase()) ||
                           (org.description || "").toLowerCase().includes(search.toLowerCase());
      
      const matchesCity = city === "" || 
                         (org.city || "").toLowerCase().includes(city.toLowerCase());
      
      return matchesSearch && matchesCity;
    });
  }, [organizations, search, city]);

  const searchSuggestions = useMemo(() => {
    if (search.length < 3) return [];
    return organizations.filter((org) => 
      org.name.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 5);
  }, [organizations, search]);

  const handleClearFilters = () => {
    setSearch("");
    setOrgType("wszystkie");
    setCity("");
  };

  const hasActiveFilters = search !== "" || orgType !== "wszystkie" || city !== "";
  
  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Header Section */}
        <section className="py-12 md:py-20 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Nasi partnerzy
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
              Poznaj organizacje, które codziennie pomagają zwierzętom w potrzebie. Wspieraj ich działania!
            </p>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4 max-w-7xl">
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
                {/* Search with Autocomplete */}
                <Popover open={isSearchOpen && search.length >= 3} onOpenChange={setIsSearchOpen}>
                  <PopoverTrigger asChild>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Szukaj organizacji..."
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setIsSearchOpen(true);
                        }}
                        onFocus={() => setIsSearchOpen(true)}
                        className="pl-9 rounded-2xl border-border/50 focus:border-primary"
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandList>
                        {searchSuggestions.length === 0 ? (
                          <CommandEmpty>Brak wyników</CommandEmpty>
                        ) : (
                          <CommandGroup>
                            {searchSuggestions.map((org) => (
                              <CommandItem
                                key={org.id}
                                value={org.name}
                                onSelect={() => {
                                  navigate(`/organizacje/${org.slug}`);
                                  setIsSearchOpen(false);
                                }}
                                className="cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  {org.logo_url && (
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={org.logo_url} alt={org.name} />
                                      <AvatarFallback>{org.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                  )}
                                  <div>
                                    <div className="font-medium">{org.name}</div>
                                    {org.city && (
                                      <div className="text-xs text-muted-foreground">{org.city}</div>
                                    )}
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* Organization Type */}
                <Select value={orgType} onValueChange={setOrgType}>
                  <SelectTrigger className="rounded-2xl border-border/50">
                    <SelectValue placeholder="Typ organizacji" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wszystkie">Wszystkie typy</SelectItem>
                    <SelectItem value="fundacja">Fundacja</SelectItem>
                    <SelectItem value="stowarzyszenie">Stowarzyszenie</SelectItem>
                    <SelectItem value="schronisko">Schronisko</SelectItem>
                  </SelectContent>
                </Select>

                {/* City */}
                <Input
                  placeholder="Miasto..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="rounded-2xl border-border/50 focus:border-primary"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Organizations List */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-7xl">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="rounded-3xl overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-6 space-y-4">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredOrganizations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  Nie znaleziono organizacji spełniających wybrane kryteria.
                </p>
              </div>
            ) : (
              <>
                <div className="text-sm text-muted-foreground mb-4">
                  Znaleziono {filteredOrganizations.length} {filteredOrganizations.length === 1 ? 'organizację' : 'organizacji'}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredOrganizations.map((org) => (
                    <Card 
                      key={org.id}
                      onClick={() => navigate(`/organizacje/${org.slug}`)}
                      className="group overflow-hidden bg-card hover:shadow-bubbly transition-all duration-300 hover:-translate-y-3 rounded-3xl border-0 shadow-card cursor-pointer"
                    >
                      {/* Header with Background Image */}
                      <div 
                        className="relative h-48 bg-muted overflow-hidden"
                        style={{
                          backgroundImage: org.logo_url ? `url(${org.logo_url})` : undefined,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      >
                        {/* Shadow gradient at bottom for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                          <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">{org.name}</h3>
                          {(org.city || org.province) && (
                            <div className="flex items-center justify-center space-x-2 text-white/90 drop-shadow">
                              <MapPin className="h-4 w-4" />
                              <span className="font-medium">
                                {org.city}{org.province && `, ${org.province}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 space-y-4">
                        {org.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                            {org.description}
                          </p>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-muted/30 rounded-2xl p-4 text-center">
                            <div className="flex items-center justify-center mb-2">
                              <Heart className="h-5 w-5 text-primary fill-current" />
                            </div>
                            <p className="text-lg font-bold text-foreground">{org.animalsCount || 0}</p>
                            <p className="text-xs text-muted-foreground">podopiecznych</p>
                          </div>
                          <div className="bg-muted/30 rounded-2xl p-4">
                            <div className="flex items-center justify-center mb-2">
                              <MapPin className="h-5 w-5 text-primary" />
                            </div>
                            {(org.address || org.city) ? (
                              <div className="text-sm text-foreground text-center">
                                {org.address && <div className="font-medium">{org.address}</div>}
                                {org.postal_code && org.city && (
                                  <div className="text-muted-foreground">{org.postal_code} {org.city}</div>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground text-center">Brak adresu</p>
                            )}
                          </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-2 pt-4 border-t border-border/50">
                          {org.contact_phone && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Phone className="h-4 w-4 mr-2" />
                              {org.contact_phone}
                            </div>
                          )}
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Mail className="h-4 w-4 mr-2" />
                            {org.contact_email}
                          </div>
                        </div>

                        {/* CTA */}
                        <Button 
                          className="w-full rounded-2xl bg-primary hover:bg-primary/90"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/organizacje/${org.slug}`);
                          }}
                        >
                          Zobacz profil organizacji
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Organizacje;
