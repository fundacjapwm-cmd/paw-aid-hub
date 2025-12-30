import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";
import { encodeHex } from "https://deno.land/std@0.190.0/encoding/hex.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, openpayu-signature',
};

// Helper function to create MD5 hash (PayU uses MD5 for signatures)
async function md5(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('MD5', msgBuffer);
  return encodeHex(new Uint8Array(hashBuffer));
}

serve(async (req) => {
  console.log('PayU webhook received - Method:', req.method);
  console.log('PayU webhook headers:', JSON.stringify(Object.fromEntries(req.headers.entries())));

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.text();
    console.log('PayU webhook body:', body);

    let notification;
    try {
      notification = JSON.parse(body);
    } catch (parseError) {
      console.error('Failed to parse webhook body:', parseError);
      return new Response('Invalid JSON', { status: 400, headers: corsHeaders });
    }

    console.log('Received PayU notification:', JSON.stringify(notification, null, 2));

    // SECURITY: Enforce signature verification - reject requests without valid signature
    const md5Key = Deno.env.get('PAYU_MD5_KEY');
    const signatureHeader = req.headers.get('OpenPayu-Signature') || req.headers.get('openpayu-signature');
    
    console.log('Signature header present:', !!signatureHeader);
    console.log('MD5 Key configured:', !!md5Key);

    // Reject if MD5 key is not configured
    if (!md5Key) {
      console.error('SECURITY: PAYU_MD5_KEY not configured - cannot verify webhook authenticity');
      return new Response(
        JSON.stringify({ error: 'Webhook verification not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Reject if signature header is missing
    if (!signatureHeader) {
      console.error('SECURITY: Missing OpenPayu-Signature header - rejecting request');
      return new Response(
        JSON.stringify({ error: 'Signature required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and verify signature
    try {
      // Parse signature header: "signature=xxx;algorithm=MD5;sender=checkout"
      const signatureParts: Record<string, string> = {};
      signatureHeader.split(';').forEach(part => {
        const [key, value] = part.split('=');
        if (key && value) {
          signatureParts[key.trim()] = value.trim();
        }
      });

      const receivedSignature = signatureParts['signature'];
      const algorithm = signatureParts['algorithm'] || 'MD5';

      if (!receivedSignature) {
        console.error('SECURITY: No signature value in header - rejecting request');
        return new Response(
          JSON.stringify({ error: 'Invalid signature format' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (algorithm !== 'MD5') {
        console.error('SECURITY: Unsupported algorithm:', algorithm, '- rejecting request');
        return new Response(
          JSON.stringify({ error: 'Unsupported signature algorithm' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // PayU MD5 signature: MD5(body + secondKey)
      const expectedSignature = await md5(body + md5Key);

      if (receivedSignature.toLowerCase() !== expectedSignature.toLowerCase()) {
        console.error('SECURITY: Signature mismatch - rejecting request');
        console.error('Received:', receivedSignature.substring(0, 8) + '...');
        console.error('Expected:', expectedSignature.substring(0, 8) + '...');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Signature verified successfully');
    } catch (sigError) {
      console.error('SECURITY: Error verifying signature:', sigError);
      return new Response(
        JSON.stringify({ error: 'Signature verification failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const order = notification.order;
    if (!order) {
      console.error('No order in notification');
      return new Response('No order in notification', { status: 400, headers: corsHeaders });
    }

    const orderId = order.extOrderId;
    const status = order.status;
    const payuOrderId = order.orderId;

    console.log('Processing order:', orderId, 'PayU Order ID:', payuOrderId, 'Status:', status);

    if (!orderId) {
      console.error('No extOrderId in notification');
      return new Response(
        JSON.stringify({ error: 'No extOrderId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SECURITY: Idempotency check - don't process completed orders again
    const { data: existingOrder, error: fetchOrderError } = await supabase
      .from('orders')
      .select('id, payment_status')
      .eq('id', orderId)
      .maybeSingle();

    if (fetchOrderError) {
      console.error('Error fetching order for idempotency check:', fetchOrderError);
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!existingOrder) {
      console.error('SECURITY: Order not found:', orderId, '- possible forged webhook');
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Skip if order is already completed - prevent duplicate processing
    if (existingOrder.payment_status === 'completed' && status === 'COMPLETED') {
      console.log('Order already completed, skipping duplicate webhook:', orderId);
      return new Response(
        JSON.stringify({ success: true, message: 'Already processed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Map PayU status to our payment status
    let paymentStatus: string;
    let orderStatus: string;

    switch (status) {
      case 'COMPLETED':
        paymentStatus = 'completed';
        orderStatus = 'confirmed';
        break;
      case 'CANCELED':
      case 'REJECTED':
        paymentStatus = 'failed';
        orderStatus = 'cancelled';
        break;
      case 'PENDING':
      case 'WAITING_FOR_CONFIRMATION':
        paymentStatus = 'pending';
        orderStatus = 'pending';
        break;
      default:
        console.log('Unknown status:', status, '- treating as pending');
        paymentStatus = 'pending';
        orderStatus = 'pending';
    }

    console.log('Updating order with payment_status:', paymentStatus, 'status:', orderStatus);

    // Update order status
    const { data: updateData, error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: paymentStatus,
        status: orderStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select();

    if (updateError) {
      console.error('Error updating order:', updateError);
      throw updateError;
    }

    console.log('Order updated successfully:', updateData);

    // If payment completed, assign to batch order and send confirmation
    if (status === 'COMPLETED') {
      console.log('Payment completed for order:', orderId);
      
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
        .eq('id', orderId)
        .single();

      if (fetchError) {
        console.error('Error fetching order data:', fetchError);
      }

      if (orderData) {
        console.log('Order data for batch assignment:', JSON.stringify(orderData, null, 2));
        
        // Find organization ID from order items
        let organizationId: string | null = null;
        for (const item of orderData.order_items || []) {
          if (item.animals?.organization_id) {
            organizationId = item.animals.organization_id;
            break;
          }
        }

        console.log('Organization ID found:', organizationId);

        // Assign to batch order only after payment is confirmed
        if (organizationId) {
          // Check if there's an active collecting batch order for this organization
          const { data: activeBatch, error: batchFetchError } = await supabase
            .from('organization_batch_orders')
            .select('id')
            .eq('organization_id', organizationId)
            .eq('status', 'collecting')
            .maybeSingle();

          if (batchFetchError) {
            console.error('Error fetching active batch:', batchFetchError);
          }

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
            const { error: batchAssignError } = await supabase
              .from('orders')
              .update({ batch_order_id: batchOrderId })
              .eq('id', orderId);

            if (batchAssignError) {
              console.error('Batch assignment error:', batchAssignError);
            } else {
              console.log('Order assigned to batch:', batchOrderId);
            }
          }
        }

        // Send confirmation email
        try {
          const buyerEmail = order.buyer?.email;
          const buyerName = order.buyer?.firstName || 'Darczyńca';
          
          if (buyerEmail) {
            console.log('Sending confirmation email to:', buyerEmail);
            
            const { error: emailError } = await supabase.functions.invoke('send-order-confirmation', {
              body: {
                orderId: orderData.id,
                customerEmail: buyerEmail,
                customerName: buyerName,
                totalAmount: orderData.total_amount,
                items: orderData.order_items,
              },
            });

            if (emailError) {
              console.error('Error sending confirmation email:', emailError);
            } else {
              console.log('Confirmation email sent successfully');
            }
          } else {
            console.log('No buyer email available for confirmation');
          }
        } catch (emailError) {
          console.error('Exception sending confirmation email:', emailError);
        }
      }
    }

    console.log('Webhook processing completed successfully');

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in payu-webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
