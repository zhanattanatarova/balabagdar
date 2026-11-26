import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { hashCode } from "../_shared/otp.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const { club_id } = await req.json();
    if (typeof club_id !== "string" || !/^[0-9a-f-]{36}$/i.test(club_id)) return json({ error: "Invalid club" }, 400);
    const secret = Deno.env.get("OTP_HASH_SECRET");
    if (!secret) throw new Error("OTP_HASH_SECRET is not configured");
    const ip = (req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown").trim();
    const visitor = await hashCode("view", club_id, ip, secret);
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { error } = await supabase.rpc("record_club_view", { _club_id: club_id, _visitor_hash: visitor });
    if (error) throw new Error(error.message);
    return json({ ok: true });
  } catch (error) {
    console.error("track-club-view error:", (error as Error).message);
    return json({ error: "Internal error" }, 500);
  }
});
