import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Building2, Package, ShoppingCart, ArrowUpDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface OrganizationStats {
  id: string;
  name: string;
  animalsCount: number;
  wishlistProductsCount: number;
  purchasedItemsCount: number;
}

interface Animal {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  age: number | null;
  image_url: string | null;
  adoption_status: string;
}

interface OrganizationDetails {
  id: string;
  name: string;
  description: string | null;
  contact_email: string;
  contact_phone: string | null;
  city: string | null;
  province: string | null;
  website: string | null;
  logo_url: string | null;
  animals: Animal[];
  stats: OrganizationStats;
}

export default function AdminOrganizationStats() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OrganizationStats[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [topCount, setTopCount] = useState("10");
  const [sortBy, setSortBy] = useState<"animals" | "wishlists" | "purchases">("animals");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [orgDetails, setOrgDetails] = useState<OrganizationDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (profile && profile.role !== "ADMIN") {
      navigate("/auth");
    } else if (profile?.role === "ADMIN") {
      fetchStats();
    }
  }, [profile, navigate]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch all active organizations
      const { data: organizations, error: orgsError } = await supabase
        .from("organizations")
        .select("id, name")
        .eq("active", true)
        .order("name");

      if (orgsError) throw orgsError;

      const statsData: OrganizationStats[] = [];

      for (const org of organizations || []) {
        // Count animals
        const { count: animalsCount } = await supabase
          .from("animals")
          .select("*", { count: "exact", head: true })
          .eq("organization_id", org.id)
          .eq("active", true);

        // Count wishlist products (sum of quantities)
        const { data: wishlistData } = await supabase
          .from("animal_wishlists")
          .select("quantity, animal_id!inner(organization_id)")
          .eq("animal_id.organization_id", org.id);

        const wishlistProductsCount = wishlistData?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

        // Count purchased items (sum of quantities from order_items)
        const { data: orderItemsData } = await supabase
          .from("order_items")
          .select("quantity, animal_id!inner(organization_id)")
          .eq("animal_id.organization_id", org.id);

        const purchasedItemsCount = orderItemsData?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

        statsData.push({
          id: org.id,
          name: org.name,
          animalsCount: animalsCount || 0,
          wishlistProductsCount,
          purchasedItemsCount,
        });
      }

      setStats(statsData);
    } catch (error) {
      console.error("Error fetching organization stats:", error);
      toast.error("Błąd podczas pobierania statystyk organizacji");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Ładowanie statystyk...</p>
        </div>
      </div>
    );
  }

  // Filter by search query
  const filteredStats = stats.filter(org => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort function
  const getSortedStats = (data: OrganizationStats[]) => {
    const sorted = [...data].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "animals":
          comparison = a.animalsCount - b.animalsCount;
          break;
        case "wishlists":
          comparison = a.wishlistProductsCount - b.wishlistProductsCount;
          break;
        case "purchases":
          comparison = a.purchasedItemsCount - b.purchasedItemsCount;
          break;
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });

    const limit = topCount === "all" ? sorted.length : parseInt(topCount);
    return sorted.slice(0, limit);
  };

  const sortedStats = getSortedStats(filteredStats);
  
  const topByAnimals = [...stats].sort((a, b) => b.animalsCount - a.animalsCount).slice(0, 5);
  const topByWishlists = [...stats].sort((a, b) => b.wishlistProductsCount - a.wishlistProductsCount).slice(0, 5);
  const topByPurchases = [...stats].sort((a, b) => b.purchasedItemsCount - a.purchasedItemsCount).slice(0, 5);

  // Prepare chart data
  const chartData = sortedStats.map(org => ({
    name: org.name.length > 20 ? org.name.substring(0, 20) + "..." : org.name,
    fullName: org.name,
    Zwierzęta: org.animalsCount,
    "Produkty w wishlistach": org.wishlistProductsCount,
    "Kupione produkty": org.purchasedItemsCount,
  }));

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "desc" ? "asc" : "desc");
  };

  const fetchOrganizationDetails = async (orgId: string) => {
    try {
      setDetailsLoading(true);
      
      // Fetch organization data
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", orgId)
        .maybeSingle();

      if (orgError) throw orgError;
      if (!orgData) {
        toast.error("Nie znaleziono organizacji");
        return;
      }

      // Fetch animals for this organization
      const { data: animalsData, error: animalsError } = await supabase
        .from("animals")
        .select("id, name, species, breed, age, image_url, adoption_status")
        .eq("organization_id", orgId)
        .eq("active", true)
        .order("name");

      if (animalsError) throw animalsError;

      // Get stats for this organization
      const orgStats = stats.find(s => s.id === orgId);

      setOrgDetails({
        ...orgData,
        animals: animalsData || [],
        stats: orgStats || {
          id: orgId,
          name: orgData.name,
          animalsCount: 0,
          wishlistProductsCount: 0,
          purchasedItemsCount: 0,
        },
      });

      setDialogOpen(true);
    } catch (error) {
      console.error("Error fetching organization details:", error);
      toast.error("Błąd podczas pobierania szczegółów organizacji");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleBarClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const orgName = data.activePayload[0].payload.fullName;
      const org = stats.find(s => s.name === orgName);
      if (org) {
        setSelectedOrgId(org.id);
        fetchOrganizationDetails(org.id);
      }
    }
  };

  return (
    <div className="md:px-8 px-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filtry i Sortowanie</CardTitle>
          <CardDescription>Dostosuj widok statystyk organizacji</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Szukaj organizacji</label>
              <Input
                placeholder="Nazwa organizacji..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Liczba organizacji</label>
              <Select value={topCount} onValueChange={setTopCount}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">TOP 5</SelectItem>
                  <SelectItem value="10">TOP 10</SelectItem>
                  <SelectItem value="20">TOP 20</SelectItem>
                  <SelectItem value="all">Wszystkie</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sortuj według</label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="animals">Liczba zwierząt</SelectItem>
                  <SelectItem value="wishlists">Zapotrzebowanie</SelectItem>
                  <SelectItem value="purchases">Sprzedaż</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Kolejność</label>
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={toggleSortOrder}
              >
                {sortOrder === "desc" ? "Malejąco" : "Rosnąco"}
                <ArrowUpDown className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Wykres Porównawczy</CardTitle>
          <CardDescription>
            Porównanie organizacji według wybranego kryterium ({topCount === "all" ? "wszystkie" : `TOP ${topCount}`})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                onClick={handleBarClick}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  className="text-xs"
                />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)"
                  }}
                  labelFormatter={(value) => {
                    const item = chartData.find(d => d.name === value);
                    return item?.fullName || value;
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                <Bar 
                  dataKey="Zwierzęta" 
                  fill="hsl(var(--primary))" 
                  cursor="pointer"
                />
                <Bar 
                  dataKey="Produkty w wishlistach" 
                  fill="hsl(var(--chart-2))" 
                  cursor="pointer"
                />
                <Bar 
                  dataKey="Kupione produkty" 
                  fill="hsl(var(--chart-3))" 
                  cursor="pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Kliknij na słupek, aby zobaczyć szczegóły organizacji
          </p>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {orgDetails?.logo_url && (
                <Avatar className="h-10 w-10">
                  <AvatarImage src={orgDetails.logo_url} alt={orgDetails.name} />
                  <AvatarFallback>{orgDetails.name.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <span>{orgDetails?.name}</span>
            </DialogTitle>
            <DialogDescription>
              Szczegółowe informacje o organizacji i jej zwierzętach
            </DialogDescription>
          </DialogHeader>

          {detailsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Ładowanie szczegółów...</p>
              </div>
            </div>
          ) : orgDetails ? (
            <ScrollArea className="h-[60vh]">
              <div className="space-y-6 pr-4">
                {/* Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informacje podstawowe</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {orgDetails.description && (
                      <p className="text-sm text-muted-foreground">{orgDetails.description}</p>
                    )}
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Email kontaktowy</p>
                        <p className="text-sm font-medium">{orgDetails.contact_email}</p>
                      </div>
                      {orgDetails.contact_phone && (
                        <div>
                          <p className="text-xs text-muted-foreground">Telefon</p>
                          <p className="text-sm font-medium">{orgDetails.contact_phone}</p>
                        </div>
                      )}
                      {orgDetails.city && (
                        <div>
                          <p className="text-xs text-muted-foreground">Miasto</p>
                          <p className="text-sm font-medium">{orgDetails.city}</p>
                        </div>
                      )}
                      {orgDetails.province && (
                        <div>
                          <p className="text-xs text-muted-foreground">Województwo</p>
                          <p className="text-sm font-medium">{orgDetails.province}</p>
                        </div>
                      )}
                      {orgDetails.website && (
                        <div className="col-span-2">
                          <p className="text-xs text-muted-foreground">Strona internetowa</p>
                          <a 
                            href={orgDetails.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            {orgDetails.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Statistics */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Liczba zwierząt
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{orgDetails.stats.animalsCount}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Produkty w wishlistach
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{orgDetails.stats.wishlistProductsCount}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Kupione produkty
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{orgDetails.stats.purchasedItemsCount}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Animals List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Zwierzęta ({orgDetails.animals.length})
                    </CardTitle>
                    <CardDescription>
                      Lista aktywnych zwierząt w tej organizacji
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {orgDetails.animals.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Brak zwierząt w tej organizacji
                      </p>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2">
                        {orgDetails.animals.map((animal) => (
                          <div 
                            key={animal.id} 
                            className="flex gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <Avatar className="h-16 w-16 rounded-lg">
                              <AvatarImage 
                                src={animal.image_url || "/placeholder.svg"} 
                                alt={animal.name} 
                              />
                              <AvatarFallback className="rounded-lg">
                                {animal.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{animal.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                {animal.species}
                                {animal.breed && ` • ${animal.breed}`}
                                {animal.age && ` • ${animal.age} lat`}
                              </p>
                              <Badge variant="outline" className="mt-1 text-xs">
                                {animal.adoption_status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          ) : null}
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Najwięcej Zwierząt</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topByAnimals[0]?.name || "—"}</div>
            <p className="text-xs text-muted-foreground">
              {topByAnimals[0]?.animalsCount || 0} zwierząt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Największe Zapotrzebowanie</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topByWishlists[0]?.name || "—"}</div>
            <p className="text-xs text-muted-foreground">
              {topByWishlists[0]?.wishlistProductsCount || 0} produktów w wishlistach
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Największy Ruch</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topByPurchases[0]?.name || "—"}</div>
            <p className="text-xs text-muted-foreground">
              {topByPurchases[0]?.purchasedItemsCount || 0} kupionych produktów
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 - Liczba Zwierząt</CardTitle>
            <CardDescription>Organizacje z największą liczbą zwierząt</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Organizacja</TableHead>
                  <TableHead className="text-right">Zwierzęta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topByAnimals.map((org, index) => (
                  <TableRow key={org.id}>
                    <TableCell>
                      <Badge variant={index === 0 ? "default" : "outline"}>
                        {index + 1}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell className="text-right">{org.animalsCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 - Zapotrzebowanie</CardTitle>
            <CardDescription>Organizacje z największą liczbą produktów w wishlistach</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Organizacja</TableHead>
                  <TableHead className="text-right">Produkty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topByWishlists.map((org, index) => (
                  <TableRow key={org.id}>
                    <TableCell>
                      <Badge variant={index === 0 ? "default" : "outline"}>
                        {index + 1}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell className="text-right">{org.wishlistProductsCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 - Sprzedaż</CardTitle>
            <CardDescription>Organizacje z największą liczbą kupionych produktów</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Organizacja</TableHead>
                  <TableHead className="text-right">Zakupy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topByPurchases.map((org, index) => (
                  <TableRow key={org.id}>
                    <TableCell>
                      <Badge variant={index === 0 ? "default" : "outline"}>
                        {index + 1}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell className="text-right">{org.purchasedItemsCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
