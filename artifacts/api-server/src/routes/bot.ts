import { Router } from "express";
import { db } from "@workspace/db";
import { telegramLinksTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

async function sendMessage(chatId: string, text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return;
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
  });
}

router.post("/webhook", async (req, res) => {
  try {
    const update = req.body;
    const message = update?.message;
    if (!message) return res.json({ ok: true });

    const chatId = String(message.chat?.id);
    const text: string = message.text || "";
    const contact = message.contact;

    if (contact) {
      const rawPhone = contact.phone_number?.replace(/\D/g, "") || "";
      const phone = rawPhone.startsWith("7") ? rawPhone : rawPhone.startsWith("8") ? "7" + rawPhone.slice(1) : rawPhone;

      await db
        .insert(telegramLinksTable)
        .values({ phone, chatId })
        .onConflictDoUpdate({
          target: telegramLinksTable.phone,
          set: { chatId },
        });

      await sendMessage(
        chatId,
        `✅ Ваш номер *+${phone}* привязан к Telegram!\n\nТеперь вы можете войти на сайте [balabagdar.kz](https://balabagdar.kz) и получить код в этом чате.`
      );
      return res.json({ ok: true });
    }

    if (text.startsWith("/start")) {
      await sendMessage(
        chatId,
        `👋 Добро пожаловать в *BalaBagdar*!\n\nЧтобы войти на сайт, нужно привязать ваш номер телефона.\n\n📱 Нажмите кнопку ниже, чтобы поделиться номером.`
      );

      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (botToken) {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "Нажмите кнопку, чтобы привязать номер телефона:",
            reply_markup: {
              keyboard: [[{ text: "📱 Поделиться номером", request_contact: true }]],
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          }),
        });
      }
      return res.json({ ok: true });
    }

    await sendMessage(chatId, "Нажмите /start чтобы привязать свой номер телефона.");
    return res.json({ ok: true });
  } catch (err) {
    return res.json({ ok: true });
  }
});

export default router;
