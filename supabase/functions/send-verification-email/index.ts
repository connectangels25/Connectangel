import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user || !user.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Skip if already verified (prevents useless resends)
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("email_verified")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.email_verified) {
      return new Response(JSON.stringify({ success: true, message: "Email already verified" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Generate a one-time magic link for this user's email
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const siteUrl = Deno.env.get("SITE_URL") ?? "http://localhost:5173";
    const redirectTo = `${siteUrl}/verify-email`;

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: user.email,
      options: { redirectTo },
    });

    if (linkError) throw linkError;
    const actionLink = linkData?.properties?.action_link;
    if (!actionLink) {
      throw new Error("Could not generate verification link");
    }

    // Send the verification email through Resend (the user's configured SMTP provider)
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured on this function");
    }

    const from = Deno.env.get("MAIL_FROM") ?? "ConnectAngel <noreply@yourdomain.com>";
    const subject = "Verify your email";
    const html = `<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#141019;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#141019;padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;background-color:#231A28;border:1px solid #3B3040;border-radius:20px;overflow:hidden;">
        <tr>
          <td style="background:linear-gradient(135deg,#8C3CDC,#6D28D9);padding:32px 40px;text-align:center;">
            <div style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">ConnectAngel</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.75);letter-spacing:2px;text-transform:uppercase;margin-top:4px;">Where Angels Discover Unicorns</div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px 8px 40px;">
            <h1 style="margin:0;font-size:22px;font-weight:700;color:#F2F2F2;line-height:1.3;">Verify your email</h1>
            <p style="margin:12px 0 0 0;font-size:14px;line-height:1.7;color:#9C8FA3;">
              You're almost there! Confirm your email address to unlock the full
              <strong style="color:#F2F2F2;">ConnectAngel</strong> experience, including
              access to Potential.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px;">
            <a href="${actionLink}"
               style="display:inline-block;background-color:#8C3CDC;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:12px;">
              Verify my email
            </a>
            <p style="margin:16px 0 0 0;font-size:12px;line-height:1.6;color:#6F6577;">
              Button not working? Copy and paste this link into your browser:<br>
              <a href="${actionLink}" style="color:#8C3CDC;word-break:break-all;">${actionLink}</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 24px 40px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td style="padding:16px 0 0 0;border-top:1px solid #3B3040;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#6F6577;">
                  This link is valid for 1 hour. If you didn't request this, you can safely ignore this email.
                </p>
                <p style="margin:12px 0 0 0;font-size:11px;line-height:1.6;color:#544B5C;">
                  Account email: ${user.email}<br>
                  &copy; 2026 ConnectAngel. All rights reserved.
                </p>
              </td></tr>
            </table>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [user.email],
        subject,
        html,
      }),
    });

    if (!resendRes.ok) {
      const body = await resendRes.text();
      throw new Error(`Resend error ${resendRes.status}: ${body}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
