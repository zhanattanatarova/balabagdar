import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateCode, hashCode, normalizePhone, OTP_MAX_ATTEMPTS, OTP_RESEND_SECONDS } from "../_shared/otp.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

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

  await supabase.from("telegram_phone_links").upsert({ phone, telegram_chat_id: chatId, updated_at: new Date().toISOString() }, { onConflict: "phone" });

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
          text: "👋 Привет! Для входа в BalaHub нажмите кнопку ниже, чтобы поделиться своим номером телефона. Номера, отправленные текстом, не принимаются в целях безопасности.",
          reply_markup: {
            keyboard: [[{ text: "📱 Отправить номер", request_contact: true }]],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        });
      }

      // ONLY accept Telegram-verified contact shares — never trust free-text phone numbers,
      // since anyone could type someone else's number and hijack their OTP.
      if (msg.contact?.phone_number && String(msg.contact.user_id) === String(msg.from?.id)) {
        await upsertPhoneChat(supabase, msg.contact.phone_number, chatId);
      } else if (msg.contact?.phone_number) {
        await telegramApi("sendMessage", {
          chat_id: chatId,
          text: "⚠️ Можно отправить только свой собственный номер через кнопку ниже.",
        });
      } else if (typeof msg.text === "string" && !msg.text.startsWith("/")) {
        await telegramApi("sendMessage", {
          chat_id: chatId,
          text: "📱 Пожалуйста, отправьте номер кнопкой «Отправить номер» — текстовые сообщения с номером не принимаются.",
          reply_markup: {
            keyboard: [[{ text: "📱 Отправить номер", request_contact: true }]],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        });
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
    const { phone, mode } = await req.json();
    const purpose = mode === "reset" ? "reset" : "register";
    if (!phone || normalizePhone(phone).length < 11) {
      return new Response(JSON.stringify({ error: "Неверный номер телефона" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cleanPhone = normalizePhone(phone);
    const code = generateCode();
    const OTP_HASH_SECRET = Deno.env.get("OTP_HASH_SECRET");
    if (!OTP_HASH_SECRET) throw new Error("OTP_HASH_SECRET is not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const phoneTail = cleanPhone.slice(-10);

    const lookupChatId = async () => {
      const { data: candidates } = await supabase
        .from("telegram_phone_links")
        .select("phone, telegram_chat_id")
        .like("phone", `%${phoneTail}`)
        .limit(5);
      return candidates?.find((row) => normalizePhone(row.phone).endsWith(phoneTail))?.telegram_chat_id ?? null;
    };

    // Fast path: if the phone is already linked to a chat, skip the slow
    // getUpdates poll entirely so the OTP goes out immediately.
    let chatId = await lookupChatId();
    if (!chatId) {
      await processTelegramUpdates(supabase);
      chatId = await lookupChatId();
    }

    if (!chatId) {
      const botInfo = await getBotInfo();
      return new Response(JSON.stringify({ error: "telegram_not_linked", message: "Сначала откройте бота и отправьте номер телефона", bot_url: botInfo.botUrl, bot_username: botInfo.botUsername }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: limit, error: limitError } = await supabase.rpc("otp_send_allowed", { _phone: cleanPhone });
    if (limitError) throw new Error(limitError.message);
    if (!limit?.allowed) {
      return new Response(JSON.stringify({ error: "rate_limited", resend_in: limit?.retry_after ?? 60 }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { error: insertError } = await supabase.rpc("otp_issue", { _phone: cleanPhone, _purpose: purpose, _hash: await hashCode(cleanPhone, purpose, code, OTP_HASH_SECRET) });
    if (insertError) {
      console.error("OTP issue error:", insertError.message);
      return new Response(JSON.stringify({ error: "Не удалось создать код" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    await telegramApi("sendMessage", {
      chat_id: chatId,
      text: `🔐 Ваш код для BalaHub: *${code}*\n\nКод действует 5 минут. Никому не сообщайте его.`,
      parse_mode: "Markdown",
    });


    return new Response(JSON.stringify({ success: true, message: "Код отправлен в Telegram", remaining_attempts: OTP_MAX_ATTEMPTS, resend_in: OTP_RESEND_SECONDS }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Внутренняя ошибка" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
