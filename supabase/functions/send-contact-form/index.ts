import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactFormRequest {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, message }: ContactFormRequest = await req.json();

    console.log("Processing contact form submission:", { name, email, phone });

    // Validate input
    if (!name || name.trim().length === 0) {
      throw new Error("Imię jest wymagane");
    }
    if (!email || email.trim().length === 0 || !email.includes("@")) {
      throw new Error("Prawidłowy email jest wymagany");
    }
    if (!message || message.trim().length === 0) {
      throw new Error("Wiadomość jest wymagana");
    }
    if (name.length > 100) {
      throw new Error("Imię jest za długie");
    }
    if (email.length > 255) {
      throw new Error("Email jest za długi");
    }
    if (message.length > 2000) {
      throw new Error("Wiadomość jest za długa");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Save to database
    const { error: dbError } = await supabase
      .from("contact_messages")
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        message: message.trim(),
        status: "new",
      });

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Błąd zapisu do bazy danych");
    }

    console.log("Message saved to database successfully");

    // HTML encode function to prevent XSS
    const htmlEncode = (str: string): string => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    // Send email notification to organization
    try {
      const emailResponse = await resend.emails.send({
        from: "Paczki w Maśle <kontakt@paczkiwmasle.pl>",
        to: ["kontakt@paczkiwmasle.pl"],
        subject: `Nowa wiadomość od ${htmlEncode(name)}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #F97316;">Nowa wiadomość kontaktowa</h2>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Imię:</strong> ${htmlEncode(name)}</p>
              <p><strong>Email:</strong> <a href="mailto:${htmlEncode(email)}">${htmlEncode(email)}</a></p>
              ${phone ? `<p><strong>Telefon:</strong> ${htmlEncode(phone)}</p>` : ""}
              <p><strong>Data:</strong> ${new Date().toLocaleString("pl-PL")}</p>
            </div>
            <div style="margin: 20px 0;">
              <h3>Wiadomość:</h3>
              <p style="white-space: pre-wrap;">${htmlEncode(message)}</p>
            </div>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #888; font-size: 12px;">
              Ta wiadomość została wysłana przez formularz kontaktowy na stronie Pączki w Maśle.
            </p>
          </div>
        `,
      });

      console.log("Email sent successfully:", emailResponse);
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Don't fail the request if email fails - message is already saved
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Dziękujemy za wiadomość! Odpowiemy najszybciej jak to możliwe." 
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
    console.error("Error in send-contact-form function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Wystąpił błąd podczas wysyłania wiadomości" 
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
