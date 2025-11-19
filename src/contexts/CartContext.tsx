import { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  animalId?: string;
  animalName?: string;
}

interface CartContextType {
  cart: CartItem[];
  cartTotal: number;
  cartCount: number;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  updateQuantity: (productId: string, quantity: number) => void;
  addAllForAnimal: (items: Omit<CartItem, 'quantity'>[], animalName: string) => void;
  completePurchase: () => Promise<{ success: boolean; orderId?: string }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.productId === item.productId);
      
      if (existingItem) {
        toast({
          title: "Zaktualizowano koszyk",
          description: `Zwiększono ilość: ${item.productName}`,
        });
        return prevCart.map((cartItem) =>
          cartItem.productId === item.productId
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        toast({
          title: "Dodano do koszyka",
          description: `${item.productName} - ${item.price.toFixed(2)} zł`,
        });
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
    
    items.forEach(item => addToCart(item, 1));
    toast({
      title: "Dodano do koszyka",
      description: `${items.length} ${items.length === 1 ? 'produkt' : items.length < 5 ? 'produkty' : 'produktów'} dla ${animalName}`,
    });
  };

  const completePurchase = async (): Promise<{ success: boolean; orderId?: string }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany aby dokonać zakupu",
          variant: "destructive",
        });
        return { success: false };
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: cartTotal,
          status: 'completed',
          payment_status: 'paid'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
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

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
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
        clearCart,
        updateQuantity,
        addAllForAnimal,
        completePurchase,
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