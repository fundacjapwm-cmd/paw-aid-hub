import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AnimalCard from "@/components/AnimalCard";
import WishlistProgressBar from "@/components/WishlistProgressBar";
import { Card } from "@/components/ui/card";
import { MapPin, Heart, Phone, Mail, ShieldCheck, PawPrint, Calendar, Bone, ShoppingCart, Plus, Minus, Check, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import OrganizationProfileSkeleton from "@/components/OrganizationProfileSkeleton";

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  description?: string;
  city?: string;
  province?: string;
  address?: string;
  postal_code?: string;
  website?: string;
  contact_email: string;
  contact_phone?: string;
  nip?: string;
  regon?: string;
}

export default function OrganizationPublicProfile() {
  const { slug } = useParams<{ slug: string }>();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [animals, setAnimals] = useState<any[]>([]);
  const [orgWishlist, setOrgWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const { addToCart, cart, removeFromCart } = useCart();

  useEffect(() => {
    if (slug) {
      fetchOrganization();
    }
  }, [slug]);

  const fetchOrganization = async () => {
    try {
      // Fetch organization
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .select("*")
        .eq("slug", slug)
        .eq("active", true)
        .maybeSingle();

      if (orgError) throw orgError;
      if (!org) {
        setLoading(false);
        return;
      }

      setOrganization(org);

      // Fetch organization's animals
      const { data: animalsData, error: animalsError } = await supabase
        .from("animals")
        .select(`
          *,
          animal_wishlists (
            id,
            product_id,
            quantity,
            products (
              id,
              name,
              price,
              image_url
            )
          )
        `)
        .eq("organization_id", org.id)
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (animalsError) throw animalsError;

      setAnimals(animalsData || []);

      // Fetch organization's wishlist
      const { data: wishlistData, error: wishlistError } = await supabase
        .from("organization_wishlists")
        .select(`
          id,
          product_id,
          quantity,
          priority,
          products (
            id,
            name,
            price,
            image_url,
            unit,
            weight_volume
          )
        `)
        .eq("organization_id", org.id)
        .order("priority", { ascending: false });

      if (wishlistError) throw wishlistError;

      setOrgWishlist(wishlistData || []);
      
      // Initialize quantities for each product
      const initialQuantities = (wishlistData || []).reduce((acc: any, item: any) => {
        acc[item.product_id] = 1;
        return acc;
      }, {});
      setSelectedQuantities(initialQuantities);
    } catch (error) {
      console.error("Error fetching organization:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId: string, change: number) => {
    setSelectedQuantities((prev) => {
      const currentQty = prev[productId] || 1;
      const newQty = Math.max(1, currentQty + change);
      return { ...prev, [productId]: newQty };
    });
  };

  const handleAddProduct = (item: any) => {
    const quantity = selectedQuantities[item.product_id] || 1;
    addToCart({
      productId: item.product_id,
      productName: item.products.name,
      price: item.products.price,
      animalId: undefined,
      animalName: `Organizacja: ${organization?.name}`,
    }, quantity);
  };

  const handleAddAllToCart = () => {
    let addedCount = 0;
    orgWishlist.forEach((item: any) => {
      if (item.products) {
        addToCart({
          productId: item.product_id,
          productName: item.products.name,
          price: item.products.price,
          animalId: undefined,
          animalName: `Organizacja: ${organization?.name}`,
        }, item.quantity || 1);
        addedCount++;
      }
    });
    
    if (addedCount > 0) {
      toast.success(`Dodano ${addedCount} produktów do koszyka`);
    }
  };

  const isInCart = (productId: string) => {
    return cart.some(item => item.productId === productId);
  };

  const getCartQuantity = (productId: string) => {
    const cartItem = cart.find(item => item.productId === productId);
    return cartItem?.quantity || 0;
  };

  const cartTotalForOrg = cart
    .filter(item => !item.animalId && item.animalName?.includes(organization?.name || ''))
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) {
    return <OrganizationProfileSkeleton />;
  }

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Organizacja nie znaleziona</h2>
          <p className="text-muted-foreground">Sprawdź adres URL i spróbuj ponownie</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9E5] via-white to-[#FFF0F5] relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />

      {/* Hero Section - Większy i dwukolumnowy */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-white/60 backdrop-blur-md border border-white/50 shadow-bubbly rounded-[3rem] p-8 md:p-12 overflow-hidden">
            {/* Dekoracyjne ikony w tle */}
            <Heart className="absolute top-8 left-8 h-32 w-32 text-primary/5 -rotate-12" />
            <Bone className="absolute bottom-8 right-8 h-40 w-40 text-accent/5 rotate-12" />
            <PawPrint className="absolute top-1/2 right-12 h-20 w-20 text-secondary/5 -rotate-6" />

            {/* Grid Layout - 2 kolumny na desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 relative z-10">
              {/* Lewa kolumna - Metryczka */}
              <div className="space-y-6">
                {/* Logo i nazwa */}
                <div className="flex items-start gap-6">
                  <div className="shrink-0">
                    <div className="h-32 w-32 rounded-3xl border-4 border-white shadow-lg overflow-hidden bg-white">
                      {organization.logo_url ? (
                        <img 
                          src={organization.logo_url} 
                          alt={organization.name}
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                          <Heart className="h-16 w-16 text-primary" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                        {organization.name}
                      </h1>
                      <span title="Zweryfikowana Organizacja">
                        <ShieldCheck className="h-7 w-7 text-primary shrink-0" />
                      </span>
                    </div>
                    {organization.description && (
                      <p className="text-muted-foreground leading-relaxed">
                        {organization.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Metryczka */}
                <Card className="bg-gradient-to-br from-white/80 to-white/60 border-white/50 shadow-md">
                  <div className="p-6 space-y-4">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Dane organizacji
                    </h3>
                    
                    <div className="space-y-3 text-sm">
                      {organization.city && (
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <p className="font-medium">Lokalizacja</p>
                            <p className="text-muted-foreground">
                              {organization.city}
                              {organization.province && `, ${organization.province}`}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-start gap-3">
                        <PawPrint className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium">Podopieczni</p>
                          <p className="text-muted-foreground">{animals.length} zwierzaków</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium">Z nami od</p>
                          <p className="text-muted-foreground">2024</p>
                        </div>
                      </div>

                      {organization.contact_phone && (
                        <div className="flex items-start gap-3">
                          <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <p className="font-medium">Telefon</p>
                            <a 
                              href={`tel:${organization.contact_phone}`}
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              {organization.contact_phone}
                            </a>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium">Email</p>
                          <a 
                            href={`mailto:${organization.contact_email}`}
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            {organization.contact_email}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Prawa kolumna - Wishlistę organizacji */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                    <ShoppingCart className="h-6 w-6 text-primary" />
                    Potrzeby organizacji
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Ogólne zapotrzebowanie dla wszystkich podopiecznych
                  </p>
                </div>

                {orgWishlist.length === 0 ? (
                  <Card className="bg-white/60 border-white/50 shadow-md">
                    <div className="p-12 text-center">
                      <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">
                        Organizacja nie ma jeszcze ogólnej wishlisty
                      </p>
                    </div>
                  </Card>
                ) : (
                  <>
                    <WishlistProgressBar 
                      wishlist={orgWishlist.map((item: any) => ({
                        id: item.id,
                        name: item.products?.name || '',
                        price: item.products?.price || 0,
                        product_id: item.product_id,
                        quantity: item.quantity,
                        bought: false,
                      }))} 
                    />
                    
                    <Card className="bg-white/80 border-white/50 shadow-md">
                      <div className="p-6 flex flex-col h-[600px]">
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                          {orgWishlist.map((item: any) => {
                            const quantity = selectedQuantities[item.product_id] || 1;
                            const itemInCart = isInCart(item.product_id);
                            const cartQuantity = getCartQuantity(item.product_id);

                            return (
                              <div 
                                key={item.id}
                                className="flex gap-3 p-3 bg-white/60 rounded-xl border border-white/50 hover:shadow-md transition-shadow"
                              >
                                {/* Image */}
                                <div className="shrink-0">
                                  {item.products?.image_url ? (
                                    <img 
                                      src={item.products.image_url}
                                      alt={item.products.name}
                                      className="w-20 h-20 rounded-lg object-cover"
                                    />
                                  ) : (
                                    <div className="w-20 h-20 rounded-lg bg-gray-50 flex items-center justify-center">
                                      <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                  <div>
                                    <p className="font-semibold text-sm line-clamp-2">
                                      {item.products?.name}
                                    </p>
                                    <p className="text-primary font-bold text-base mt-1">
                                      {item.products?.price?.toFixed(2)} zł
                                    </p>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Potrzeba: {item.quantity} {item.products?.unit || 'szt'}
                                  </p>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col justify-end items-end shrink-0 pl-2">
                                  <div className="flex items-center gap-2">
                                    {/* Quantity Counter */}
                                    <div className="flex items-center bg-gray-50 rounded-lg h-9 p-1 shadow-inner">
                                      <button 
                                        className="w-6 h-full flex items-center justify-center text-gray-500 hover:text-primary hover:bg-white rounded-md transition-all disabled:opacity-30"
                                        onClick={() => handleQuantityChange(item.product_id, -1)}
                                        disabled={quantity <= 1}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </button>
                                      <span className="w-6 text-center text-sm font-bold tabular-nums">
                                        {quantity}
                                      </span>
                                      <button 
                                        className="w-6 h-full flex items-center justify-center text-gray-500 hover:text-primary hover:bg-white rounded-md transition-all"
                                        onClick={() => handleQuantityChange(item.product_id, 1)}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </button>
                                    </div>

                                    {/* Remove Button */}
                                    {itemInCart && (
                                      <Button
                                        size="icon"
                                        className="h-9 w-9 rounded-xl bg-destructive/10 hover:bg-destructive hover:text-destructive-foreground transition-all"
                                        onClick={() => removeFromCart(item.product_id)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    )}

                                    {/* Add Button */}
                                    <div className="relative">
                                      <Button 
                                        size="icon" 
                                        className={`h-9 w-9 rounded-xl shadow-sm hover:scale-105 transition-all ${
                                          itemInCart 
                                            ? 'bg-green-500 hover:bg-green-600' 
                                            : 'bg-primary hover:bg-primary/90'
                                        }`}
                                        onClick={() => handleAddProduct(item)}
                                        disabled={itemInCart}
                                      >
                                        {itemInCart ? (
                                          <Check className="h-4 w-4" />
                                        ) : (
                                          <ShoppingCart className="h-4 w-4" />
                                        )}
                                      </Button>
                                      {cartQuantity > 0 && (
                                        <Badge 
                                          className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white border-2 border-background"
                                        >
                                          {cartQuantity}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Footer */}
                        <div className="mt-4 pt-4 border-t space-y-3">
                          {cartTotalForOrg > 0 && (
                            <div className="flex items-center justify-between pb-2 border-b border-border/50">
                              <span className="text-sm text-muted-foreground">
                                Łącznie w koszyku:
                              </span>
                              <span className="text-lg font-bold text-foreground">
                                {cartTotalForOrg.toFixed(2)} zł
                              </span>
                            </div>
                          )}
                          
                          <Button
                            onClick={handleAddAllToCart}
                            className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity rounded-xl font-semibold"
                            size="lg"
                          >
                            <ShoppingCart className="h-5 w-5 mr-2" />
                            Dodaj wszystko! ({orgWishlist.reduce((sum: number, item: any) => 
                              sum + ((item.quantity || 1) * (item.products?.price || 0)), 0
                            ).toFixed(2)} zł)
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animals Section */}
      <div id="animals" className="container mx-auto px-4 pb-16 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-2">
            Nasi Podopieczni
          </h2>
          <p className="text-lg text-muted-foreground">
            Każdy z nich czeka na Twoją pomoc
          </p>
        </div>
        
        {animals.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/60 backdrop-blur-md border border-white/50 shadow-bubbly rounded-[3rem] p-12 text-center">
              <Heart className="h-20 w-20 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-xl text-muted-foreground">
                Ta organizacja nie ma jeszcze żadnych podopiecznych
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {animals.map((animal) => (
              <div 
                key={animal.id}
                className="hover:-translate-y-2 transition-transform duration-300"
              >
                <AnimalCard
                  animal={{
                    id: animal.id,
                    name: animal.name,
                    species: animal.species,
                    age: animal.age?.toString() || 'Nieznany',
                    location: organization.city || 'Polska',
                    organization: organization.name,
                    organizationSlug: organization.slug,
                    description: animal.description || '',
                    image: animal.image_url || '/placeholder.svg',
                    wishlist: (animal.animal_wishlists || []).map((w: any) => ({
                      id: w.id,
                      name: w.products?.name || '',
                      price: w.products?.price || 0,
                      product_id: w.product_id,
                      quantity: w.quantity,
                      bought: false,
                      image_url: w.products?.image_url,
                    })),
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}