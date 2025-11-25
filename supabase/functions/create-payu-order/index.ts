import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

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

// Function to send confirmation email
async function sendConfirmationEmail(
  customerEmail: string,
  customerName: string,
  orderId: string,
  totalAmount: number,
  items: OrderItem[]
) {
  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          ${item.productName}${item.animalName ? ` (dla ${item.animalName})` : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
          ${item.price.toFixed(2)} zł
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
          ${(item.price * item.quantity).toFixed(2)} zł
        </td>
      </tr>
    `).join('');

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .receipt { margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #f5f5f5; padding: 12px; text-align: left; font-weight: bold; }
            .total { font-size: 1.2em; font-weight: bold; color: #667eea; text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #667eea; }
            .footer { background: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 0.9em; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Dziękujemy za Twoją darowiznę! ❤️</h1>
              <p>Twoja wpłata została zrealizowana pomyślnie</p>
            </div>
            <div class="content">
              <p>Cześć ${customerName}!</p>
              <p>Twoja darowizna pomaga zwierzętom w potrzebie. Jesteśmy niezmiernie wdzięczni za Twoje wsparcie!</p>
              
              <div class="receipt">
                <h2>Potwierdzenie zamówienia</h2>
                <p><strong>Numer zamówienia:</strong> ${orderId.substring(0, 8).toUpperCase()}</p>
                <p><strong>Data:</strong> ${new Date().toLocaleDateString('pl-PL', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
                
                <h3>Szczegóły zamówienia:</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Produkt</th>
                      <th style="text-align: center;">Ilość</th>
                      <th style="text-align: right;">Cena jedn.</th>
                      <th style="text-align: right;">Razem</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>
                
                <div class="total">
                  Suma całkowita: ${totalAmount.toFixed(2)} zł
                </div>
              </div>
              
              <p style="margin-top: 30px;">Produkty zostaną dostarczone do schroniska/organizacji, aby pomóc zwierzętom, które najbardziej tego potrzebują.</p>
              
              <p><strong>Masz pytania?</strong> Skontaktuj się z nami: fundacjapwm@gmail.com</p>
              
              <p>Jeszcze raz dziękujemy!<br>
              Zespół Paczki w Maśle</p>
            </div>
            <div class="footer">
              <p>Ten email został wygenerowany automatycznie po zakończeniu płatności.</p>
              <p>© ${new Date().getFullYear()} Paczki w Maśle. Wszelkie prawa zastrzeżone.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: 'Paczki w Maśle <onboarding@resend.dev>',
      to: [customerEmail],
      subject: `Potwierdzenie darowizny - zamówienie ${orderId.substring(0, 8).toUpperCase()}`,
      html: receiptHtml,
    });

    console.log('Confirmation email sent successfully:', emailResponse);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    console.log('Creating order for:', isGuest ? 'guest' : 'user', customerEmail);

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

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId, // Can be null for guest orders
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

    // Find organization ID from animal IDs
    let organizationId: string | null = null;
    const animalIds = items.filter(item => item.animalId).map(item => item.animalId);
    
    if (animalIds.length > 0) {
      const { data: animal } = await supabase
        .from('animals')
        .select('organization_id')
        .eq('id', animalIds[0])
        .single();
      
      organizationId = animal?.organization_id || null;
    }

    // If organization found, create or assign to batch order
    if (organizationId) {
      // Check if there's an active collecting batch order for this organization
      const { data: activeBatch } = await supabase
        .from('organization_batch_orders')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('status', 'collecting')
        .maybeSingle();

      let batchOrderId: string;

      if (activeBatch) {
        // Use existing batch
        batchOrderId = activeBatch.id;
        console.log('Using existing batch order:', batchOrderId);
      } else {
        // Create new batch
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
          throw batchError;
        }

        batchOrderId = newBatch.id;
        console.log('Created new batch order:', batchOrderId);
      }

      // Assign order to batch
      const { error: updateError } = await supabase
        .from('orders')
        .update({ batch_order_id: batchOrderId })
        .eq('id', order.id);

      if (updateError) {
        console.error('Order batch assignment error:', updateError);
        throw updateError;
      }

      console.log('Order assigned to batch:', batchOrderId);
    }

    // Get PayU OAuth token
    const posId = Deno.env.get('PAYU_POS_ID')!;
    const clientId = Deno.env.get('PAYU_CLIENT_ID')!;
    const clientSecret = Deno.env.get('PAYU_CLIENT_SECRET')!;
    const isSandbox = Deno.env.get('PAYU_SANDBOX') === 'true';

    const payuBaseUrl = isSandbox ? 'https://secure.snd.payu.com' : 'https://secure.payu.com';
    console.log(`Using PayU ${isSandbox ? 'SANDBOX' : 'PRODUCTION'} environment`);

    const authResponse = await fetch(`${payuBaseUrl}/pl/standard/user/oauth/authorize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error('PayU authentication failed:', errorText);
      throw new Error(`PayU authentication failed: ${errorText}`);
    }

    const { access_token } = await authResponse.json();
    console.log('PayU authentication successful');

    // Get the origin URL from the request for redirect URLs
    const origin = req.headers.get('origin') || req.headers.get('referer')?.split('/').slice(0, 3).join('/') || supabaseUrl;

    // Create PayU order
    const payuOrder = {
      notifyUrl: `${supabaseUrl}/functions/v1/payu-webhook`,
      continueUrl: `${origin}/payment-success?extOrderId=${order.id}`,
      customerIp: (req.headers.get('x-forwarded-for') || '127.0.0.1').split(',')[0].trim(),
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

    console.log('Creating PayU order:', JSON.stringify(payuOrder, null, 2));

    const payuResponse = await fetch(`${payuBaseUrl}/api/v2_1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
      body: JSON.stringify(payuOrder),
      redirect: 'manual', // Don't follow redirects - PayU returns 302
    });

    console.log('PayU response status:', payuResponse.status);

    // PayU returns 302 redirect on success
    if (payuResponse.status === 302) {
      const redirectUri = payuResponse.headers.get('Location');
      console.log('PayU redirect URI:', redirectUri);
      
      if (!redirectUri) {
        throw new Error('PayU returned 302 but no Location header');
      }

      // Send confirmation email as background task
      EdgeRuntime.waitUntil(sendConfirmationEmail(
        customerEmail,
        customerName,
        order.id,
        totalAmount,
        items
      ));

      return new Response(
        JSON.stringify({
          orderId: order.id,
          redirectUri: redirectUri,
          status: { statusCode: 'SUCCESS' },
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle error responses
    if (!payuResponse.ok) {
      const errorText = await payuResponse.text();
      console.error('PayU order creation failed:', errorText);
      throw new Error(`PayU order creation failed: ${errorText}`);
    }

    // Fallback for 200 responses (shouldn't happen normally)
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