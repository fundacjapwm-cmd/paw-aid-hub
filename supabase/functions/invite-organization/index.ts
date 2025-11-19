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

    // Create user with invitation - Supabase will send the email automatically
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
    console.log("Supabase will send invitation email with proper tokens to:", email);

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
