import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  animalId?: string;
  animalName?: string;
}

interface CheckoutRequest {
  items: OrderItem[];
  customerEmail: string;
  customerName: string;
  totalAmount: number;
  password?: string;
  newsletter?: boolean;
  isGuest?: boolean;
}

// HotPay API with hash validation
// HASH = sha256(HASLO + ";" + KWOTA + ";" + NAZWA_USLUGI + ";" + ADRES_WWW + ";" + ID_ZAMOWIENIA + ";" + SEKRET)

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // HotPay credentials
    const hotpaySekret = Deno.env.get('HOTPAY_SEKRET');
    const hotpayHaslo = Deno.env.get('HOTPAY_HASLO');

    if (!hotpaySekret || !hotpayHaslo) {
      console.error('HotPay credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Payment gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try to get authenticated user (optional for guest checkout)
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    const { 
      items, 
      customerEmail, 
      customerName, 
      totalAmount,
      password,
      newsletter,
      isGuest
    }: CheckoutRequest = await req.json();

    console.log('Creating HotPay order for:', isGuest ? 'guest' : 'user', customerEmail);

    // If guest checkout with password, create account
    if (isGuest && password) {
      console.log('Creating account for guest:', customerEmail);
      
      const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
        email: customerEmail,
        password,
        email_confirm: true,
        user_metadata: {
          display_name: customerName,
        }
      });

      if (signUpError) {
        console.error('Account creation error:', signUpError);
        // Continue with guest checkout if account creation fails
      } else {
        userId = signUpData.user.id;
        console.log('Account created successfully:', userId);
      }
    }

    // Create order in database with customer details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total_amount: totalAmount,
        status: 'pending',
        payment_status: 'pending',
        payment_method: 'hotpay',
        customer_name: customerName,
        customer_email: customerEmail
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      throw orderError;
    }

    console.log('Order created:', order.id);

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      animal_id: item.animalId || null,
      quantity: item.quantity,
      unit_price: item.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Order items creation error:', itemsError);
      throw itemsError;
    }

    console.log('Order items created');

    // Get the origin URL from the request for redirect URLs
    const origin = req.headers.get('origin') || req.headers.get('referer')?.split('/').slice(0, 3).join('/') || 'https://paw-aid-hub.lovable.app';

    // Build return URL
    const returnUrl = `${origin}/payment-success?extOrderId=${order.id}`;
    
    // Format kwota - HotPay expects decimal format with dot (e.g., "19.99")
    const kwota = totalAmount.toFixed(2);
    
    // Create short service name (max ~60 chars for display)
    const nazwaUslugi = `Zamówienie ${order.id.substring(0, 8)}`;
    
    // ID zamówienia - max 64 chars
    const idZamowienia = order.id;

    // Generate HASH according to HotPay API documentation:
    // HASH = sha256(HASLO + ";" + KWOTA + ";" + NAZWA_USLUGI + ";" + ADRES_WWW + ";" + ID_ZAMOWIENIA + ";" + SEKRET)
    const hashString = `${hotpayHaslo};${kwota};${nazwaUslugi};${returnUrl};${idZamowienia};${hotpaySekret}`;
    const hash = await sha256(hashString);

    console.log('HotPay hash components:', {
      kwota,
      nazwaUslugi,
      returnUrl,
      idZamowienia,
      hashLength: hash.length
    });

    // Build HotPay payment URL with form data
    // Using POST redirect approach - build form data for client-side submission
    const hotpayParams = {
      SEKRET: hotpaySekret,
      KWOTA: kwota,
      NAZWA_USLUGI: nazwaUslugi,
      ADRES_WWW: returnUrl,
      ID_ZAMOWIENIA: idZamowienia,
      EMAIL: customerEmail,
      DANE_OSOBOWE: customerName,
      HASH: hash
    };

    console.log('HotPay payment prepared for order:', order.id);

    return new Response(
      JSON.stringify({
        orderId: order.id,
        hotpayUrl: 'https://platnosc.hotpay.pl/',
        hotpayParams: hotpayParams,
        status: { statusCode: 'SUCCESS' },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in create-hotpay-order:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
