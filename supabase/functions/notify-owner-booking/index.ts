import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { booking_id } = await req.json();
    if (!booking_id || typeof booking_id !== "string") {
      return new Response(JSON.stringify({ error: "booking_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!LOVABLE_API_KEY || !TELEGRAM_API_KEY) {
      throw new Error("Telegram gateway credentials missing");
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: booking, error: bErr } = await supabase
      .from("bookings")
      .select("id, child_name, child_age, phone, message, booking_date, club_id")
      .eq("id", booking_id)
      .single();
    if (bErr || !booking) throw new Error("Booking not found");

    const { data: club } = await supabase
      .from("clubs")
      .select("id, name_ru, city, user_id")
      .eq("id", booking.club_id)
      .single();
    if (!club) throw new Error("Club not found");

    const { data: owner } = await supabase
      .from("profiles")
      .select("phone")
      .eq("user_id", club.user_id)
      .maybeSingle();

    if (!owner?.phone) {
      return new Response(JSON.stringify({ ok: false, reason: "owner has no phone" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalized = owner.phone.replace(/\D/g, "");
    const { data: pv } = await supabase
      .from("phone_verifications")
      .select("telegram_chat_id, phone")
      .eq("verified", true)
      .not("telegram_chat_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(50);

    const match = (pv || []).find((r: any) => r.phone.replace(/\D/g, "") === normalized);
    if (!match?.telegram_chat_id) {
      return new Response(JSON.stringify({ ok: false, reason: "no telegram chat" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const text =
      `🔔 <b>Новая заявка на бронь</b>\n\n` +
      `🏫 <b>${club.name_ru}</b> · ${club.city}\n` +
      `👶 ${booking.child_name}${booking.child_age ? `, ${booking.child_age} лет` : ""}\n` +
      `📅 ${booking.booking_date}\n` +
      `📞 ${booking.phone || "—"}\n` +
      (booking.message ? `💬 ${booking.message}\n` : "") +
      `\nОткройте дашборд, чтобы подтвердить.`;

    const tgRes = await fetch(`${GATEWAY_URL}/sendMessage`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TELEGRAM_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: match.telegram_chat_id,
        text,
        parse_mode: "HTML",
      }),
    });

    if (!tgRes.ok) {
      const body = await tgRes.text();
      console.error(`Telegram send failed [${tgRes.status}]: ${body}`);
      return new Response(JSON.stringify({ error: "telegram failed", status: tgRes.status, details: body }), {
        status: tgRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("notify-owner-booking error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
