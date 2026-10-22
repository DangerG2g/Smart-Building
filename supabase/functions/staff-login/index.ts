import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const fail = (status: number) => new Response(JSON.stringify({ ok: false }), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
  if (req.method !== "POST") return fail(405);

  try {
    const { staff_id, password } = await req.json();
    if (typeof staff_id !== "string" || typeof password !== "string" ||
        !staff_id.trim() || password.length < 1 || password.length > 128) return fail(400);

    const url = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !anonKey || !serviceKey) return fail(500);

    // Server-only service key reads the alias. Never expose it to the browser.
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { data: alias, error: lookupError } = await admin
      .from("staff_login_aliases")
      .select("auth_user_id, active")
      .eq("staff_id", staff_id.trim())
      .maybeSingle();

    // Generic error avoids revealing whether a staff ID exists.
    if (lookupError || !alias || !alias.active) return fail(401);

    const { data: userData, error: userError } = await admin.auth.admin.getUserById(alias.auth_user_id);
    const email = userData?.user?.email;
    if (userError || !email) return fail(401);

    // Verify password through regular Supabase Auth, not by reading/storing passwords.
    const authClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: signedIn, error: signInError } = await authClient.auth.signInWithPassword({ email, password });
    if (signInError || !signedIn.session || signedIn.user.id !== alias.auth_user_id) return fail(401);

    return new Response(JSON.stringify({ ok: true, session: signedIn.session, user: signedIn.user }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch {
    return fail(400);
  }
});
