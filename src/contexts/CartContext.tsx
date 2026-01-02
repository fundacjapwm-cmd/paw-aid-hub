import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

const CART_STORAGE_KEY = 'pwm-cart';
const CART_TIMESTAMP_KEY = 'pwm-cart-timestamp';
const CART_EXPIRY_HOURS = 24;

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
  removeFromCart: (productId: string, animalId?: string) => void;
  removeAllForAnimal: (animalId: string, animalName: string) => void;
  removeAllForOrganization: (organizationName: string) => void;
  clearCart: () => void;
  updateQuantity: (productId: string, quantity: number, animalId?: string) => void;
  addAllForAnimal: (items: Omit<CartItem, 'quantity'>[], animalName: string) => void;
  completePurchase: () => Promise<{ success: boolean; orderId?: string }>;
  isAnimalFullyAdded: (animalId: string) => boolean;
  markAnimalAsAdded: (animalId: string) => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Check if cart has expired (older than 24 hours)
const isCartExpired = (): boolean => {
  try {
    const timestamp = localStorage.getItem(CART_TIMESTAMP_KEY);
    if (!timestamp) return false;
    
    const cartTime = new Date(timestamp).getTime();
    const now = Date.now();
    const hoursElapsed = (now - cartTime) / (1000 * 60 * 60);
    
    return hoursElapsed >= CART_EXPIRY_HOURS;
  } catch {
    return false;
  }
};

// Load cart from localStorage (with expiry check)
const loadCartFromStorage = (): CartItem[] => {
  try {
    // Check if cart expired
    if (isCartExpired()) {
      console.log('Cart expired after 24h, clearing...');
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(CART_TIMESTAMP_KEY);
      return [];
    }
    
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading cart from storage:', error);
  }
  return [];
};

// Save cart to localStorage with timestamp
const saveCartToStorage = (cart: CartItem[]) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    // Only set timestamp if cart has items
    if (cart.length > 0) {
      // Update timestamp only if it doesn't exist (first item added)
      if (!localStorage.getItem(CART_TIMESTAMP_KEY)) {
        localStorage.setItem(CART_TIMESTAMP_KEY, new Date().toISOString());
      }
    } else {
      // Clear timestamp when cart is empty
      localStorage.removeItem(CART_TIMESTAMP_KEY);
    }
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
  // Database is the source of truth - local storage is only for guests
  // Also checks for 24h expiry
  const loadCartFromDatabase = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Calculate 24h ago
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() - CART_EXPIRY_HOURS);
      const expiryTimestamp = expiryDate.toISOString();

      const { data, error } = await supabase
        .from('user_carts')
        .select('*')
        .eq('user_id', user.id)
        .gte('updated_at', expiryTimestamp);

      if (error) throw error;

      if (data && data.length > 0) {
        // Database is the source of truth for logged-in users
        const dbCart: CartItem[] = data.map(item => ({
          productId: item.product_id,
          productName: item.product_name,
          price: Number(item.price),
          quantity: item.quantity,
          maxQuantity: item.max_quantity || undefined,
          animalId: item.animal_id || undefined,
          animalName: item.animal_name || undefined,
        }));

        setCart(dbCart);
        saveCartToStorage(dbCart);
      } else {
        // No database cart - check if there's a local cart to sync (first login scenario)
        const localCart = loadCartFromStorage();
        if (localCart.length > 0) {
          // Sync local cart to database, then use it
          await syncCartToDatabase(localCart, user.id);
          setCart(localCart);
        } else {
          // Empty cart - make sure state reflects that
          setCart([]);
          saveCartToStorage([]);
        }
      }
    } catch (error) {
      console.error('Error loading cart from database:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Removed mergeCartsPreferDatabase - database is now source of truth

  // Sync cart to database
  const syncCartToDatabase = async (cartItems: CartItem[], userId: string) => {
    if (isSyncing) return;
    setIsSyncing(true);
    
    try {
      // Delete all existing cart items for user
      const { error: deleteError } = await supabase
        .from('user_carts')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('Error deleting cart items:', deleteError);
        // Continue anyway - maybe cart was empty
      }

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

        if (error) {
          console.error('Error inserting cart items:', error);
        }
      }
    } catch (error) {
      // Network errors - don't throw, just log
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
    
    // Sync to database for logged-in users (but skip if we just cleared the cart)
    // Only sync if cart has items OR if we're not in the middle of a sync
    if (user && !isLoading && !isSyncing) {
      syncCartToDatabase(cart, user.id);
    }
  }, [cart, user, isLoading, isSyncing]);

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number = 1, silent: boolean = false) => {
    setCart((prevCart) => {
      // Find by productId AND animalId to allow same product for different animals
      const existingItem = prevCart.find((cartItem) => 
        cartItem.productId === item.productId && cartItem.animalId === item.animalId
      );
      
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
          cartItem.productId === item.productId && cartItem.animalId === item.animalId
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
    
    setCart((prevCart) => {
      const newCart = [...prevCart];
      
      items.forEach(item => {
        const targetQuantity = item.maxQuantity || 1;
        const existingIndex = newCart.findIndex(cartItem => cartItem.productId === item.productId);
        
        if (existingIndex >= 0) {
          // Update existing item to max quantity
          newCart[existingIndex] = { ...newCart[existingIndex], quantity: targetQuantity };
        } else {
          // Add new item with full quantity
          newCart.push({ ...item, quantity: targetQuantity });
        }
      });
      
      return newCart;
    });
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

  const removeFromCart = (productId: string, animalId?: string) => {
    setCart((prevCart) => prevCart.filter((item) => 
      !(item.productId === productId && item.animalId === animalId)
    ));
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

  const updateQuantity = (productId: string, quantity: number, animalId?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, animalId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.productId === productId && item.animalId === animalId) {
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

  const clearCart = async () => {
    // Clear database FIRST for logged-in users (before state change triggers sync)
    if (user) {
      try {
        const { error } = await supabase
          .from('user_carts')
          .delete()
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Error clearing cart from database:', error);
        } else {
          console.log('Cart cleared from database for user:', user.id);
        }
      } catch (error) {
        console.error('Error clearing cart from database:', error);
      }
    }
    
    // Then clear local state and storage
    setCart([]);
    saveCartToStorage([]);
    
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
