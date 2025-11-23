import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import OrgLayout from "@/components/organization/OrgLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Plus, Trash2, Package } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  weight_volume?: string;
  description?: string;
  image_url?: string;
  producers?: { name: string };
  product_categories?: { name: string };
}

interface WishlistItem {
  id: string;
  product_id: string;
  quantity: number;
  priority: number;
  products?: Product;
}

const categoryFilters = [
  { id: "all", label: "Wszystko" },
  { id: "karma-sucha", label: "Karma Sucha" },
  { id: "karma-mokra", label: "Karma Mokra" },
  { id: "akcesoria", label: "Akcesoria" },
  { id: "leki", label: "Leki" },
];

export default function OrgWishlist() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddingProduct, setIsAddingProduct] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [priority, setPriority] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (profile?.role !== "ORG") {
      navigate("/");
      return;
    }

    fetchOrganization();
  }, [user, profile, navigate]);

  useEffect(() => {
    if (organizationId) {
      fetchProducts();
      fetchWishlist();
    }
  }, [organizationId]);

  const fetchOrganization = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("organization_users")
      .select("organization_id, organizations(id, name)")
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać danych organizacji",
        variant: "destructive",
      });
      return;
    }

    const org = data.organizations as any;
    setOrganizationId(org.id);
    setOrganizationName(org.name);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        producers(name),
        product_categories(name)
      `)
      .eq("active", true)
      .order("name");

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać produktów",
        variant: "destructive",
      });
      return;
    }

    setProducts(data || []);
  };

  const fetchWishlist = async () => {
    if (!organizationId) return;

    const { data, error } = await supabase
      .from("organization_wishlists")
      .select(`
        *,
        products(
          *,
          producers(name),
          product_categories(name)
        )
      `)
      .eq("organization_id", organizationId)
      .order("priority", { ascending: false });

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać listy potrzeb",
        variant: "destructive",
      });
      return;
    }

    setWishlist(data || []);
  };

  const handleAddToWishlist = async (productId: string) => {
    if (!organizationId) return;

    const { error } = await supabase.from("organization_wishlists").insert({
      organization_id: organizationId,
      product_id: productId,
      quantity: quantity,
      priority: priority,
    });

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się dodać produktu do listy potrzeb",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sukces",
      description: `Dodano ${quantity} szt. do listy potrzeb`,
    });

    setIsAddingProduct(null);
    setQuantity(1);
    setPriority(0);
    fetchWishlist();
  };

  const handleRemoveFromWishlist = async (itemId: string) => {
    const { error } = await supabase
      .from("organization_wishlists")
      .delete()
      .eq("id", itemId);

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć produktu",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sukces",
      description: "Produkt został usunięty z listy potrzeb",
    });

    fetchWishlist();
  };

  const handleUpdatePriority = async (itemId: string, newPriority: number) => {
    const { error } = await supabase
      .from("organization_wishlists")
      .update({ priority: newPriority })
      .eq("id", itemId);

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować priorytetu",
        variant: "destructive",
      });
      return;
    }

    fetchWishlist();
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      product.product_categories?.name.toLowerCase().includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const getPriorityLabel = (priority: number) => {
    if (priority >= 2) return { label: "Pilne", variant: "destructive" as const };
    if (priority === 1) return { label: "Ważne", variant: "default" as const };
    return { label: "Standardowe", variant: "secondary" as const };
  };

  if (!user || profile?.role !== "ORG") {
    return null;
  }

  return (
    <OrgLayout organizationName={organizationName}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Ogólna Lista Potrzeb</h2>
          <p className="text-muted-foreground">
            Zarządzaj ogólnymi potrzebami organizacji, niezależnie od poszczególnych zwierząt
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wishlist Cart */}
          <div className="lg:col-span-1">
            <Card className="h-full shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Lista Potrzeb ({wishlist.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {wishlist.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Brak produktów na liście</p>
                    <p className="text-sm mt-2">Dodaj produkty z katalogu →</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {wishlist.map((item) => {
                      const priorityInfo = getPriorityLabel(item.priority);
                      return (
                        <div
                          key={item.id}
                          className="p-4 bg-muted/50 rounded-2xl hover:bg-muted transition-colors space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground">{item.products?.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.products?.producers?.name}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Ilość: {item.quantity} {item.products?.unit}
                              </p>
                              <p className="text-sm font-medium text-primary mt-1">
                                {((item.products?.price || 0) * item.quantity).toFixed(2)} zł
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveFromWishlist(item.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Priorytet:</span>
                            <div className="flex gap-1">
                              {[0, 1, 2].map((p) => (
                                <Button
                                  key={p}
                                  variant={item.priority === p ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleUpdatePriority(item.id, p)}
                                  className="h-7 px-2 text-xs"
                                >
                                  {p === 0 && "Standard"}
                                  {p === 1 && "Ważne"}
                                  {p === 2 && "Pilne"}
                                </Button>
                              ))}
                            </div>
                          </div>
                          <Badge variant={priorityInfo.variant}>{priorityInfo.label}</Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Product Catalog */}
          <div className="lg:col-span-2">
            <Card className="h-full shadow-card">
              <CardHeader>
                <CardTitle>Katalog Produktów</CardTitle>
                <div className="space-y-4 mt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Szukaj produktu..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 rounded-2xl"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categoryFilters.map((filter) => (
                      <Badge
                        key={filter.id}
                        variant={selectedCategory === filter.id ? "default" : "outline"}
                        className="cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => setSelectedCategory(filter.id)}
                      >
                        {filter.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Nie znaleziono produktów</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
                    {filteredProducts.map((product) => (
                      <Card key={product.id} className="shadow-soft hover:shadow-card transition-shadow">
                        <CardContent className="p-4">
                          {product.image_url && (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-32 object-cover rounded-lg mb-3"
                            />
                          )}
                          <h3 className="font-semibold mb-1 text-foreground">{product.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {product.producers?.name}
                          </p>
                          <p className="text-lg font-bold text-primary mb-3">
                            {product.price.toFixed(2)} zł / {product.unit}
                          </p>
                          <Popover
                            open={isAddingProduct === product.id}
                            onOpenChange={(open) => setIsAddingProduct(open ? product.id : null)}
                          >
                            <PopoverTrigger asChild>
                              <Button className="w-full rounded-2xl shadow-soft" size="lg">
                                <Plus className="h-5 w-5 mr-2" />
                                Dodaj do listy
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="space-y-4">
                                <h4 className="font-semibold">Dodaj do listy potrzeb</h4>
                                <div className="space-y-2">
                                  <Label htmlFor="quantity">Ilość</Label>
                                  <Input
                                    id="quantity"
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                    className="rounded-2xl"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="priority">Priorytet</Label>
                                  <div className="flex gap-2">
                                    {[
                                      { value: 0, label: "Standard" },
                                      { value: 1, label: "Ważne" },
                                      { value: 2, label: "Pilne" },
                                    ].map((p) => (
                                      <Button
                                        key={p.value}
                                        variant={priority === p.value ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setPriority(p.value)}
                                        className="flex-1 rounded-2xl"
                                      >
                                        {p.label}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                                <Button
                                  className="w-full rounded-2xl"
                                  onClick={() => handleAddToWishlist(product.id)}
                                >
                                  Potwierdź
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </OrgLayout>
  );
}
