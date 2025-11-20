import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// No longer needed - using recovery link instead

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

    // Generate recovery link (magic link for setting password)
    const origin = req.headers.get("origin") || "https://your-app.lovable.app";
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${origin}/set-password`
      }
    });

    if (linkError) {
      console.error("Error generating recovery link:", linkError);
      throw linkError;
    }

    console.log("Sending invitation email to:", email);

    // Send invitation email with recovery link
    const emailResponse = await resend.emails.send({
      from: "Pączki w Maśle <onboarding@resend.dev>",
      to: [email],
      subject: `Zaproszenie do organizacji ${organizationName}`,
      html: `
        <h1>Zaproszenie do Pączki w Maśle 🍩</h1>
        <p>Zostałeś zaproszony do zarządzania organizacją: <strong>${organizationName}</strong>.</p>
        <p>Kliknij poniższy przycisk, aby ustawić hasło i aktywować konto:</p>
        <a href="${linkData.properties.action_link}" style="background:#E9A52E; color:white; padding:12px 24px; text-decoration:none; border-radius:8px; display:inline-block;">
          Aktywuj konto i ustaw hasło
        </a>
        <p style="margin-top:20px; color:#666; font-size:14px;">
          Link jest ważny przez 24 godziny.
        </p>
      `,
    });

    console.log("Invitation email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Zaproszenie zostało wysłane",
        userId: userId
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
