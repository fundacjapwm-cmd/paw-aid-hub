import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function parseUserAgent(userAgent: string) {
  let deviceType = "Nieznane";
  let browser = "Nieznana";
  let os = "Nieznany";

  // Detect device type
  if (/Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)) {
    if (/iPad|Tablet/i.test(userAgent)) {
      deviceType = "Tablet";
    } else {
      deviceType = "Telefon";
    }
  } else {
    deviceType = "Komputer";
  }

  // Detect browser
  if (/Edg\//i.test(userAgent)) {
    browser = "Edge";
  } else if (/Chrome/i.test(userAgent) && !/Chromium/i.test(userAgent)) {
    browser = "Chrome";
  } else if (/Firefox/i.test(userAgent)) {
    browser = "Firefox";
  } else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
    browser = "Safari";
  } else if (/Opera|OPR/i.test(userAgent)) {
    browser = "Opera";
  }

  // Detect OS
  if (/Windows/i.test(userAgent)) {
    os = "Windows";
  } else if (/Mac OS X|macOS/i.test(userAgent)) {
    os = "macOS";
  } else if (/Linux/i.test(userAgent)) {
    os = "Linux";
  } else if (/Android/i.test(userAgent)) {
    os = "Android";
  } else if (/iOS|iPhone|iPad|iPod/i.test(userAgent)) {
    os = "iOS";
  }

  return { deviceType, browser, os };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Brak autoryzacji" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create client with user's token to get user ID
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Nieprawidłowy token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get IP and User Agent
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                      req.headers.get("cf-connecting-ip") || 
                      req.headers.get("x-real-ip") || 
                      "Nieznany";
    
    const userAgent = req.headers.get("user-agent") || "Nieznany";
    const { deviceType, browser, os } = parseUserAgent(userAgent);

    // Insert login record
    const { error: insertError } = await supabaseClient
      .from("login_history")
      .insert({
        user_id: user.id,
        ip_address: ipAddress,
        user_agent: userAgent,
        device_type: deviceType,
        browser,
        os,
      });

    if (insertError) {
      console.error("Error inserting login history:", insertError);
      return new Response(JSON.stringify({ error: "Błąd zapisu" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Błąd serwera" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
