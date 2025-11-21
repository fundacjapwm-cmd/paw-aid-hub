import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LeadEmailRequest {
  organizationName: string;
  nip: string;
  email: string;
  phone: string;
  acceptedTerms: boolean;
  marketingConsent?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { organizationName, nip, email, phone, acceptedTerms, marketingConsent }: LeadEmailRequest = await req.json();

    console.log("Processing lead email for:", organizationName);

    // Save to database
    const { error: dbError } = await supabase
      .from("organization_leads")
      .insert([{
        organization_name: organizationName,
        nip,
        email,
        phone,
        accepted_terms: acceptedTerms,
        marketing_consent: marketingConsent || false
      }]);

    if (dbError) {
      console.error("Database error:", dbError);
      throw dbError;
    }

    // Send email to foundation
    const emailResponse = await resend.emails.send({
      from: "System Pączki <onboarding@resend.dev>",
      to: ["fundacjapwm@gmail.com"],
      subject: `Nowe zgłoszenie organizacji: ${organizationName}`,
      html: `
        <h1>Nowe zgłoszenie organizacji</h1>
        <p><strong>Nazwa:</strong> ${organizationName}</p>
        <p><strong>NIP:</strong> ${nip}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefon:</strong> ${phone}</p>
        <p><strong>Akceptacja regulaminu:</strong> ${acceptedTerms ? 'Tak' : 'Nie'}</p>
        <p><strong>Zgoda marketingowa:</strong> ${marketingConsent ? 'Tak' : 'Nie'}</p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-lead-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
