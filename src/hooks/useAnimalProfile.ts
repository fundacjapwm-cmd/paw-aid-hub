import { useState, useEffect, useCallback, useMemo } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAnimalsWithWishlists } from "@/hooks/useAnimalsWithWishlists";
import { toast } from "sonner";

export function useAnimalProfile(id: string | undefined) {
  const { addToCart, addAllForAnimal, cart: globalCart, removeFromCart, removeAllForAnimal } = useCart();
  const { animals, loading } = useAnimalsWithWishlists();
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const animal = animals.find(a => a.id === id);

  // Get other animals from the same organization
  const otherAnimalsFromOrg = useMemo(() => {
    if (!animal || !animal.organization_id) return [];
    
    return animals
      .filter(a => a.organization_id === animal.organization_id && a.id !== id)
      .map(a => ({
        id: a.id,
        name: a.name,
        species: a.species,
        age: a.age,
        birth_date: a.birth_date,
        image: a.image,
        organization: a.organization,
        organizationSlug: a.organizationSlug,
        wishlist: a.wishlist,
      }));
  }, [animals, animal, id]);

  // Initialize quantities when animal loads
  useEffect(() => {
    if (animal?.wishlist) {
      const initialQuantities = animal.wishlist.reduce((acc: Record<string, number>, item: any) => {
        if (!item.bought) {
          acc[item.product_id] = 1;
        }
        return acc;
      }, {});
      setQuantities(initialQuantities);
    }
  }, [animal?.wishlist]);

  // Build all images array (main image + gallery)
  const allImages = animal ? [
    { id: 'main', image_url: animal.image || '/placeholder.svg' },
    ...(animal.gallery || [])
  ] : [];

  const handlePrevImage = useCallback(() => {
    setLightboxIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  }, [allImages.length]);

  const handleNextImage = useCallback(() => {
    setLightboxIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  }, [allImages.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'ArrowRight') handleNextImage();
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, handlePrevImage, handleNextImage]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleQuantityChange = (productId: string, change: number) => {
    setQuantities((prev) => {
      const currentQty = prev[productId] || 1;
      const newQty = Math.max(1, currentQty + change);
      return { ...prev, [productId]: newQty };
    });
  };

  const handleSetQuantity = (productId: string, qty: number) => {
    setQuantities(prev => ({ ...prev, [productId]: qty }));
  };

  const handleAddToCart = (item: any) => {
    if (!item.product_id) return;
    const quantity = quantities[item.product_id] || 1;
    const neededQuantity = item.quantity || 1;
    addToCart(
      {
        productId: item.product_id,
        productName: item.name,
        price: item.price,
        netPrice: item.netPrice,
        animalId: id,
        animalName: animal?.name || '',
        maxQuantity: neededQuantity,
      },
      quantity
    );
  };

  const handleAddAllToCart = () => {
    if (!animal) return;
    const availableItems = animal.wishlist.filter((item: any) => !item.bought);
    const items = availableItems.map((item: any) => ({
      productId: item.product_id,
      productName: item.name,
      price: item.price,
      netPrice: item.netPrice,
      animalId: id,
      animalName: animal.name,
      maxQuantity: item.quantity || 1,
    }));
    
    const totalCount = availableItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
    const totalPrice = availableItems.reduce((sum: number, item: any) => sum + (item.price * (item.quantity || 1)), 0);
    
    addAllForAnimal(items, animal.name);
    
    toast.success(`Dodano do koszyka ${totalCount} produktów (${totalPrice.toFixed(2)} zł) dla: ${animal.name}`);
  };

  const handleRemoveAllFromCart = () => {
    if (id && animal) {
      removeAllForAnimal(id, animal.name);
    }
  };

  const isInCart = (itemId: string) => {
    return globalCart.some(cartItem => cartItem.productId === itemId);
  };

  const getCartQuantity = (productId: string) => {
    const cartItem = globalCart.find(item => item.productId === productId);
    return cartItem?.quantity || 0;
  };

  const cartTotalForAnimal = globalCart
    .filter(item => item.animalId === id)
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const totalWishlistCost = animal?.wishlist
    .filter((item: any) => !item.bought)
    .reduce((sum: number, item: any) => {
      return sum + (Number(item.price) * (item.quantity || 1));
    }, 0) || 0;

  const allItemsInCart = animal?.wishlist
    .filter((item: any) => !item.bought)
    .every((item: any) => {
      const neededQuantity = item.quantity || 1;
      return getCartQuantity(item.product_id) >= neededQuantity;
    }) && animal?.wishlist.some((item: any) => !item.bought);

  return {
    animal,
    loading,
    allImages,
    quantities,
    lightboxOpen,
    lightboxIndex,
    cartTotalForAnimal,
    totalWishlistCost,
    allItemsInCart,
    setLightboxOpen,
    openLightbox,
    handlePrevImage,
    handleNextImage,
    handleQuantityChange,
    handleSetQuantity,
    handleAddToCart,
    handleAddAllToCart,
    handleRemoveAllFromCart,
    isInCart,
    getCartQuantity,
    removeFromCart,
    otherAnimalsFromOrg,
  };
}
