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
    if (!token) return json({ error: "Unauthorized" });

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Unauthorized" });

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) return json({ error: "Доступ только для администратора" });

    const body = await req.json();
    const {
      email: emailIn, password: passIn,
      name, city, category, categories, phone, address, description,
      instagram_url, twogis_url, price_from, avatar_url, gallery,
    } = body ?? {};

    const catList: string[] = Array.isArray(categories) && categories.length
      ? categories.filter((c: any) => typeof c === "string" && c.trim())
      : (category ? [category] : []);
    const primaryCategory = (catList[0] ?? "development").split(".")[0];

    if (!name || !city) return json({ error: "Укажите название и город" });
    if (!emailIn && !phone) return json({ error: "Укажите email или телефон" });

    const cleanPhone = (phone ?? "").replace(/\D/g, "");
    const email = (emailIn || `${cleanPhone}@phone.balahub.kz`).toLowerCase();
    const password = passIn || (Math.random().toString(36).slice(-10) + "A1!");

    // Try create; if exists, look up existing user and reuse
    let newUserId: string | null = null;
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { display_name: name },
    });
    if (created?.user) {
      newUserId = created.user.id;
    } else {
      const msg = (createErr?.message || "").toLowerCase();
      const exists = msg.includes("already") || msg.includes("registered") || msg.includes("exists");
      if (!exists) return json({ error: createErr?.message || "Не удалось создать пользователя" });
      // Find existing user by email via listUsers (paginated search)
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      const found = list?.users?.find((u: any) => (u.email || "").toLowerCase() === email);
      if (!found) return json({ error: `Пользователь с email ${email} уже существует, но не найден` });
      newUserId = found.id;
    }

    // Profile (upsert)
    await admin.from("profiles").upsert({
      user_id: newUserId, display_name: name, phone: phone ?? null,
    }, { onConflict: "user_id" });

    // Role (ignore duplicate)
    await admin.from("user_roles").upsert(
      { user_id: newUserId, role: "club_owner" },
      { onConflict: "user_id,role" },
    );

    // Club
    const { data: club, error: clubErr } = await admin
      .from("clubs")
      .insert({
        user_id: newUserId,
        name_ru: name, name_kz: name, name_en: name,
        city, category: primaryCategory,
        categories: catList.length ? catList : [primaryCategory],
        phone: phone ?? null,
        address: address ?? null,
        description_ru: description ?? null,
        description_kz: description ?? null,
        description_en: description ?? null,
        instagram: instagram_url ?? null,
        twogis_url: twogis_url ?? null,
        price_from: price_from ?? null,
        avatar_url: avatar_url ?? null,
        gallery: Array.isArray(gallery) ? gallery : [],
      })
      .select()
      .single();

    if (clubErr) return json({ error: `Не удалось создать кружок: ${clubErr.message}` });

    return json({ ok: true, club, credentials: { email, password } });
  } catch (e: any) {
    return json({ error: e?.message ?? "Server error" });
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
