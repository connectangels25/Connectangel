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
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return new Response(JSON.stringify({ error: "Forbidden: Admins only" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { action, user_id } = await req.json();
    if (!action) {
      return new Response(JSON.stringify({ error: "Missing action" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (action !== "ban" && action !== "unban" && action !== "reset_all_plans_to_free") {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    if (action === "reset_all_plans_to_free") {
      const { error: resetError } = await supabaseAdmin
        .from("profiles")
        .update({ plan: "free", pro_started_at: null })
        .or("is_admin.is.null,is_admin.eq.false");

      if (resetError) throw resetError;

      return new Response(JSON.stringify({ success: true, message: "All non-admin users reset to free plan" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (action === "ban") {
      const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(
        user_id,
        { ban_duration: "876000h" }
      );
      if (banError) throw banError;

      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({ is_banned: true })
        .eq("id", user_id);
      if (profileError) throw profileError;
    } else {
      const { error: unbanError } = await supabaseAdmin.auth.admin.updateUserById(
        user_id,
        { ban_duration: "none" }
      );
      if (unbanError) throw unbanError;

      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({ is_banned: false })
        .eq("id", user_id);
      if (profileError) throw profileError;
    }

    return new Response(JSON.stringify({ success: true, action }), {
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
