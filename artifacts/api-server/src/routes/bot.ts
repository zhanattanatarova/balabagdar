import { Router } from "express";
import { db } from "@workspace/db";
import { telegramLinksTable, phoneCodesTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";

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

async function sendPendingCode(chatId: string, phone: string) {
  const now = new Date();
  const pending = await db
    .select()
    .from(phoneCodesTable)
    .where(
      and(
        eq(phoneCodesTable.phone, phone),
        eq(phoneCodesTable.used, "false"),
        gt(phoneCodesTable.expiresAt, now)
      )
    )
    .orderBy(phoneCodesTable.expiresAt)
    .limit(1)
    .then((rows) => rows[0] || null);

  if (pending) {
    await sendMessage(
      chatId,
      `🔐 Ваш код для входа в *BalaBagdar*:\n\n*${pending.code}*\n\nКод действителен 10 минут. Никому не сообщайте его.`
    );
    return true;
  }
  return false;
}

router.post("/webhook", async (req, res) => {
  try {
    const update = req.body;
    const message = update?.message;
    if (!message) return res.json({ ok: true });

    const chatId = String(message.chat?.id);
    const text: string = message.text || "";
    const contact = message.contact;

    // User shared contact via button — link phone and send pending code if any
    if (contact) {
      const rawPhone = contact.phone_number?.replace(/\D/g, "") || "";
      const phone = rawPhone.startsWith("7") ? rawPhone : rawPhone.startsWith("8") ? "7" + rawPhone.slice(1) : rawPhone;

      await db
        .insert(telegramLinksTable)
        .values({ phone, chatId })
        .onConflictDoUpdate({ target: telegramLinksTable.phone, set: { chatId } });

      const codeSent = await sendPendingCode(chatId, phone);
      if (!codeSent) {
        await sendMessage(
          chatId,
          `✅ Номер *+${phone}* привязан!\n\nТеперь вы можете войти на [balabagdar.kz](https://balabagdar.kz) — код придёт сюда.`
        );
      }
      return res.json({ ok: true });
    }

    if (text.startsWith("/start")) {
      const param = text.split(" ")[1] || "";

      // Deep-link login: /start login_77071234567
      if (param.startsWith("login_")) {
        const phone = param.replace("login_", "").replace(/\D/g, "");
        if (phone.length >= 10) {
          await db
            .insert(telegramLinksTable)
            .values({ phone, chatId })
            .onConflictDoUpdate({ target: telegramLinksTable.phone, set: { chatId } });

          const codeSent = await sendPendingCode(chatId, phone);
          if (!codeSent) {
            await sendMessage(chatId, `✅ Номер привязан! Вернитесь на сайт и нажмите «Получить код» ещё раз.`);
          }
          return res.json({ ok: true });
        }
      }

      // Regular /start — ask to share contact
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      await sendMessage(chatId, `👋 Добро пожаловать в *BalaBagdar*!\n\nЧтобы войти на сайт, поделитесь номером телефона — нажмите кнопку ниже.`);
      if (botToken) {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "📱 Нажмите кнопку:",
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
