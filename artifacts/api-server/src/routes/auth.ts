import { Router, Request } from "express";
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

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
  return `${salt}:${hash.toString("hex")}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derivedHash = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), derivedHash);
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
        body: JSON.stringify({ chat_id: link.chatId, text, parse_mode: "Markdown" }),
      }
    );
    const data = await resp.json() as { ok: boolean };
    return data.ok === true;
  } catch {
    return false;
  }
}

async function createSession(userId: string) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await db.insert(userSessionsTable).values({ userId, token, expiresAt });
  return token;
}

async function getSessionUser(req: Request) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return null;
  const now = new Date();
  const session = await db
    .select()
    .from(userSessionsTable)
    .where(and(eq(userSessionsTable.token, token), gt(userSessionsTable.expiresAt, now)))
    .limit(1)
    .then((rows) => rows[0] || null);
  if (!session) return null;
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, session.userId))
    .limit(1)
    .then((rows) => rows[0] || null);
  return user;
}

async function getUserRole(userId: string) {
  const roleRecord = await db
    .select()
    .from(userRolesTable)
    .where(eq(userRolesTable.userId, userId))
    .limit(1)
    .then((rows) => rows[0] || null);
  return roleRecord?.role || null;
}

function serializeUser(user: { id: string; phone: string | null; email: string | null; displayName: string | null; firstName: string | null; lastName: string | null }) {
  return {
    id: user.id,
    phone: user.phone,
    email: user.email,
    displayName: user.displayName,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

// ─── Email registration ───────────────────────────────────────────────────────

router.post("/register-email", async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) {
      return res.status(400).json({ error: "Email и пароль обязательны" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Некорректный email" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Пароль должен быть не менее 6 символов" });
    }

    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1)
      .then((rows) => rows[0] || null);

    if (existing) {
      return res.status(409).json({ error: "Email уже зарегистрирован" });
    }

    const passwordHash = await hashPassword(password);
    const inserted = await db
      .insert(usersTable)
      .values({ email: email.toLowerCase(), passwordHash })
      .returning();
    const user = inserted[0];

    const token = await createSession(user.id);
    return res.json({ success: true, token, user: serializeUser(user), role: null });
  } catch (err) {
    req.log.error({ err }, "Failed to register with email");
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});

// ─── Email login ──────────────────────────────────────────────────────────────

router.post("/login-email", async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) {
      return res.status(400).json({ error: "Email и пароль обязательны" });
    }

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1)
      .then((rows) => rows[0] || null);

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "Неверный email или пароль" });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Неверный email или пароль" });
    }

    const token = await createSession(user.id);
    const role = await getUserRole(user.id);
    return res.json({ success: true, token, user: serializeUser(user), role });
  } catch (err) {
    req.log.error({ err }, "Failed to login with email");
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});

// ─── Set credentials (after Telegram login) ───────────────────────────────────

router.put("/set-credentials", async (req, res) => {
  try {
    const user = await getSessionUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) {
      return res.status(400).json({ error: "Email и пароль обязательны" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Некорректный email" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Пароль должен быть не менее 6 символов" });
    }

    const emailTaken = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1)
      .then((rows) => rows[0] || null);

    if (emailTaken && emailTaken.id !== user.id) {
      return res.status(409).json({ error: "Email уже занят другим аккаунтом" });
    }

    const passwordHash = await hashPassword(password);
    await db
      .update(usersTable)
      .set({ email: email.toLowerCase(), passwordHash, updatedAt: new Date() })
      .where(eq(usersTable.id, user.id));

    return res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to set credentials");
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});

// ─── Check if phone exists ────────────────────────────────────────────────────

router.post("/check-phone", async (req, res) => {
  try {
    const { phone } = req.body as { phone: string };
    if (!phone) return res.status(400).json({ error: "Phone required" });
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.phone, phone))
      .limit(1)
      .then((rows) => rows[0] || null);
    const role = user ? await getUserRole(user.id) : null;
    return res.json({ exists: !!user, hasRole: !!role, hasName: !!(user?.displayName) });
  } catch (err) {
    req.log.error({ err }, "Failed to check phone");
    return res.status(500).json({ error: "Internal error" });
  }
});

// ─── Phone OTP ────────────────────────────────────────────────────────────────

router.post("/send-code", async (req, res) => {
  try {
    const { phone } = req.body as { phone: string };
    if (!phone || phone.length < 10) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.insert(phoneCodesTable).values({ phone, code, expiresAt, used: "false" });

    const sent = await sendTelegramOtp(phone, code);

    req.log.info({ phone, sent }, "Verification code generated");

    const isDev = process.env.NODE_ENV !== "production";
    const deepLink = `https://t.me/balabagdar_bot?start=login_${phone}`;

    if (sent) {
      return res.json({ success: true, channel: "telegram" });
    }
    if (isDev) {
      return res.json({ success: true, dev_code: code, channel: "dev", deepLink });
    }
    return res.json({ success: true, channel: "none", deepLink });
  } catch (err) {
    req.log.error({ err }, "Failed to send code");
    return res.status(500).json({ error: "Failed to send code" });
  }
});

router.post("/verify-code", async (req, res) => {
  try {
    const { phone, code } = req.body as { phone: string; code: string };
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
      const inserted = await db.insert(usersTable).values({ phone }).returning();
      user = inserted[0];
    }

    const token = await createSession(user.id);
    const role = await getUserRole(user.id);

    return res.json({ success: true, token, user: serializeUser(user), role });
  } catch (err) {
    req.log.error({ err }, "Failed to verify code");
    return res.status(500).json({ error: "Failed to verify code" });
  }
});

// ─── Me / Profile / Role / Signout ───────────────────────────────────────────

router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const now = new Date();
    const session = await db
      .select()
      .from(userSessionsTable)
      .where(and(eq(userSessionsTable.token, token), gt(userSessionsTable.expiresAt, now)))
      .limit(1)
      .then((rows) => rows[0] || null);

    if (!session) return res.status(401).json({ error: "Invalid or expired session" });

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, session.userId))
      .limit(1)
      .then((rows) => rows[0] || null);

    if (!user) return res.status(401).json({ error: "User not found" });

    const role = await getUserRole(user.id);
    return res.json({ user: serializeUser(user), role });
  } catch (err) {
    req.log.error({ err }, "Failed to get me");
    return res.status(500).json({ error: "Internal error" });
  }
});

router.post("/assign-role", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const now = new Date();
    const session = await db
      .select()
      .from(userSessionsTable)
      .where(and(eq(userSessionsTable.token, token), gt(userSessionsTable.expiresAt, now)))
      .limit(1)
      .then((rows) => rows[0] || null);

    if (!session) return res.status(401).json({ error: "Unauthorized" });

    const { role } = req.body as { role: string };
    if (!role || !["parent", "club_owner"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const existing = await db
      .select()
      .from(userRolesTable)
      .where(eq(userRolesTable.userId, session.userId))
      .limit(1)
      .then((rows) => rows[0] || null);

    if (existing) return res.json({ role: existing.role });

    await db.insert(userRolesTable).values({ userId: session.userId, role: role as "parent" | "club_owner" });
    return res.json({ role });
  } catch (err) {
    req.log.error({ err }, "Failed to assign role");
    return res.status(500).json({ error: "Internal error" });
  }
});

router.put("/profile", async (req, res) => {
  try {
    const user = await getSessionUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { firstName, lastName } = req.body as { firstName?: string; lastName?: string };
    await db
      .update(usersTable)
      .set({
        firstName: firstName || null,
        lastName: lastName || null,
        displayName: [firstName, lastName].filter(Boolean).join(" ") || null,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, user.id));

    const updated = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, user.id))
      .limit(1)
      .then((rows) => rows[0]);

    return res.json({ user: serializeUser(updated) });
  } catch (err) {
    req.log.error({ err }, "Failed to update profile");
    return res.status(500).json({ error: "Internal error" });
  }
});

router.post("/signout", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token) {
      await db.delete(userSessionsTable).where(eq(userSessionsTable.token, token));
    }
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;
