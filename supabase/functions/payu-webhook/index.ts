import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to create HMAC signature using Web Crypto API
async function createSignature(key: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const dataBuffer = encoder.encode(data);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer);
  
  // Convert to hex string
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.text();
    const notification = JSON.parse(body);

    console.log('Received PayU notification:', notification);

    // Verify signature
    const md5Key = Deno.env.get('PAYU_MD5_KEY')!;
    const signature = req.headers.get('OpenPayu-Signature');
    
    if (signature) {
      const signatureParts = signature.split(';');
      const receivedSignature = signatureParts.find(part => part.startsWith('signature='))?.split('=')[1];
      
      const expectedSignature = await createSignature(md5Key, body);

      if (receivedSignature !== expectedSignature) {
        console.error('Invalid signature');
        return new Response('Invalid signature', { status: 401 });
      }
    }

    const order = notification.order;
    const orderId = order.extOrderId;
    const status = order.status;

    console.log('Processing order:', orderId, 'Status:', status);

    // Update order status
    const paymentStatus = status === 'COMPLETED' ? 'completed' : 
                         status === 'CANCELED' ? 'failed' : 'pending';

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: paymentStatus,
        status: status === 'COMPLETED' ? 'confirmed' : 'pending',
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order:', updateError);
      throw updateError;
    }

    console.log('Order updated successfully');

    // If payment completed, assign to batch order and send confirmation
    if (status === 'COMPLETED') {
      console.log('Payment completed for order:', orderId);
      
      const { data: orderData } = await supabase
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

      if (orderData) {
        // Find organization ID from order items
        let organizationId: string | null = null;
        for (const item of orderData.order_items) {
          if (item.animals?.organization_id) {
            organizationId = item.animals.organization_id;
            break;
          }
        }

        // Assign to batch order only after payment is confirmed
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
            } else {
              batchOrderId = newBatch.id;
              console.log('Created new batch order:', batchOrderId);
            }
          }

          if (batchOrderId!) {
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
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', orderData.user_id)
          .single();

        await supabase.functions.invoke('send-order-confirmation', {
          body: {
            orderId: orderData.id,
            customerEmail: order.buyer.email,
            customerName: profile?.display_name || order.buyer.firstName,
            totalAmount: orderData.total_amount,
            items: orderData.order_items,
          },
        });
      }
    }

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