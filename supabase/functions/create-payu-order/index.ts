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
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { items, customerEmail, customerName, totalAmount }: CheckoutRequest = await req.json();

    console.log('Creating order for user:', user.id, 'Total:', totalAmount);

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: totalAmount,
        status: 'pending',
        payment_status: 'pending',
        payment_method: 'payu'
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

    // Get PayU OAuth token
    const posId = Deno.env.get('PAYU_POS_ID')!;
    const clientId = Deno.env.get('PAYU_CLIENT_ID')!;
    const clientSecret = Deno.env.get('PAYU_CLIENT_SECRET')!;

    const authResponse = await fetch('https://secure.payu.com/pl/standard/user/oauth/authorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
    });

    if (!authResponse.ok) {
      throw new Error('PayU authentication failed');
    }

    const { access_token } = await authResponse.json();

    // Get the origin URL from the request for redirect URLs
    const origin = req.headers.get('origin') || req.headers.get('referer')?.split('/').slice(0, 3).join('/') || supabaseUrl;

    // Create PayU order
    const payuOrder = {
      notifyUrl: `${supabaseUrl}/functions/v1/payu-webhook`,
      continueUrl: `${origin}/payment-success?extOrderId=${order.id}`,
      customerIp: req.headers.get('x-forwarded-for') || '127.0.0.1',
      merchantPosId: posId,
      description: `Darowizna - Zamówienie ${order.id.substring(0, 8)}`,
      currencyCode: 'PLN',
      totalAmount: Math.round(totalAmount * 100).toString(), // Convert to grosze
      buyer: {
        email: customerEmail,
        firstName: customerName.split(' ')[0] || customerName,
        lastName: customerName.split(' ').slice(1).join(' ') || customerName,
      },
      products: items.map(item => ({
        name: item.productName + (item.animalName ? ` (dla ${item.animalName})` : ''),
        unitPrice: Math.round(item.price * 100).toString(),
        quantity: item.quantity.toString(),
      })),
      extOrderId: order.id,
    };

    console.log('Creating PayU order:', payuOrder);

    const payuResponse = await fetch('https://secure.payu.com/api/v2_1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
      body: JSON.stringify(payuOrder),
    });

    if (!payuResponse.ok) {
      const errorText = await payuResponse.text();
      console.error('PayU order creation failed:', errorText);
      throw new Error(`PayU order creation failed: ${errorText}`);
    }

    const payuData = await payuResponse.json();
    console.log('PayU order created:', payuData);

    return new Response(
      JSON.stringify({
        orderId: order.id,
        redirectUri: payuData.redirectUri,
        status: payuData.status,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in create-payu-order:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});