import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { hashCode, hashIp, INVALID_CODE, normalizePhone } from "../_shared/otp.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
const invalid = (remaining = 0) => json(200, { error: INVALID_CODE, remaining_attempts: remaining });

async function notifyPasswordChanged(chatId: string | null) {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const telegramKey = Deno.env.get("TELEGRAM_API_KEY");
  if (!chatId || !lovableKey || !telegramKey) return;
  const res = await fetch(`${GATEWAY_URL}/sendMessage`, {
    method: "POST",
    headers: { Authorization: `Bearer ${lovableKey}`, "X-Connection-Api-Key": telegramKey, "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: "🔐 Пароль изменён. Если это были не вы, сразу восстановите пароль в BalaHub." }),
  });
  if (!res.ok) console.error(`Password notice failed [${res.status}]: ${await res.text()}`);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { phone: rawPhone, code, password, mode, role } = await req.json();
    const flow: "register" | "reset" = mode === "reset" ? "reset" : "register";
    const chosenRole: "parent" | "club_owner" = role === "club_owner" ? "club_owner" : "parent";
    const phone = normalizePhone(String(rawPhone ?? ""));
    if (!/^7\d{10}$/.test(phone) || !/^\d{6}$/.test(String(code ?? ""))) return invalid();
    if (typeof password !== "string" || password.length < 6 || password.length > 128) {
      return json(400, { error: "Password must be at least 6 characters" });
    }
    const secret = Deno.env.get("OTP_HASH_SECRET");
    if (!secret) throw new Error("OTP_HASH_SECRET is not configured");

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const ip = (req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown").trim();
    const { data: allowed, error: limitError } = await supabase.rpc("otp_verify_allowed", { _phone: phone, _ip: await hashIp(ip, secret) });
    if (limitError) throw new Error(limitError.message);
    if (!allowed) return invalid();

    const { data: result, error: verifyError } = await supabase.rpc("otp_verify", {
      _phone: phone, _purpose: flow, _hash: await hashCode(phone, flow, String(code), secret),
    });
    if (verifyError) throw new Error(verifyError.message);
    if (!result?.success) {
      await supabase.rpc("otp_record_failure", { _phone: phone });
      return invalid(Math.max(0, Number(result?.remaining_attempts ?? 0)));
    }

    const email = `${phone}@phone.balahub.kz`;
    const { data: list } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    let userId: string | null = list?.users?.find((u: { email?: string }) => u.email === email)?.id ?? null;

    if (flow === "register") {
      if (userId) return json(200, { error: "already_registered" });
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { phone } });
      if (createError || !newUser?.user) { console.error("Create user error:", createError?.message); return json(500, { error: "Failed to create account" }); }
      userId = newUser.user.id;
      await supabase.from("profiles").insert({ user_id: userId, phone, display_name: `User ${phone.slice(-4)}` });
      await supabase.from("user_roles").insert({ user_id: userId, role: chosenRole });
    } else {
      if (!userId) return invalid();
      const { error: updErr } = await supabase.auth.admin.updateUserById(userId, { password });
      if (updErr) { console.error("Password update error:", updErr.message); return json(500, { error: "Failed to update password" }); }
      await supabase.rpc("otp_invalidate", { _phone: phone });
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({ email, password });
    if (sessionError || !sessionData?.session) { console.error("Session error:", sessionError?.message); return json(500, { error: "Login failed" }); }

    if (flow === "reset") {
      const { error: signOutError } = await supabase.auth.admin.signOut(sessionData.session.access_token, "others");
      if (signOutError) console.error("Other sessions sign-out failed:", signOutError.message);
      await notifyPasswordChanged(result.telegram_chat_id ?? null);
    }

    return json(200, { success: true, session: sessionData.session, user: sessionData.user, isNewUser: flow === "register" });
  } catch (error) {
    console.error("verify-code error:", (error as Error).message);
    return json(500, { error: "Internal error" });
  }
});
