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

const generateConfirmationEmail = (organizationName: string) => `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Potwierdzenie zgłoszenia</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <tr>
      <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); border-radius: 0 0 30px 30px;">
        <img src="https://paczkiwmasle.lovable.app/logo.svg" alt="Paczki w Maśle" width="180" style="display: block; margin: 0 auto 20px;" />
        <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          📬 Otrzymaliśmy Twoje zgłoszenie!
        </h1>
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="padding: 40px;">
        <p style="font-size: 18px; color: #1e293b; margin: 0 0 20px; line-height: 1.6;">
          Cześć <strong>${organizationName}</strong>! 👋
        </p>
        
        <p style="font-size: 16px; color: #475569; margin: 0 0 25px; line-height: 1.7;">
          Dziękujemy za przesłanie zgłoszenia do platformy <strong>Paczki w Maśle</strong>! 
          Bardzo się cieszymy, że chcesz dołączyć do naszej rodziny organizacji pomagających zwierzętom.
        </p>
        
        <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 16px; padding: 25px; margin: 30px 0;">
          <h2 style="color: #1e40af; font-size: 16px; font-weight: 600; margin: 0 0 15px; text-transform: uppercase; letter-spacing: 0.5px;">
            ⏳ Co dalej?
          </h2>
          <ol style="font-size: 15px; color: #1e3a8a; margin: 0; padding-left: 20px; line-height: 1.8;">
            <li>Nasz zespół przejrzy Twoje zgłoszenie</li>
            <li>Zweryfikujemy dane organizacji</li>
            <li>Po akceptacji otrzymasz email z dostępem do panelu</li>
          </ol>
        </div>
        
        <p style="font-size: 16px; color: #475569; margin: 0 0 25px; line-height: 1.7;">
          Zazwyczaj odpowiadamy w ciągu <strong>1-2 dni roboczych</strong>. 
          Jeśli masz pytania, śmiało napisz do nas!
        </p>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="padding: 30px 40px; background-color: #f1f5f9; text-align: center; border-radius: 30px 30px 0 0;">
        <p style="font-size: 14px; color: #64748b; margin: 0 0 10px;">
          Masz pytania? Napisz do nas!
        </p>
        <a href="mailto:kontakt@paczkiwmasle.pl" style="color: #f97316; text-decoration: none; font-weight: 600;">
          kontakt@paczkiwmasle.pl
        </a>
        <p style="font-size: 12px; color: #94a3b8; margin: 20px 0 0;">
          © ${new Date().getFullYear()} Paczki w Maśle. Wszystkie prawa zastrzeżone.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const generateAdminNotificationEmail = (lead: LeadEmailRequest) => `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <title>Nowe zgłoszenie organizacji</title>
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f1f5f9;">
  <table width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
    <tr>
      <td style="padding: 30px; background-color: #f97316; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🔔 Nowe zgłoszenie!</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px;">
        <h2 style="color: #1e293b; margin: 0 0 20px;">${lead.organizationName}</h2>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">NIP:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-weight: 600;">${lead.nip || 'Nie podano'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Email:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-weight: 600;">${lead.email}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Telefon:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-weight: 600;">${lead.phone || 'Nie podano'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Regulamin:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: ${lead.acceptedTerms ? '#16a34a' : '#dc2626'}; font-weight: 600;">${lead.acceptedTerms ? '✓ Zaakceptowany' : '✗ Nie zaakceptowany'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #64748b;">Marketing:</td>
            <td style="padding: 10px 0; color: ${lead.marketingConsent ? '#16a34a' : '#64748b'}; font-weight: 600;">${lead.marketingConsent ? '✓ Zgoda' : '— Brak zgody'}</td>
          </tr>
        </table>
        
        <div style="margin-top: 30px; text-align: center;">
          <a href="https://paczkiwmasle.lovable.app/admin/leady" style="display: inline-block; background-color: #f97316; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;">
            Przejdź do panelu admina →
          </a>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const leadData: LeadEmailRequest = await req.json();
    const { organizationName, nip, email, phone, acceptedTerms, marketingConsent } = leadData;

    console.log("Processing lead submission for:", organizationName);

    // Step 1: Save to database
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
    console.log("Lead saved to database");

    // Step 2: Send confirmation email to the organization
    console.log("Sending confirmation email to:", email);
    const confirmationHtml = generateConfirmationEmail(organizationName);
    
    const { error: confirmError } = await resend.emails.send({
      from: "Paczki w Maśle <kontakt@paczkiwmasle.pl>",
      to: [email],
      subject: "📬 Otrzymaliśmy Twoje zgłoszenie!",
      html: confirmationHtml,
    });

    if (confirmError) {
      console.error("Error sending confirmation email:", confirmError);
      // Don't throw - continue to send admin notification
    } else {
      console.log("Confirmation email sent to:", email);
    }

    // Step 3: Send notification email to admin
    console.log("Sending notification to admin");
    const adminHtml = generateAdminNotificationEmail(leadData);
    
    const { error: adminError } = await resend.emails.send({
      from: "Paczki w Maśle <kontakt@paczkiwmasle.pl>",
      to: ["fundacjapwm@gmail.com"],
      subject: `🔔 Nowe zgłoszenie: ${organizationName}`,
      html: adminHtml,
    });

    if (adminError) {
      console.error("Error sending admin notification:", adminError);
    } else {
      console.log("Admin notification sent");
    }

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