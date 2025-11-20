import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Generate temporary password
function generateTemporaryPassword(): string {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

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

    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword();

    // Create user with temporary password
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: temporaryPassword,
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

    console.log("User created successfully:", authData.user.id);

    // Create profile with must_change_password flag
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        role: 'ORG',
        must_change_password: true,
        display_name: organizationName
      });

    if (profileError) {
      console.error("Error creating profile:", profileError);
      throw profileError;
    }

    // Create organization_users record
    const { error: orgUserError } = await supabase
      .from('organization_users')
      .insert({
        user_id: authData.user.id,
        organization_id: organizationId,
        is_owner: true
      });

    if (orgUserError) {
      console.error("Error creating organization_users record:", orgUserError);
      throw orgUserError;
    }

    // Send email with credentials
    const emailResponse = await resend.emails.send({
      from: "Adopcja Zwierząt <onboarding@resend.dev>",
      to: [email],
      subject: `Zaproszenie do zarządzania - ${organizationName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Witamy w systemie Adopcja Zwierząt!</h1>
          <p>Zostałeś zaproszony do zarządzania organizacją: <strong>${organizationName}</strong></p>
          
          <p>Możesz zalogować się używając poniższych danych:</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 10px 0 0 0;"><strong>Tymczasowe hasło:</strong> <code style="background-color: #fff; padding: 4px 8px; border-radius: 4px;">${temporaryPassword}</code></p>
          </div>
          
          <p style="color: #d97706; font-weight: 600;">⚠️ Po zalogowaniu zostaniesz poproszony o zmianę hasła.</p>
          
          <div style="margin: 30px 0;">
            <a href="${req.headers.get('origin')}/auth" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Zaloguj się teraz
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Jeśli nie utworzyłeś tego konta, zignoruj tę wiadomość.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          
          <p style="color: #999; font-size: 12px;">
            Ta wiadomość została wysłana automatycznie. Nie odpowiadaj na nią.
          </p>
        </div>
      `,
    });

    console.log("Invitation email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Zaproszenie zostało wysłane",
        userId: authData.user.id
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
