import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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

    console.log("Creating user invitation for:", email);

    // Create user with invitation
    const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          organization_id: organizationId,
          organization_name: organizationName,
          role: 'ORG'
        },
        redirectTo: `${req.headers.get('origin')}/set-password`
      }
    );

    if (authError) {
      console.error("Error inviting user:", authError);
      throw authError;
    }

    console.log("User invited successfully:", authData);

    // Get the invite URL from the auth data
    const inviteUrl = `${req.headers.get('origin')}/set-password`;
    
    // Send custom invitation email with Resend
    const emailResponse = await resend.emails.send({
      from: "Adopcja Zwierząt <onboarding@resend.dev>",
      to: [email],
      subject: `Zaproszenie do zarządzania - ${organizationName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Witamy w systemie Adopcja Zwierząt!</h1>
          <p>Zostałeś zaproszony do zarządzania organizacją: <strong>${organizationName}</strong></p>
          
          <p>Aby rozpocząć, musisz ustawić swoje hasło:</p>
          
          <div style="margin: 30px 0;">
            <a href="${inviteUrl}" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Ustaw hasło i zaloguj się
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Link jest ważny przez 24 godziny. Jeśli nie utworzyłeś tego konta, zignoruj tę wiadomość.
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
