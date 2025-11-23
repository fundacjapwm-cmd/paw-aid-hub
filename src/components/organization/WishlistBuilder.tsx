import { useState, useEffect } from "react";
import { Search, Plus, ShoppingCart, Minus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import ProductRequestDialog from "./ProductRequestDialog";

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

interface WishlistBuilderProps {
  animalId: string;
  animalName: string;
}

const categoryFilters = [
  { id: "all", label: "Wszystko" },
  { id: "karma-sucha", label: "Karma Sucha" },
  { id: "karma-mokra", label: "Karma Mokra" },
  { id: "akcesoria", label: "Akcesoria" },
  { id: "leki", label: "Leki" },
];

export default function WishlistBuilder({ animalId, animalName }: WishlistBuilderProps) {
  const isMobile = useIsMobile();
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchWishlist();
  }, [animalId]);

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
    const { data, error } = await supabase
      .from("animal_wishlists")
      .select(`
        *,
        products(*)
      `)
      .eq("animal_id", animalId);

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać wishlisty",
        variant: "destructive",
      });
      return;
    }

    setWishlist(data || []);
  };

  const handleAddToWishlist = async (productId: string) => {
    const { error } = await supabase.from("animal_wishlists").insert({
      animal_id: animalId,
      product_id: productId,
      quantity: 1,
      priority: 0,
    });

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się dodać produktu do wishlisty",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sukces",
      description: `Dodano do potrzeb ${animalName}`,
    });

    fetchWishlist();
  };

  const handleUpdateQuantity = async (itemId: string, productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await handleRemoveFromWishlist(itemId);
      return;
    }

    const { error } = await supabase
      .from("animal_wishlists")
      .update({ quantity: newQuantity })
      .eq("id", itemId);

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować ilości",
        variant: "destructive",
      });
      return;
    }

    fetchWishlist();
  };

  const getWishlistItem = (productId: string) => {
    return wishlist.find(item => item.product_id === productId);
  };

  const handleRemoveFromWishlist = async (itemId: string) => {
    const { error } = await supabase.from("animal_wishlists").delete().eq("id", itemId);

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
      description: "Produkt został usunięty",
    });

    fetchWishlist();
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      product.product_categories?.name.toLowerCase().includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const WishlistCart = () => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Koszyk Potrzeb - {animalName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {wishlist.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Brak produktów w koszyku</p>
            <p className="text-sm mt-2">Dodaj produkty z katalogu →</p>
          </div>
        ) : (
          <div className="space-y-3">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium">{item.products?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} {item.products?.unit}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFromWishlist(item.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  Usuń
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const ProductCatalog = () => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Katalog Produktów</CardTitle>
        <div className="space-y-4 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Szukaj produktu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
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
            <p className="text-muted-foreground mb-4">Nie znaleziono produktów</p>
            <Button onClick={() => setShowRequestDialog(true)} variant="outline">
              Zgłoś brak produktu
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product) => {
              const wishlistItem = getWishlistItem(product.id);
              
              return (
                <Card key={product.id} className="shadow-card hover:shadow-bubbly transition-shadow">
                  <CardContent className="p-4 flex items-center gap-4">
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {product.producers?.name}
                      </p>
                      <p className="text-lg font-bold text-primary">
                        {product.price.toFixed(2)} zł
                      </p>
                    </div>
                    
                    <div className="flex-shrink-0">
                      {wishlistItem ? (
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleUpdateQuantity(
                              wishlistItem.id,
                              product.id,
                              wishlistItem.quantity - 1
                            )}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            min="0"
                            value={wishlistItem.quantity}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '' || val === '0') {
                                handleRemoveFromWishlist(wishlistItem.id);
                              } else {
                                const num = parseInt(val, 10);
                                if (!isNaN(num) && num >= 0) {
                                  handleUpdateQuantity(wishlistItem.id, product.id, num);
                                }
                              }
                            }}
                            className="text-center w-20"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleUpdateQuantity(
                              wishlistItem.id,
                              product.id,
                              wishlistItem.quantity + 1
                            )}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          className="rounded-2xl" 
                          size="lg"
                          onClick={() => handleAddToWishlist(product.id)}
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          Dodaj
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isMobile) {
    return (
      <>
        <Tabs defaultValue="catalog" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="catalog">Katalog</TabsTrigger>
            <TabsTrigger value="wishlist">
              Koszyk ({wishlist.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="catalog" className="mt-4">
            <ProductCatalog />
          </TabsContent>
          <TabsContent value="wishlist" className="mt-4">
            <WishlistCart />
          </TabsContent>
        </Tabs>
        <ProductRequestDialog
          open={showRequestDialog}
          onOpenChange={setShowRequestDialog}
        />
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProductCatalog />
        </div>
        <div className="lg:col-span-1">
          <WishlistCart />
        </div>
      </div>
      <ProductRequestDialog
        open={showRequestDialog}
        onOpenChange={setShowRequestDialog}
      />
    </>
  );
}
