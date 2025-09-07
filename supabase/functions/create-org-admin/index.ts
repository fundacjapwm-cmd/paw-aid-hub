import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreateOrgAdminRequest {
  email: string;
  password: string;
  displayName: string;
  organizationId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, displayName, organizationId }: CreateOrgAdminRequest = await req.json();

    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Create the user account
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: displayName
      }
    });

    if (userError) {
      console.error('Error creating user:', userError);
      throw userError;
    }

    // Update user profile with ORG role
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        role: 'ORG',
        display_name: displayName,
        must_change_password: true // Wymagaj zmiany hasła przy pierwszym logowaniu
      })
      .eq('id', userData.user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      throw profileError;
    }

    // Add user to organization as owner
    const { error: orgUserError } = await supabaseAdmin
      .from('organization_users')
      .insert({
        user_id: userData.user.id,
        organization_id: organizationId,
        is_owner: true
      });

    if (orgUserError) {
      console.error('Error linking user to organization:', orgUserError);
      throw orgUserError;
    }

    console.log('Successfully created organization admin:', userData.user.email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: userData.user.id,
        message: 'Organization admin created successfully'
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
    console.error("Error in create-org-admin function:", error);
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