import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return json({ error: "Unauthorized" }, 401);

    // Verify caller
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Check admin role
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) return json({ error: "Forbidden: admin only" }, 403);

    const body = await req.json();
    const {
      email,
      password,
      name,
      city,
      category,
      phone,
      address,
      description,
      instagram_url,
      twogis_url,
      price_from,
    } = body ?? {};

    if (!email || !password || !name || !city) {
      return json({ error: "email, password, name, city are required" }, 400);
    }
    if (String(password).length < 6) return json({ error: "password too short" }, 400);

    // Create auth user (email confirmed)
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: name },
    });
    if (createErr || !created.user) return json({ error: createErr?.message || "create failed" }, 400);

    const newUserId = created.user.id;

    // Profile
    await admin.from("profiles").upsert({
      user_id: newUserId,
      display_name: name,
      phone: phone ?? null,
    }, { onConflict: "user_id" });

    // Role
    await admin.from("user_roles").insert({ user_id: newUserId, role: "club_owner" });

    // Club
    const { data: club, error: clubErr } = await admin
      .from("clubs")
      .insert({
        owner_id: newUserId,
        name,
        city,
        category: category ?? "development",
        phone: phone ?? null,
        address: address ?? null,
        description: description ?? null,
        instagram_url: instagram_url ?? null,
        twogis_url: twogis_url ?? null,
        price_from: price_from ?? null,
      })
      .select()
      .single();

    if (clubErr) return json({ error: clubErr.message }, 400);

    return json({ ok: true, club, credentials: { email, password } });
  } catch (e: any) {
    return json({ error: e?.message ?? "Server error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
