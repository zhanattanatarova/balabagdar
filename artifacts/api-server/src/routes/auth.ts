import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, userRolesTable, userSessionsTable, phoneCodesTable, telegramLinksTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import crypto from "crypto";

const router = Router();

function generateCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

async function sendTelegramOtp(phone: string, code: string): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return false;

  const link = await db
    .select()
    .from(telegramLinksTable)
    .where(eq(telegramLinksTable.phone, phone))
    .limit(1)
    .then((rows) => rows[0] || null);

  if (!link) return false;

  try {
    const text = `🔐 Ваш код для входа в BalaBagdar:\n\n*${code}*\n\nКод действителен 10 минут. Никому не сообщайте его.`;
    const resp = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: link.chatId,
          text,
          parse_mode: "Markdown",
        }),
      }
    );
    const data = await resp.json() as any;
    return data.ok === true;
  } catch {
    return false;
  }
}

router.post("/send-code", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length < 10) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.insert(phoneCodesTable).values({
      phone,
      code,
      expiresAt,
      used: "false",
    });

    const sent = await sendTelegramOtp(phone, code);

    req.log.info({ phone, sent }, "Verification code generated");

    const isDev = process.env.NODE_ENV !== "production";

    if (sent) {
      return res.json({ success: true, channel: "telegram" });
    }

    if (isDev) {
      return res.json({ success: true, dev_code: code, channel: "dev" });
    }

    const hasTelegramToken = !!process.env.TELEGRAM_BOT_TOKEN;
    return res.json({
      success: true,
      channel: "none",
      needsLink: !hasTelegramToken ? false : true,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to send code");
    return res.status(500).json({ error: "Failed to send code" });
  }
});

router.post("/verify-code", async (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ error: "Phone and code are required" });
    }

    const now = new Date();
    const records = await db
      .select()
      .from(phoneCodesTable)
      .where(
        and(
          eq(phoneCodesTable.phone, phone),
          eq(phoneCodesTable.code, code),
          eq(phoneCodesTable.used, "false"),
          gt(phoneCodesTable.expiresAt, now)
        )
      )
      .limit(1);

    if (records.length === 0) {
      return res.status(400).json({ error: "Invalid or expired code" });
    }

    await db
      .update(phoneCodesTable)
      .set({ used: "true" })
      .where(eq(phoneCodesTable.id, records[0].id));

    let user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.phone, phone))
      .limit(1)
      .then((rows) => rows[0] || null);

    if (!user) {
      const inserted = await db
        .insert(usersTable)
        .values({ phone })
        .returning();
      user = inserted[0];
    }

    const token = generateToken();
    const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await db.insert(userSessionsTable).values({
      userId: user.id,
      token,
      expiresAt: sessionExpiresAt,
    });

    const roleRecord = await db
      .select()
      .from(userRolesTable)
      .where(eq(userRolesTable.userId, user.id))
      .limit(1)
      .then((rows) => rows[0] || null);

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        phone: user.phone,
        displayName: user.displayName,
      },
      role: roleRecord?.role || null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to verify code");
    return res.status(500).json({ error: "Failed to verify code" });
  }
});

router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const now = new Date();
    const session = await db
      .select()
      .from(userSessionsTable)
      .where(and(eq(userSessionsTable.token, token), gt(userSessionsTable.expiresAt, now)))
      .limit(1)
      .then((rows) => rows[0] || null);

    if (!session) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, session.userId))
      .limit(1)
      .then((rows) => rows[0] || null);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const roleRecord = await db
      .select()
      .from(userRolesTable)
      .where(eq(userRolesTable.userId, user.id))
      .limit(1)
      .then((rows) => rows[0] || null);

    return res.json({
      user: {
        id: user.id,
        phone: user.phone,
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      role: roleRecord?.role || null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get me");
    return res.status(500).json({ error: "Internal error" });
  }
});

router.post("/assign-role", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const now = new Date();
    const session = await db
      .select()
      .from(userSessionsTable)
      .where(and(eq(userSessionsTable.token, token), gt(userSessionsTable.expiresAt, now)))
      .limit(1)
      .then((rows) => rows[0] || null);

    if (!session) return res.status(401).json({ error: "Unauthorized" });

    const { role } = req.body;
    if (!role || !["parent", "club_owner"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const existing = await db
      .select()
      .from(userRolesTable)
      .where(eq(userRolesTable.userId, session.userId))
      .limit(1)
      .then((rows) => rows[0] || null);

    if (existing) {
      return res.json({ role: existing.role });
    }

    await db.insert(userRolesTable).values({ userId: session.userId, role });
    return res.json({ role });
  } catch (err) {
    req.log.error({ err }, "Failed to assign role");
    return res.status(500).json({ error: "Internal error" });
  }
});

router.put("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const now = new Date();
    const session = await db
      .select()
      .from(userSessionsTable)
      .where(and(eq(userSessionsTable.token, token), gt(userSessionsTable.expiresAt, now)))
      .limit(1)
      .then((rows) => rows[0] || null);

    if (!session) return res.status(401).json({ error: "Unauthorized" });

    const { firstName, lastName } = req.body;

    await db
      .update(usersTable)
      .set({
        firstName: firstName || null,
        lastName: lastName || null,
        displayName: [firstName, lastName].filter(Boolean).join(" ") || null,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, session.userId));

    const updated = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, session.userId))
      .limit(1)
      .then((rows) => rows[0]);

    return res.json({
      user: {
        id: updated.id,
        phone: updated.phone,
        displayName: updated.displayName,
        firstName: updated.firstName,
        lastName: updated.lastName,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update profile");
    return res.status(500).json({ error: "Internal error" });
  }
});

router.post("/signout", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace("Bearer ", "");
    if (token) {
      await db.delete(userSessionsTable).where(eq(userSessionsTable.token, token));
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;
