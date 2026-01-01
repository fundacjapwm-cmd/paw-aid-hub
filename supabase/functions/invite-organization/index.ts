import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

const resend = new Resend(resendApiKey);

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

// Generate a random password (12 characters, mix of letters and numbers)
const generateTempPassword = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const generateWelcomeEmail = (organizationName: string, email: string, tempPassword: string, loginUrl: string) => `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Twoje konto zostało aktywowane!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <tr>
      <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); border-radius: 0 0 30px 30px;">
        <img src="https://paczkiwmasle.lovable.app/logo.svg" alt="Paczki w Maśle" width="180" style="display: block; margin: 0 auto 20px;" />
        <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          🎉 Twoje zgłoszenie zostało zaakceptowane!
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
          Świetna wiadomość! Twoje zgłoszenie zostało <strong style="color: #16a34a;">zatwierdzone</strong>! 
          Jesteśmy niesamowicie szczęśliwi, że dołączasz do naszej platformy. 
          Razem pomożemy jeszcze większej liczbie zwierzaków!
        </p>
        
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 16px; padding: 25px; margin: 30px 0;">
          <h2 style="color: #92400e; font-size: 16px; font-weight: 600; margin: 0 0 15px; text-transform: uppercase; letter-spacing: 0.5px;">
            🔐 Twoje dane logowania
          </h2>
          
          <table style="width: 100%; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 0; color: #78350f; font-size: 14px;">Email:</td>
              <td style="padding: 8px 0; color: #1e293b; font-weight: 600; font-size: 14px;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #78350f; font-size: 14px;">Hasło tymczasowe:</td>
              <td style="padding: 8px 0;">
                <code style="background: #ffffff; padding: 6px 12px; border-radius: 6px; font-size: 16px; font-weight: 700; color: #1e293b; border: 2px dashed #f97316;">${tempPassword}</code>
              </td>
            </tr>
          </table>
          
          <p style="font-size: 14px; color: #92400e; margin: 0 0 15px; line-height: 1.6;">
            ⚠️ <strong>Ważne:</strong> Po pierwszym zalogowaniu zostaniesz poproszony o zmianę hasła na własne.
          </p>
          
          <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(249, 115, 22, 0.4);">
            Zaloguj się do panelu →
          </a>
        </div>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 25px; margin-top: 30px;">
          <h3 style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0 0 15px;">
            ✨ Co możesz zrobić w panelu?
          </h3>
          <ul style="padding-left: 20px; margin: 0; color: #475569; line-height: 2;">
            <li>Dodawaj profile swoich podopiecznych</li>
            <li>Twórz listy życzeń z potrzebnymi produktami</li>
            <li>Śledź zamówienia i darowizny</li>
            <li>Zarządzaj dostawami</li>
          </ul>
        </div>
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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify the request is from an authenticated admin user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user has admin role
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'ADMIN');

    if (roleError || !userRoles || userRoles.length === 0) {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { email, organizationName, organizationId }: InviteRequest = await req.json();

    console.log("Creating user account for:", email);

    // Generate temporary password
    const tempPassword = generateTempPassword();
    console.log("Generated temporary password for:", email);

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find(u => u.email === email);

    let userId: string;

    if (existingUser) {
      console.log("User already exists, updating:", existingUser.id);
      
      // Update existing user with new password
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          password: tempPassword,
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
    } else {
      // Create new user WITH temporary password
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
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

    // Update profile with organization details and force password change
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
    console.log("Profile updated with must_change_password: true");

    // Remove USER role if exists (from handle_new_user trigger)
    await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', 'USER');
    console.log("Removed USER role if it existed");

    // Add ORG role
    const { error: userRoleError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: 'ORG'
      }, { onConflict: 'user_id,role' });

    if (userRoleError) {
      console.error("Error creating user_roles record:", userRoleError);
      throw userRoleError;
    }

    // Check if organization_users record already exists
    const { data: existingOrgUser } = await supabase
      .from('organization_users')
      .select('*')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .single();

    if (!existingOrgUser) {
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
    }

    // Send welcome email with credentials
    const origin = req.headers.get("origin") || "https://paczkiwmasle.lovable.app";
    const loginUrl = `${origin}/auth`;
    
    console.log("Sending welcome email with credentials to:", email);
    
    const emailHtml = generateWelcomeEmail(organizationName, email, tempPassword, loginUrl);
    
    let emailSent = false;
    let emailWarning = null;
    
    try {
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: "Paczki w Maśle <kontakt@paczkiwmasle.pl>",
        to: [email],
        subject: `🎉 Twoje konto zostało aktywowane, ${organizationName}!`,
        html: emailHtml,
      });

      if (emailError) {
        console.error("Error sending email via Resend (non-fatal):", emailError);
        emailWarning = `Email nie został wysłany: ${emailError.message}. Zweryfikuj domenę w Resend.`;
      } else {
        console.log("Welcome email sent successfully:", emailData);
        emailSent = true;
      }
    } catch (emailErr: any) {
      console.error("Email sending failed (non-fatal):", emailErr);
      emailWarning = `Email nie został wysłany. Zweryfikuj domenę w Resend.`;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: userId,
        email_sent: emailSent,
        temp_password: emailSent ? null : tempPassword, // Return password if email failed
        warning: emailWarning,
        message: emailSent 
          ? 'Konto utworzone. Wysłano e-mail z danymi logowania.'
          : `Konto utworzone. Email nie został wysłany - hasło tymczasowe: ${tempPassword}`
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