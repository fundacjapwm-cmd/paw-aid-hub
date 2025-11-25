import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

const CART_STORAGE_KEY = 'pwm-cart';

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  maxQuantity?: number;
  animalId?: string;
  animalName?: string;
}

interface CartContextType {
  cart: CartItem[];
  cartTotal: number;
  cartCount: number;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number, silent?: boolean) => void;
  removeFromCart: (productId: string) => void;
  removeAllForAnimal: (animalId: string, animalName: string) => void;
  removeAllForOrganization: (organizationName: string) => void;
  clearCart: () => void;
  updateQuantity: (productId: string, quantity: number) => void;
  addAllForAnimal: (items: Omit<CartItem, 'quantity'>[], animalName: string) => void;
  completePurchase: () => Promise<{ success: boolean; orderId?: string }>;
  isAnimalFullyAdded: (animalId: string) => boolean;
  markAnimalAsAdded: (animalId: string) => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Load cart from localStorage
const loadCartFromStorage = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading cart from storage:', error);
  }
  return [];
};

// Save cart to localStorage
const saveCartToStorage = (cart: CartItem[]) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to storage:', error);
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>(() => loadCartFromStorage());
  const [addedAnimals, setAddedAnimals] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Load cart from database for logged-in users
  const loadCartFromDatabase = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_carts')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data && data.length > 0) {
        const dbCart: CartItem[] = data.map(item => ({
          productId: item.product_id,
          productName: item.product_name,
          price: Number(item.price),
          quantity: item.quantity,
          maxQuantity: item.max_quantity || undefined,
          animalId: item.animal_id || undefined,
          animalName: item.animal_name || undefined,
        }));

        // Merge local cart with database cart
        const localCart = loadCartFromStorage();
        const mergedCart = mergeCartsPreferDatabase(localCart, dbCart);
        
        setCart(mergedCart);
        saveCartToStorage(mergedCart);
        
        // Sync merged cart back to database if there were local items
        if (localCart.length > 0 && localCart.some(item => !dbCart.find(dbItem => 
          dbItem.productId === item.productId && dbItem.animalId === item.animalId
        ))) {
          await syncCartToDatabase(mergedCart, user.id);
        }
      } else {
        // No database cart, sync local cart to database
        const localCart = loadCartFromStorage();
        if (localCart.length > 0) {
          await syncCartToDatabase(localCart, user.id);
        }
      }
    } catch (error) {
      console.error('Error loading cart from database:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Merge two carts, preferring database quantities but including new local items
  const mergeCartsPreferDatabase = (localCart: CartItem[], dbCart: CartItem[]): CartItem[] => {
    const merged = [...dbCart];
    
    for (const localItem of localCart) {
      const existsInDb = dbCart.find(dbItem => 
        dbItem.productId === localItem.productId && 
        dbItem.animalId === localItem.animalId
      );
      
      if (!existsInDb) {
        merged.push(localItem);
      }
    }
    
    return merged;
  };

  // Sync cart to database
  const syncCartToDatabase = async (cartItems: CartItem[], userId: string) => {
    if (isSyncing) return;
    setIsSyncing(true);
    
    try {
      // Delete all existing cart items for user
      await supabase
        .from('user_carts')
        .delete()
        .eq('user_id', userId);

      // Insert new cart items
      if (cartItems.length > 0) {
        const dbItems = cartItems.map(item => ({
          user_id: userId,
          product_id: item.productId,
          product_name: item.productName,
          price: item.price,
          quantity: item.quantity,
          max_quantity: item.maxQuantity || null,
          animal_id: item.animalId || null,
          animal_name: item.animalName || null,
        }));

        const { error } = await supabase
          .from('user_carts')
          .insert(dbItems);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error syncing cart to database:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Load cart from database when user logs in
  useEffect(() => {
    if (user) {
      loadCartFromDatabase();
    }
  }, [user, loadCartFromDatabase]);

  // Save cart to localStorage and database whenever it changes
  useEffect(() => {
    saveCartToStorage(cart);
    
    // Sync to database for logged-in users
    if (user && !isLoading) {
      syncCartToDatabase(cart, user.id);
    }
  }, [cart, user, isLoading]);

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number = 1, silent: boolean = false) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.productId === item.productId);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        const maxQty = item.maxQuantity || Infinity;
        
        if (newQuantity > maxQty) {
          if (!silent) {
            toast({
              title: "Limit osiągnięty",
              description: `Maksymalna ilość dla tego produktu to ${maxQty}`,
              variant: "destructive",
            });
          }
          return prevCart;
        }
        
        if (!silent) {
          toast({
            title: "Zaktualizowano koszyk",
            description: `Zwiększono ilość: ${item.productName}`,
          });
        }
        return prevCart.map((cartItem) =>
          cartItem.productId === item.productId
            ? { ...cartItem, quantity: newQuantity }
            : cartItem
        );
      } else {
        const maxQty = item.maxQuantity || Infinity;
        if (quantity > maxQty) {
          if (!silent) {
            toast({
              title: "Limit osiągnięty",
              description: `Maksymalna ilość dla tego produktu to ${maxQty}`,
              variant: "destructive",
            });
          }
          return prevCart;
        }
        
        if (!silent) {
          toast({
            title: "Dodano do koszyka",
            description: `${item.productName} - ${item.price.toFixed(2)} zł`,
          });
        }
        return [...prevCart, { ...item, quantity }];
      }
    });
  };

  const addAllForAnimal = (items: Omit<CartItem, 'quantity'>[], animalName: string) => {
    if (items.length === 0) {
      toast({
        title: "Brak produktów",
        description: `Wszystkie produkty dla ${animalName} zostały już kupione`,
        variant: "destructive",
      });
      return;
    }
    
    items.forEach(item => addToCart(item, item.maxQuantity || 1, true));
  };

  const isAnimalFullyAdded = (animalId: string) => {
    return addedAnimals.has(animalId);
  };

  const markAnimalAsAdded = (animalId: string) => {
    setAddedAnimals(prev => new Set([...prev, animalId]));
  };

  const completePurchase = async (): Promise<{ success: boolean; orderId?: string }> => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany aby dokonać zakupu",
          variant: "destructive",
        });
        return { success: false };
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: currentUser.id,
          total_amount: cartTotal,
          status: 'completed',
          payment_status: 'paid'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        animal_id: item.animalId,
        quantity: item.quantity,
        unit_price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Zakup zakończony!",
        description: "Dziękujemy za wsparcie zwierząt ❤️",
      });

      setCart([]);
      
      // Clear database cart
      if (currentUser) {
        await supabase
          .from('user_carts')
          .delete()
          .eq('user_id', currentUser.id);
      }
      
      return { success: true, orderId: order.id };
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Błąd zakupu",
        description: "Nie udało się dokończyć zakupu. Spróbuj ponownie.",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
    toast({
      title: "Usunięto z koszyka",
      description: "Produkt został usunięty",
      variant: "destructive",
    });
  };

  const removeAllForAnimal = (animalId: string, animalName: string) => {
    const itemsToRemove = cart.filter(item => item.animalId === animalId);
    if (itemsToRemove.length === 0) return;
    
    const totalQuantity = itemsToRemove.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = itemsToRemove.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    setCart((prevCart) => prevCart.filter((item) => item.animalId !== animalId));
    setAddedAnimals(prev => {
      const newSet = new Set(prev);
      newSet.delete(animalId);
      return newSet;
    });
    
    toast({
      title: `Usunięto produkty dla: ${animalName}`,
      description: `Usunięto ${totalQuantity} produktów (${totalPrice.toFixed(2)} zł) z koszyka`,
      variant: "destructive",
    });
  };

  const removeAllForOrganization = (organizationName: string) => {
    const itemsToRemove = cart.filter(item => !item.animalId && item.animalName?.includes(organizationName));
    if (itemsToRemove.length === 0) return;
    
    const totalQuantity = itemsToRemove.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = itemsToRemove.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    setCart((prevCart) => prevCart.filter((item) => !(item.animalId === undefined && item.animalName?.includes(organizationName))));
    
    toast({
      title: `Usunięto produkty dla: ${organizationName}`,
      description: `Usunięto ${totalQuantity} produktów (${totalPrice.toFixed(2)} zł) z koszyka`,
      variant: "destructive",
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.productId === productId) {
          const maxQty = item.maxQuantity;
          if (maxQty && quantity > maxQty) {
            toast({
              title: "Limit osiągnięty",
              description: `Maksymalna ilość dla tego produktu to ${maxQty}`,
              variant: "destructive",
            });
            return { ...item, quantity: maxQty };
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    toast({
      title: "Koszyk wyczyszczony",
      description: "Wszystkie produkty zostały usunięte",
    });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartTotal,
        cartCount,
        addToCart,
        removeFromCart,
        removeAllForAnimal,
        removeAllForOrganization,
        clearCart,
        updateQuantity,
        addAllForAnimal,
        completePurchase,
        isAnimalFullyAdded,
        markAnimalAsAdded,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
