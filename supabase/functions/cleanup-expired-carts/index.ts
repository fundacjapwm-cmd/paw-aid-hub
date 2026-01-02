import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Calculate timestamp 24 hours ago
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() - 24);
    const expiryTimestamp = expiryDate.toISOString();
    
    console.log(`Cleaning up carts older than: ${expiryTimestamp}`);
    
    // Delete cart items that haven't been updated in 24 hours
    const { data, error } = await supabase
      .from('user_carts')
      .delete()
      .lt('updated_at', expiryTimestamp)
      .select('id');
    
    if (error) {
      console.error('Error deleting expired carts:', error);
      throw error;
    }
    
    const deletedCount = data?.length || 0;
    console.log(`Successfully deleted ${deletedCount} expired cart items`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        deletedCount,
        expiryTimestamp 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Cleanup error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
