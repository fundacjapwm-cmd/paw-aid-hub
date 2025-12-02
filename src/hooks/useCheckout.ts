import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { checkoutSchema } from '@/lib/validations/checkout';
import { z } from 'zod';

export function useCheckout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cartMinimized, setCartMinimized] = useState(false);
  const [customerName, setCustomerName] = useState(profile?.display_name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptDataProcessing, setAcceptDataProcessing] = useState(false);
  const [newsletter, setNewsletter] = useState(false);

  const allConsentsChecked = acceptDataProcessing && acceptTerms && acceptPrivacy && newsletter;

  const handleSelectAll = (checked: boolean) => {
    setAcceptDataProcessing(checked);
    setAcceptTerms(checked);
    setAcceptPrivacy(checked);
    setNewsletter(checked);
  };

  const handleTestCheckout = async () => {
    if (cart.length === 0) {
      toast({
        title: "Pusty koszyk",
        description: "Dodaj produkty do koszyka przed płatnością",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create order directly in database with completed status
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          total_amount: cartTotal,
          payment_status: 'completed',
          payment_method: 'test',
          status: 'completed',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        product_id: item.productId,
        animal_id: item.animalId || null,
        quantity: item.quantity,
        unit_price: item.price,
        fulfillment_status: 'pending',
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      clearCart();
      
      toast({
        title: "Test: Płatność zakończona",
        description: "Zamówienie testowe utworzone pomyślnie",
      });

      // Redirect to success page with order ID
      window.location.href = `/payment-success?extOrderId=${orderData.id}`;

    } catch (error: any) {
      console.error('Test checkout error:', error);
      toast({
        title: "Błąd testowej płatności",
        description: error.message || "Nie udało się utworzyć zamówienia testowego",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast({
        title: "Pusty koszyk",
        description: "Dodaj produkty do koszyka przed płatnością",
        variant: "destructive",
      });
      return;
    }

    try {
      checkoutSchema.parse({
        customerName,
        customerEmail,
        password: password || '',
        acceptTerms,
        acceptPrivacy,
        acceptDataProcessing,
        newsletter,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Błąd walidacji",
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-payu-order', {
        body: {
          items: cart,
          customerEmail,
          customerName,
          totalAmount: cartTotal,
          password: password || undefined,
          newsletter,
          isGuest: !user,
        },
      });

      if (error) throw error;

      console.log('PayU order created:', data);
      clearCart();
      window.location.href = data.redirectUri;

    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Błąd płatności",
        description: error.message || "Nie udało się zainicjować płatności",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    cart,
    cartTotal,
    user,
    loading,
    cartMinimized,
    setCartMinimized,
    customerName,
    setCustomerName,
    customerEmail,
    setCustomerEmail,
    password,
    setPassword,
    acceptTerms,
    setAcceptTerms,
    acceptPrivacy,
    setAcceptPrivacy,
    acceptDataProcessing,
    setAcceptDataProcessing,
    newsletter,
    setNewsletter,
    allConsentsChecked,
    handleSelectAll,
    handleCheckout,
    handleTestCheckout,
  };
}
