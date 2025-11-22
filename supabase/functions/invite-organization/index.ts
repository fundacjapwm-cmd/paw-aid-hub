import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  email: string;
  organizationName: string;
  organizationId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify the request is from an authenticated admin user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user has admin role
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'ADMIN');

    if (roleError || !userRoles || userRoles.length === 0) {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { email, organizationName, organizationId }: InviteRequest = await req.json();

    console.log("Creating user account for:", email);

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find(u => u.email === email);

    let userId: string;

    if (existingUser) {
      console.log("User already exists, updating metadata:", existingUser.id);
      
      // Update existing user's metadata
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          user_metadata: {
            organization_id: organizationId,
            organization_name: organizationName
          }
        }
      );

      if (updateError) {
        console.error("Error updating user:", updateError);
        throw updateError;
      }

      userId = existingUser.id;
      console.log("User updated successfully:", userId);
    } else {
      // Create new user WITHOUT password (will be set via recovery link)
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          organization_id: organizationId,
          organization_name: organizationName
        }
      });

      if (authError) {
        console.error("Error creating user:", authError);
        throw authError;
      }

      userId = authData.user.id;
      console.log("User created successfully:", userId);
    }

    // Update profile (created automatically by trigger) with organization details
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: 'ORG',
        must_change_password: true,
        display_name: organizationName
      })
      .eq('id', userId);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      throw profileError;
    }

    // Check if organization_users record already exists
    const { data: existingOrgUser } = await supabase
      .from('organization_users')
      .select('*')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .single();

    if (!existingOrgUser) {
      // Create organization_users record only if it doesn't exist
      const { error: orgUserError } = await supabase
        .from('organization_users')
        .insert({
          user_id: userId,
          organization_id: organizationId,
          is_owner: true
        });

      if (orgUserError) {
        console.error("Error creating organization_users record:", orgUserError);
        throw orgUserError;
      }
    } else {
      console.log("Organization user record already exists");
    }

    // Trigger password reset email via Supabase
    const origin = req.headers.get("origin") || "https://paczkiwmasle.lovable.app";
    console.log("Sending password reset email to:", email);
    
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/set-password`,
    });

    if (resetError) {
      console.error("Error sending password reset:", resetError);
      throw resetError;
    }

    console.log("Password reset email sent successfully via Supabase");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Konto utworzone. Wysłano e-mail z linkiem do ustawienia hasła."
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
    console.error("Error in invite-organization function:", error);
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
