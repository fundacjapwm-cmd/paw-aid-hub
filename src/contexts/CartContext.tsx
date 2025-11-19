import { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

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