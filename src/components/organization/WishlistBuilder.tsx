import { useState, useEffect, useMemo } from "react";
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
  entityId: string;
  entityName: string;
  entityType: "animal" | "organization";
}

const categoryFilters = [
  { id: "all", label: "Wszystko" },
  { id: "karma-sucha", label: "Karma Sucha" },
  { id: "karma-mokra", label: "Karma Mokra" },
  { id: "akcesoria", label: "Akcesoria" },
  { id: "leki", label: "Leki" },
];

export default function WishlistBuilder({ entityId, entityName, entityType }: WishlistBuilderProps) {
  const isMobile = useIsMobile();
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchWishlist();
  }, [entityId]);

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
    if (entityType === "animal") {
      const { data, error } = await supabase
        .from("animal_wishlists")
        .select(`
          *,
          products(*)
        `)
        .eq("animal_id", entityId)
        .order("created_at", { ascending: true });

      if (error) {
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać wishlisty",
          variant: "destructive",
        });
        return;
      }

      setWishlist(data || []);
    } else {
      const { data, error } = await supabase
        .from("organization_wishlists")
        .select(`
          *,
          products(*)
        `)
        .eq("organization_id", entityId)
        .order("created_at", { ascending: true });

      if (error) {
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać wishlisty",
          variant: "destructive",
        });
        return;
      }

      setWishlist(data || []);
    }
  };

  const handleAddToWishlist = async (productId: string) => {
    if (entityType === "animal") {
      const { error } = await supabase.from("animal_wishlists").insert({
        animal_id: entityId,
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
    } else {
      const { error } = await supabase.from("organization_wishlists").insert({
        organization_id: entityId,
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
    }

    toast({
      title: "Sukces",
      description: `Dodano do potrzeb ${entityName}`,
    });

    fetchWishlist();
  };

  const handleUpdateQuantity = async (itemId: string, productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await handleRemoveFromWishlist(itemId);
      return;
    }

    const tableName = entityType === "animal" ? "animal_wishlists" : "organization_wishlists";
    
    const { error } = await supabase
      .from(tableName)
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
    const tableName = entityType === "animal" ? "animal_wishlists" : "organization_wishlists";
    
    const { error } = await supabase.from(tableName).delete().eq("id", itemId);

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
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.producers?.name && product.producers.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === "all" ||
      product.product_categories?.name.toLowerCase().includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const wishlistCart = useMemo(() => {
    const totalValue = wishlist.reduce((sum, item) => {
      const itemPrice = item.products?.price || 0;
      return sum + (itemPrice * item.quantity);
    }, 0);

    return (
      <Card className="flex flex-col h-full lg:sticky lg:top-6 max-h-[70vh]">
        <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Koszyk Potrzeb - {entityName}
            </CardTitle>
          {wishlist.length > 0 && (
            <div className="mt-2 pt-2 border-t">
              <p className="text-sm text-muted-foreground">Całkowita wartość</p>
              <p className="text-2xl font-bold text-primary">{totalValue.toFixed(2)} zł</p>
            </div>
          )}
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          {wishlist.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Brak produktów w koszyku</p>
              <p className="text-sm mt-2">Dodaj produkty z katalogu ←</p>
            </div>
          ) : (
            <div className="space-y-3">
              {wishlist.map((item) => (
                <Card
                  key={item.id}
                  className="p-3 bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {item.products?.image_url && (
                      <img
                        src={item.products.image_url}
                        alt={item.products.name}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium mb-1">{item.products?.name}</p>
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.products?.price.toFixed(2)} zł / {item.products?.unit}
                      </p>
                      <p className="text-sm font-semibold text-primary">
                        Razem: {((item.products?.price || 0) * item.quantity).toFixed(2)} zł
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleUpdateQuantity(
                          item.id,
                          item.product_id || '',
                          item.quantity - 1
                        )}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || val === '0') {
                            handleRemoveFromWishlist(item.id);
                          } else {
                            const num = parseInt(val, 10);
                            if (!isNaN(num) && num >= 0) {
                              handleUpdateQuantity(item.id, item.product_id || '', num);
                            }
                          }
                        }}
                        className="text-center w-16 h-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleUpdateQuantity(
                          item.id,
                          item.product_id || '',
                          item.quantity + 1
                        )}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
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
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }, [wishlist, entityName]);

  const productCatalog = useMemo(() => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Katalog Produktów</CardTitle>
        <div className="space-y-4 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Szukaj po nazwie lub producencie..."
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
      <CardContent className="max-h-[70vh] overflow-y-auto">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Nie znaleziono produktów</p>
            <Button onClick={() => setShowRequestDialog(true)} variant="outline">
              Zgłoś brak produktu
            </Button>
          </div>
        ) : (
          <div className="space-y-3">{filteredProducts.map((product) => {
              const wishlistItem = getWishlistItem(product.id);
              
              return (
                <Card key={product.id} className="shadow-card hover:shadow-bubbly transition-shadow rounded-3xl md:rounded-lg border-gray-100 md:border-border">
                  <CardContent className="p-4 md:p-4 flex items-center gap-4">
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-2xl md:rounded-lg flex-shrink-0 shadow-inner md:shadow-none"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base md:font-semibold md:text-base text-gray-800 md:text-foreground mb-1 leading-tight">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {product.producers?.name}
                      </p>
                      <p className="text-lg font-black md:font-bold text-primary">
                        {product.price.toFixed(2)} zł
                      </p>
                    </div>
                    
                    <div className="flex-shrink-0">
                      {wishlistItem ? (
                        <div className="flex items-center gap-2 bg-gray-50 md:bg-transparent rounded-full md:rounded-none px-1 py-1 md:p-0 border border-gray-100 md:border-0 shadow-inner md:shadow-none">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="w-7 h-7 md:w-10 md:h-10 bg-white md:bg-background rounded-full md:rounded-md shadow-sm md:shadow-none border-0 md:border hover:scale-110 md:hover:scale-100"
                            onClick={() => handleUpdateQuantity(
                              wishlistItem.id,
                              product.id,
                              wishlistItem.quantity - 1
                            )}
                          >
                            <Minus className="h-3.5 w-3.5 md:h-4 md:w-4" />
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
                            className="text-center w-12 md:w-20 h-7 md:h-10 font-bold text-sm text-primary md:text-foreground border-0 md:border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="w-7 h-7 md:w-10 md:h-10 bg-white md:bg-background rounded-full md:rounded-md shadow-sm md:shadow-none border-0 md:border hover:scale-110 md:hover:scale-100"
                            onClick={() => handleUpdateQuantity(
                              wishlistItem.id,
                              product.id,
                              wishlistItem.quantity + 1
                            )}
                          >
                            <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          className="rounded-full md:rounded-2xl shadow-bubbly md:shadow-sm h-10 w-10 md:w-auto md:h-auto p-0 md:p-4 hover:scale-105" 
                          size="lg"
                          onClick={() => handleAddToWishlist(product.id)}
                        >
                          <Plus className="h-5 w-5 md:mr-2" />
                          <span className="hidden md:inline">Dodaj</span>
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
  ), [searchQuery, selectedCategory, filteredProducts, wishlist]);

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
            {productCatalog}
          </TabsContent>
          <TabsContent value="wishlist" className="mt-4">
            {wishlistCart}
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
          {productCatalog}
        </div>
        <div className="lg:col-span-1">
          {wishlistCart}
        </div>
      </div>
      <ProductRequestDialog
        open={showRequestDialog}
        onOpenChange={setShowRequestDialog}
      />
    </>
  );
}
