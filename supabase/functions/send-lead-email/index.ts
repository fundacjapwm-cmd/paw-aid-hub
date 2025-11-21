import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LeadEmailRequest {
  organizationName: string;
  nip: string;
  email: string;
  phone: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { organizationName, nip, email, phone }: LeadEmailRequest = await req.json();

    console.log("Processing lead email for:", organizationName);

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
