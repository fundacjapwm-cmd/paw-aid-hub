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
      // Get current session - must match what auth.uid() returns in RLS
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
      }
      
      // For RLS policy: if user is logged in, user_id must equal auth.uid()
      // If user is NOT logged in, both auth.uid() and user_id must be NULL
      const userId = session?.user?.id ?? null;
      
      console.log('Test checkout - session user:', session?.user?.id, 'userId:', userId);

      // Find organization IDs from cart items (need to look up animals)
      const animalIds = cart.filter(item => item.animalId).map(item => item.animalId);
      let organizationId: string | null = null;

      if (animalIds.length > 0) {
        const { data: animals } = await supabase
          .from('animals')
          .select('organization_id')
          .in('id', animalIds)
          .limit(1);
        
        if (animals && animals.length > 0) {
          organizationId = animals[0].organization_id;
        }
      }

      console.log('Organization ID found:', organizationId);

      // Find or create batch order for this organization
      let batchOrderId: string | null = null;

      if (organizationId) {
        // Check if there's an active collecting batch order
        const { data: activeBatch } = await supabase
          .from('organization_batch_orders')
          .select('id')
          .eq('organization_id', organizationId)
          .eq('status', 'collecting')
          .maybeSingle();

        if (activeBatch) {
          batchOrderId = activeBatch.id;
          console.log('Using existing batch order:', batchOrderId);
        } else {
          // Create new batch order
          const { data: newBatch, error: batchError } = await supabase
            .from('organization_batch_orders')
            .insert({
              organization_id: organizationId,
              status: 'collecting'
            })
            .select()
            .single();

          if (batchError) {
            console.error('Batch order creation error:', batchError);
          } else if (newBatch) {
            batchOrderId = newBatch.id;
            console.log('Created new batch order:', batchOrderId);
          }
        }
      }

      // Create order directly in database with completed status
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          total_amount: cartTotal,
          payment_status: 'completed',
          payment_method: 'test',
          status: 'confirmed',
          batch_order_id: batchOrderId,
        })
        .select()
        .single();

      if (orderError) {
        console.error('Order insert error:', orderError, 'userId was:', userId);
        throw orderError;
      }

      console.log('Order created with batch_order_id:', batchOrderId);

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
      const { data, error } = await supabase.functions.invoke('create-hotpay-order', {
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

      console.log('HotPay order created:', data);
      clearCart();

      // HotPay requires form POST - create and submit form
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.hotpayUrl;
      
      for (const [key, value] of Object.entries(data.hotpayParams)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      }
      
      document.body.appendChild(form);
      form.submit();

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
