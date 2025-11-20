import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeleteRequest {
  organizationId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { organizationId }: DeleteRequest = await req.json();

    console.log("Deleting organization:", organizationId);

    // Get all users associated with this organization
    const { data: orgUsers, error: fetchError } = await supabaseAdmin
      .from('organization_users')
      .select('user_id')
      .eq('organization_id', organizationId);

    if (fetchError) {
      console.error("Error fetching organization users:", fetchError);
      throw fetchError;
    }

    // Delete each user from auth.users
    if (orgUsers && orgUsers.length > 0) {
      console.log(`Deleting ${orgUsers.length} users`);
      
      for (const orgUser of orgUsers) {
        const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(
          orgUser.user_id
        );

        if (deleteUserError) {
          console.error(`Error deleting user ${orgUser.user_id}:`, deleteUserError);
          // Continue with other users even if one fails
        } else {
          console.log(`User ${orgUser.user_id} deleted successfully`);
        }
      }
    }

    // Delete organization_users records (if cascade isn't set)
    const { error: orgUsersError } = await supabaseAdmin
      .from('organization_users')
      .delete()
      .eq('organization_id', organizationId);

    if (orgUsersError) {
      console.error("Error deleting organization_users:", orgUsersError);
    }

    // Finally, delete the organization record
    const { error: orgError } = await supabaseAdmin
      .from('organizations')
      .delete()
      .eq('id', organizationId);

    if (orgError) {
      console.error("Error deleting organization:", orgError);
      throw orgError;
    }

    console.log("Organization deleted successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Organizacja została usunięta"
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in delete-organization function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
