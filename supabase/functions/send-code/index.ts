import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

const normalizePhone = (raw: string) => {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `7${digits}`;
  if (digits.length === 11 && digits.startsWith("8")) return `7${digits.slice(1)}`;
  return digits;
};

async function telegramApi(method: string, body: Record<string, unknown> = {}) {
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
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok || data?.ok === false) {
    throw new Error(`Telegram ${method} failed [${res.status}]: ${JSON.stringify(data)}`);
  }

  return data;
}

async function getBotInfo() {
  try {
    const me = await telegramApi("getMe", {});
    const username = me?.result?.username as string | undefined;
    return {
      botUsername: username ?? null,
      botUrl: username ? `https://t.me/${username}` : "https://t.me",
    };
  } catch {
    return {
      botUsername: null,
      botUrl: "https://t.me",
    };
  }
}

async function upsertPhoneChat(
  supabase: ReturnType<typeof createClient>,
  rawPhone: string,
  chatId: string,
) {
  const phone = normalizePhone(rawPhone);
  if (phone.length < 11) return;

  const { data: existing } = await supabase
    .from("phone_verifications")
    .select("id")
    .eq("phone", phone)
    .order("created_at", { ascending: false })
    .limit(1);

  if (existing?.length) {
    await supabase
      .from("phone_verifications")
      .update({ telegram_chat_id: chatId })
      .eq("id", existing[0].id);
  } else {
    await supabase.from("phone_verifications").insert({
      phone,
      telegram_chat_id: chatId,
      code: "0000",
      verified: true,
    });
  }

  console.log(`Linked phone=${phone} to chat_id=${chatId}`);
}

async function processTelegramUpdates(supabase: ReturnType<typeof createClient>) {
  try {
    // getUpdates and webhook are mutually exclusive in Telegram API
    await telegramApi("deleteWebhook", { drop_pending_updates: false });

    const data = await telegramApi("getUpdates", {
      limit: 100,
      timeout: 0,
      allowed_updates: ["message"],
    });

    const updates = (data?.result ?? []) as Array<any>;
    if (!updates.length) return;

    console.log(`Telegram updates fetched: ${updates.length}`);

    let maxId = 0;
    for (const update of updates) {
      if (update.update_id > maxId) maxId = update.update_id;
      const msg = update.message;
      if (!msg || !msg.chat?.id) continue;

      const chatId = String(msg.chat.id);

      // /start — ask for contact quickly
      if (typeof msg.text === "string" && msg.text.startsWith("/start")) {
        await telegramApi("sendMessage", {
          chat_id: chatId,
          text: "👋 Привет! Для входа в BalaHub отправьте свой номер телефона кнопкой ниже.",
          reply_markup: {
            keyboard: [[{ text: "📱 Отправить номер", request_contact: true }]],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        });
      }

      // Preferred: shared Telegram contact
      if (msg.contact?.phone_number) {
        await upsertPhoneChat(supabase, msg.contact.phone_number, chatId);
      }

      // Fallback: user typed phone in text
      if (typeof msg.text === "string") {
        const match = msg.text.match(/\+?\d[\d\s()\-]{8,}/);
        if (match) {
          await upsertPhoneChat(supabase, match[0], chatId);
        }
      }
    }

    // confirm consumed updates
    if (maxId > 0) {
      await telegramApi("getUpdates", { offset: maxId + 1, limit: 1 });
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
    if (!phone || normalizePhone(phone).length < 11) {
      return new Response(JSON.stringify({ error: "Неверный номер телефона" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cleanPhone = normalizePhone(phone);
    const code = String(Math.floor(1000 + Math.random() * 9000));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    await processTelegramUpdates(supabase);

    const { data: candidates } = await supabase
      .from("phone_verifications")
      .select("phone, telegram_chat_id, created_at")
      .not("telegram_chat_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(100);

    const phoneTail = cleanPhone.slice(-10);
    const matched = (candidates ?? []).find((row) =>
      normalizePhone(row.phone).endsWith(phoneTail),
    );
    const chatId = matched?.telegram_chat_id ?? null;

    await supabase.from("phone_verifications").delete().eq("phone", cleanPhone);

    const { error: insertError } = await supabase.from("phone_verifications").insert({
      phone: cleanPhone,
      code,
      telegram_chat_id: chatId,
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
      const botInfo = await getBotInfo();
      console.log(`No Telegram chat_id for phone=${cleanPhone}`);
      return new Response(
        JSON.stringify({
          error: "telegram_not_linked",
          message: "Сначала откройте бота и отправьте номер телефона",
          bot_url: botInfo.botUrl,
          bot_username: botInfo.botUsername,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    await telegramApi("sendMessage", {
      chat_id: chatId,
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
