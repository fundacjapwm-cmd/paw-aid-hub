import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";

export interface Organization {
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
}

export function useOrganizationProfile(slug: string | undefined) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [animals, setAnimals] = useState<any[]>([]);
  const [orgWishlist, setOrgWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const { addToCart, cart, removeFromCart, removeAllForOrganization } = useCart();

  useEffect(() => {
    if (slug) {
      fetchOrganization();
    }
  }, [slug]);

  const fetchOrganization = async () => {
    try {
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
            image_url
          )
        `)
        .eq("organization_id", org.id)
        .order("priority", { ascending: false });

      if (wishlistError) throw wishlistError;
      setOrgWishlist(wishlistData || []);
      
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

  const handleSetQuantity = (productId: string, qty: number) => {
    setSelectedQuantities(prev => ({ ...prev, [productId]: qty }));
  };

  const handleAddProduct = (product: any) => {
    const productId = product.product_id || product.id;
    const productName = product.name || product.products?.name;
    const price = product.price || product.products?.price;
    const quantity = selectedQuantities[productId] || 1;
    
    addToCart({
      productId,
      productName,
      price,
      animalId: undefined,
      animalName: `Organizacja: ${organization?.name}`,
    }, quantity);
  };

  const handleRemoveAllFromCart = () => {
    if (organization) {
      removeAllForOrganization(organization.name);
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

  return {
    organization,
    animals,
    orgWishlist,
    loading,
    selectedQuantities,
    cartTotalForOrg,
    handleQuantityChange,
    handleSetQuantity,
    handleAddProduct,
    handleRemoveAllFromCart,
    isInCart,
    getCartQuantity,
    removeFromCart,
  };
}
