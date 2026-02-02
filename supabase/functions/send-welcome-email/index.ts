import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
const resend = new Resend(resendApiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  displayName?: string;
}

const generateWelcomeEmail = (displayName: string) => `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Witamy w Paczki w Maśle!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <tr>
      <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); border-radius: 0 0 30px 30px;">
        <img src="https://paczkiwmasle.lovable.app/logo.svg" alt="Paczki w Maśle" width="180" style="display: block; margin: 0 auto 20px;" />
        <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          🐾 Witamy w rodzinie!
        </h1>
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="padding: 40px;">
        <p style="font-size: 18px; color: #1e293b; margin: 0 0 20px; line-height: 1.6;">
          Cześć <strong>${displayName}</strong>! 👋
        </p>
        
        <p style="font-size: 16px; color: #475569; margin: 0 0 25px; line-height: 1.7;">
          Dziękujemy za dołączenie do <strong>Paczki w Maśle</strong>! Jesteśmy niesamowicie szczęśliwi, że chcesz pomagać zwierzakom w potrzebie. 🧡
        </p>
        
        <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 16px; padding: 25px; margin: 30px 0; border-left: 4px solid #10b981;">
          <h2 style="color: #065f46; font-size: 16px; font-weight: 600; margin: 0 0 15px;">
            ✅ Twoje konto zostało utworzone!
          </h2>
          <p style="font-size: 15px; color: #047857; margin: 0; line-height: 1.6;">
            Sprawdź swoją skrzynkę email – wysłaliśmy Ci link aktywacyjny. Po kliknięciu w link będziesz mógł się zalogować.
          </p>
        </div>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 25px; margin-top: 30px;">
          <h3 style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0 0 15px;">
            🎁 Co możesz robić jako kupujący?
          </h3>
          <ul style="padding-left: 20px; margin: 0; color: #475569; line-height: 2;">
            <li><strong>Przeglądaj zwierzaki</strong> – poznaj podopiecznych schronisk</li>
            <li><strong>Kupuj prezenty</strong> – wybieraj produkty z list życzeń</li>
            <li><strong>Śledź swoje zakupy</strong> – zobacz komu pomogłeś</li>
            <li><strong>Wspieraj organizacje</strong> – każdy zakup trafia do potrzebujących</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 35px;">
          <a href="https://paczkiwmasle.lovable.app/zwierzeta" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(249, 115, 22, 0.4);">
            Poznaj zwierzaki 🐕
          </a>
        </div>
      </td>
    </tr>
    
    <!-- Fun fact -->
    <tr>
      <td style="padding: 0 40px 30px;">
        <div style="background: #fef3c7; border-radius: 12px; padding: 20px; text-align: center;">
          <p style="font-size: 14px; color: #92400e; margin: 0; line-height: 1.6;">
            💡 <strong>Czy wiesz, że...</strong> nawet mała paczka karmy może uszczęśliwić zwierzaka na cały tydzień?
          </p>
        </div>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="padding: 30px 40px; background-color: #f1f5f9; text-align: center; border-radius: 30px 30px 0 0;">
        <p style="font-size: 14px; color: #64748b; margin: 0 0 10px;">
          Masz pytania? Chętnie pomożemy!
        </p>
        <a href="mailto:kontakt@paczkiwmasle.pl" style="color: #f97316; text-decoration: none; font-weight: 600;">
          kontakt@paczkiwmasle.pl
        </a>
        <div style="margin-top: 20px;">
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">
            © ${new Date().getFullYear()} Paczki w Maśle. Wszystkie prawa zastrzeżone.
          </p>
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
    const { email, displayName }: WelcomeEmailRequest = await req.json();

    console.log("Sending welcome email to:", email);

    const name = displayName || email.split('@')[0];
    const emailHtml = generateWelcomeEmail(name);
    
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "Paczki w Maśle <kontakt@paczkiwmasle.pl>",
      to: [email],
      subject: `🐾 Witaj w Paczki w Maśle, ${name}!`,
      html: emailHtml,
    });

    if (emailError) {
      console.error("Error sending email via Resend:", emailError);
      throw emailError;
    }

    console.log("Welcome email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email powitalny wysłany pomyślnie."
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
    console.error("Error in send-welcome-email function:", error);
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
