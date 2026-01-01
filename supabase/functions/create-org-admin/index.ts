import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreateOrgAdminRequest {
  email: string;
  displayName: string;
  organizationId: string;
  organizationName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, displayName, organizationId, organizationName }: CreateOrgAdminRequest = await req.json();

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

    // Generate temporary password
    const tempPassword = crypto.randomUUID();

    // Create the user account
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
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
        must_change_password: true
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

    // Send invitation email
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const appUrl = Deno.env.get("SUPABASE_URL")?.replace('https://', 'https://').replace('.supabase.co', '.lovable.app') || 'https://app.lovable.app';
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Witamy w Platformie Adopcji</h1>
        <p>Dzień dobry ${displayName},</p>
        <p>Zostało utworzone dla Ciebie konto administratora organizacji <strong>${organizationName}</strong>.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 10px 0;"><strong>Hasło tymczasowe:</strong> <code style="background: #fff; padding: 5px 10px; border-radius: 4px;">${tempPassword}</code></p>
        </div>

        <p>Aby aktywować konto:</p>
        <ol>
          <li>Zaloguj się używając powyższych danych</li>
          <li>Zmień hasło na własne</li>
          <li>Uzupełnij informacje o organizacji</li>
        </ol>

        <a href="${appUrl}/auth" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Zaloguj się
        </a>

        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Jeśli nie spodziewałeś się tej wiadomości, skontaktuj się z administratorem platformy.
        </p>
      </div>
    `;

    await resend.emails.send({
      from: "Paczki w Maśle <kontakt@paczkiwmasle.pl>",
      to: [email],
      subject: `Zaproszenie do zarządzania organizacją ${organizationName}`,
      html: emailHtml,
    });

    console.log('Successfully created organization admin:', userData.user.email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: userData.user.id,
        message: 'Organization admin created and invitation sent'
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
