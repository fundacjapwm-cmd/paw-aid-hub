import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// HotPay webhook notification verification
// HASH = sha256(HASLO + ";" + KWOTA + ";" + ID_PLATNOSCI + ";" + ID_ZAMOWIENIA + ";" + STATUS + ";" + SECURE + ";" + SEKRET)

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// HotPay sends notifications from these IPs - for logging/reference
const HOTPAY_IPS = [
  '18.197.55.26',
  '3.126.108.86',
  '3.64.128.101',
  '18.184.99.42',
  '3.72.152.155',
  '35.159.7.168'
];

serve(async (req) => {
  console.log('HotPay webhook received - Method:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const hotpaySekret = Deno.env.get('HOTPAY_SEKRET');
    const hotpayHaslo = Deno.env.get('HOTPAY_HASLO');

    if (!hotpaySekret || !hotpayHaslo) {
      console.error('SECURITY: HotPay credentials not configured');
      return new Response('Configuration error', { status: 500, headers: corsHeaders });
    }

    // Log request info
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    console.log('Request from IP:', clientIp);
    console.log('Is HotPay IP:', HOTPAY_IPS.includes(clientIp));

    // Parse form data (HotPay sends as multipart/form-data or application/x-www-form-urlencoded)
    let formData: Record<string, string> = {};
    
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const data = await req.formData();
      for (const [key, value] of data.entries()) {
        formData[key] = String(value);
      }
    } else {
      // Try to parse as JSON or URL-encoded string
      const body = await req.text();
      console.log('Raw body:', body);
      
      if (body.startsWith('{')) {
        formData = JSON.parse(body);
      } else {
        // Parse URL-encoded
        const params = new URLSearchParams(body);
        for (const [key, value] of params.entries()) {
          formData[key] = value;
        }
      }
    }

    console.log('HotPay notification data:', JSON.stringify(formData, null, 2));

    // Extract HotPay notification fields
    const sekret = formData['SEKRET'];
    const kwota = formData['KWOTA'];
    const status = formData['STATUS'];
    const idZamowienia = formData['ID_ZAMOWIENIA'];
    const idPlatnosci = formData['ID_PLATNOSCI'];
    const secure = formData['SECURE'];
    const receivedHash = formData['HASH'];

    // Validate required fields
    if (!idZamowienia || !status || !receivedHash) {
      console.error('Missing required fields in notification');
      return new Response('Missing required fields', { status: 400, headers: corsHeaders });
    }

    // Verify HASH
    // HASH = sha256(HASLO + ";" + KWOTA + ";" + ID_PLATNOSCI + ";" + ID_ZAMOWIENIA + ";" + STATUS + ";" + SECURE + ";" + SEKRET)
    const hashString = `${hotpayHaslo};${kwota};${idPlatnosci};${idZamowienia};${status};${secure};${sekret}`;
    const expectedHash = await sha256(hashString);

    console.log('Hash verification:');
    console.log('Received hash (first 16):', receivedHash?.substring(0, 16));
    console.log('Expected hash (first 16):', expectedHash.substring(0, 16));

    if (receivedHash?.toLowerCase() !== expectedHash.toLowerCase()) {
      console.error('SECURITY: Hash mismatch - rejecting notification');
      return new Response('Invalid hash', { status: 401, headers: corsHeaders });
    }

    console.log('Hash verified successfully');

    // Check if order exists
    const { data: existingOrder, error: fetchOrderError } = await supabase
      .from('orders')
      .select('id, payment_status')
      .eq('id', idZamowienia)
      .maybeSingle();

    if (fetchOrderError) {
      console.error('Error fetching order:', fetchOrderError);
      return new Response('Database error', { status: 500, headers: corsHeaders });
    }

    if (!existingOrder) {
      console.error('SECURITY: Order not found:', idZamowienia);
      return new Response('Order not found', { status: 404, headers: corsHeaders });
    }

    // Skip if already completed (idempotency)
    if (existingOrder.payment_status === 'completed' && status === 'SUCCESS') {
      console.log('Order already completed, skipping duplicate:', idZamowienia);
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    // Map HotPay status to our status
    // HotPay: SUCCESS, PENDING, FAILURE
    let paymentStatus: string;
    let orderStatus: string;

    switch (status) {
      case 'SUCCESS':
        paymentStatus = 'completed';
        orderStatus = 'confirmed';
        break;
      case 'FAILURE':
        paymentStatus = 'failed';
        orderStatus = 'cancelled';
        break;
      case 'PENDING':
      default:
        paymentStatus = 'pending';
        orderStatus = 'pending';
    }

    console.log('Updating order:', idZamowienia, 'to status:', paymentStatus);

    // Update order
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: paymentStatus,
        status: orderStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', idZamowienia);

    if (updateError) {
      console.error('Error updating order:', updateError);
      throw updateError;
    }

    console.log('Order updated successfully');

    // If payment successful, handle post-payment logic
    if (status === 'SUCCESS') {
      console.log('Payment successful for order:', idZamowienia);

      // Fetch order with items for batch assignment
      const { data: orderData, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (name, price),
            animals (name, organization_id)
          )
        `)
        .eq('id', idZamowienia)
        .single();

      if (fetchError) {
        console.error('Error fetching order data:', fetchError);
      }

      if (orderData) {
        // Find organization ID from order items
        let organizationId: string | null = null;
        for (const item of orderData.order_items || []) {
          if (item.animals?.organization_id) {
            organizationId = item.animals.organization_id;
            break;
          }
        }

        console.log('Organization ID found:', organizationId);

        // Assign to batch order
        if (organizationId) {
          const { data: activeBatch } = await supabase
            .from('organization_batch_orders')
            .select('id')
            .eq('organization_id', organizationId)
            .eq('status', 'collecting')
            .maybeSingle();

          let batchOrderId: string | undefined;

          if (activeBatch) {
            batchOrderId = activeBatch.id;
            console.log('Using existing batch order:', batchOrderId);
          } else {
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

          if (batchOrderId) {
            await supabase
              .from('orders')
              .update({ batch_order_id: batchOrderId })
              .eq('id', idZamowienia);
            console.log('Order assigned to batch:', batchOrderId);
          }
        }

        // Send confirmation email
        try {
          // Get customer email from user or use stored email
          let customerEmail: string | null = null;
          let customerName = 'Kliencie';

          if (orderData.user_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('id', orderData.user_id)
              .single();
            
            if (profile?.display_name) {
              customerName = profile.display_name;
            }

            // Get email from auth
            const { data: { user } } = await supabase.auth.admin.getUserById(orderData.user_id);
            customerEmail = user?.email || null;
          }

          if (customerEmail) {
            console.log('Sending confirmation email to:', customerEmail);
            
            await supabase.functions.invoke('send-order-confirmation', {
              body: {
                orderId: orderData.id,
                customerEmail,
                customerName,
                totalAmount: orderData.total_amount,
                items: orderData.order_items,
              },
            });
            console.log('Confirmation email sent');
          }
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
        }
      }
    }

    console.log('Webhook processing completed');
    return new Response('OK', { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('Error in hotpay-webhook:', error);
    return new Response(error.message, { status: 500, headers: corsHeaders });
  }
});
