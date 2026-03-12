import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

async function telegramApi(method: string, body?: Record<string, unknown>) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
  const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY");
  if (!TELEGRAM_API_KEY) throw new Error("TELEGRAM_API_KEY is not configured");

  const res = await fetch(`${GATEWAY_URL}/${method}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": TELEGRAM_API_KEY,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Telegram ${method} failed [${res.status}]: ${JSON.stringify(data)}`);
  }
  return data;
}

// Process pending Telegram updates: store chat_id for contacts shared
async function processTelegramUpdates(supabase: ReturnType<typeof createClient>) {
  try {
    const data = await telegramApi("getUpdates", {});
    if (!data.ok || !data.result?.length) return;

    let maxId = 0;
    for (const update of data.result) {
      if (update.update_id > maxId) maxId = update.update_id;
      const msg = update.message;
      if (!msg) continue;

      // User shared contact
      if (msg.contact) {
        const phone = msg.contact.phone_number.replace(/\D/g, "");
        const chatId = String(msg.chat.id);
        console.log(`Contact shared: phone=${phone}, chat_id=${chatId}`);
        // Update any existing verification record for this phone
        await supabase
          .from("phone_verifications")
          .update({ telegram_chat_id: chatId })
          .eq("phone", phone);
        // Also store it for future lookups — upsert a record
        const { data: existing } = await supabase
          .from("phone_verifications")
          .select("id")
          .eq("phone", phone)
          .limit(1);
        if (!existing?.length) {
          await supabase.from("phone_verifications").insert({
            phone,
            telegram_chat_id: chatId,
            code: "0000",
            verified: true,
          });
        }
      }

      // User sent /start — reply with contact request
      if (msg.text?.startsWith("/start")) {
        await telegramApi("sendMessage", {
          chat_id: msg.chat.id,
          text: "👋 Привет! Я бот BalaHub.\n\nОтправьте свой номер телефона, чтобы получать коды подтверждения для входа в приложение.",
          reply_markup: {
            keyboard: [[{ text: "📱 Отправить номер телефона", request_contact: true }]],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        });
      }
    }

    // Acknowledge processed updates
    if (maxId > 0) {
      await telegramApi("getUpdates", { offset: maxId + 1 });
    }
  } catch (err) {
    console.error("Error processing Telegram updates:", err);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone } = await req.json();
    if (!phone || phone.replace(/\D/g, "").length < 11) {
      return new Response(JSON.stringify({ error: "Неверный номер телефона" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const code = String(Math.floor(1000 + Math.random() * 9000));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Process any pending Telegram updates first
    await processTelegramUpdates(supabase);

    // Look up telegram_chat_id for this phone
    const { data: existing } = await supabase
      .from("phone_verifications")
      .select("telegram_chat_id")
      .eq("phone", cleanPhone)
      .not("telegram_chat_id", "is", null)
      .limit(1);

    const chatId = existing?.[0]?.telegram_chat_id;

    // Delete old codes for this phone
    await supabase.from("phone_verifications").delete().eq("phone", cleanPhone);

    // Insert new code
    const { error: insertError } = await supabase.from("phone_verifications").insert({
      phone: cleanPhone,
      code,
      telegram_chat_id: chatId || null,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ error: "Не удалось создать код" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!chatId) {
      console.log(`No Telegram chat_id for phone ${cleanPhone}`);
      return new Response(
        JSON.stringify({
          error: "telegram_not_linked",
          message: "Сначала откройте Telegram-бота и отправьте свой номер телефона",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Send code via Telegram
    await telegramApi("sendMessage", {
      chat_id: Number(chatId),
      text: `🔐 Ваш код для входа в BalaHub: *${code}*\n\nНикому не сообщайте этот код.`,
      parse_mode: "Markdown",
    });

    console.log(`Code sent to chat_id=${chatId} for phone=${cleanPhone}`);

    return new Response(JSON.stringify({ success: true, message: "Код отправлен в Telegram" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message || "Внутренняя ошибка" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
