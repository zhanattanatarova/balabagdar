import { Router, Request } from "express";
import { db } from "@workspace/db";
import { clubsTable, clubSchedulesTable, userSessionsTable } from "@workspace/db";
import { eq, and, desc, gt, sql } from "drizzle-orm";

const router = Router();

async function getSession(req: Request) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return null;
  const now = new Date();
  return db
    .select()
    .from(userSessionsTable)
    .where(and(eq(userSessionsTable.token, token), gt(userSessionsTable.expiresAt, now)))
    .limit(1)
    .then((rows) => rows[0] || null);
}

router.get("/", async (req, res) => {
  try {
    const { city, category, subcategory, search, age, limit = "50" } = req.query as Record<string, string>;

    const clubs = await db
      .select()
      .from(clubsTable)
      .where(eq(clubsTable.isActive, true))
      .orderBy(desc(clubsTable.rating))
      .limit(parseInt(limit) || 50);

    let filtered = clubs;
    if (city) filtered = filtered.filter((c) => c.city === city);
    if (category) filtered = filtered.filter((c) => c.category === category);
    if (subcategory) filtered = filtered.filter((c) => c.subcategory === subcategory);
    if (age) {
      const a = parseInt(age);
      if (!isNaN(a)) {
        filtered = filtered.filter((c) => (c.ageMin ?? 0) <= a && (c.ageMax ?? 99) >= a);
      }
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.nameRu?.toLowerCase().includes(s) ||
          c.nameKz?.toLowerCase().includes(s) ||
          c.nameEn?.toLowerCase().includes(s) ||
          c.address?.toLowerCase().includes(s)
      );
    }

    return res.json(filtered);
  } catch (err) {
    req.log.error({ err }, "Failed to get clubs");
    return res.status(500).json({ error: "Internal error" });
  }
});

router.get("/my", async (req, res) => {
  try {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: "Unauthorized" });

    const clubs = await db
      .select()
      .from(clubsTable)
      .where(eq(clubsTable.userId, session.userId))
      .limit(1);

    return res.json(clubs[0] || null);
  } catch (err) {
    req.log.error({ err }, "Failed to get my club");
    return res.status(500).json({ error: "Internal error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const club = await db
      .select()
      .from(clubsTable)
      .where(eq(clubsTable.id, req.params.id))
      .limit(1)
      .then((rows) => rows[0] || null);

    if (!club) return res.status(404).json({ error: "Club not found" });

    const schedules = await db
      .select()
      .from(clubSchedulesTable)
      .where(eq(clubSchedulesTable.clubId, club.id))
      .orderBy(clubSchedulesTable.dayOfWeek);

    return res.json({ ...club, schedules });
  } catch (err) {
    req.log.error({ err }, "Failed to get club");
    return res.status(500).json({ error: "Internal error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: "Unauthorized" });

    const { schedules, ...clubData } = req.body;

    const payload: any = {
      userId: session.userId,
      nameRu: clubData.name_ru || null,
      nameKz: clubData.name_kz || null,
      nameEn: clubData.name_en || null,
      descriptionRu: clubData.description_ru || null,
      descriptionKz: clubData.description_kz || null,
      descriptionEn: clubData.description_en || null,
      category: clubData.category || "other",
      subcategory: clubData.subcategory || null,
      city: clubData.city || "Астана",
      address: clubData.address || null,
      phone: clubData.phone || null,
      whatsapp: clubData.whatsapp || null,
      telegram: clubData.telegram || null,
      instagram: clubData.instagram || null,
      gisUrl: clubData.gis_url || null,
      ageMin: clubData.age_min ?? 3,
      ageMax: clubData.age_max ?? 18,
      priceFrom: clubData.price_from ?? 0,
      priceCurrency: clubData.price_currency || "₸",
      avatarUrl: clubData.avatar_url || null,
      gallery: clubData.gallery || [],
    };

    // Validate that at least one name is provided
    if (!payload.nameRu && !payload.nameKz && !payload.nameEn) {
      return res.status(400).json({ error: "Club name is required" });
    }

    // Use drizzle for main fields, then patch extra columns via raw SQL
    const inserted = await db.insert(clubsTable).values(payload).returning();
    const club = inserted[0];

    // Patch instructor + teaching_languages via raw SQL (not in drizzle schema yet)
    if (clubData.instructor !== undefined || clubData.teaching_languages !== undefined) {
      const instructor = clubData.instructor || null;
      const tlangs = JSON.stringify(clubData.teaching_languages || []);
      const cid = club.id;
      await db.execute(sql`UPDATE clubs SET instructor = ${instructor}, teaching_languages = ${tlangs}::json WHERE id = ${cid}`);
    }

    if (schedules && schedules.length > 0) {
      await db.insert(clubSchedulesTable).values(
        schedules.map((s: any) => ({
          clubId: club.id,
          dayOfWeek: s.day_of_week,
          startTime: s.start_time,
          endTime: s.end_time,
          maxSlots: s.max_slots || 10,
        }))
      );
    }

    return res.json(club);
  } catch (err) {
    req.log.error({ err }, "Failed to create club");
    return res.status(500).json({ error: "Internal error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: "Unauthorized" });

    const existing = await db
      .select()
      .from(clubsTable)
      .where(and(eq(clubsTable.id, req.params.id), eq(clubsTable.userId, session.userId)))
      .limit(1)
      .then((rows) => rows[0] || null);

    if (!existing) return res.status(404).json({ error: "Club not found" });

    const { schedules, ...clubData } = req.body;

    const payload: any = {
      nameRu: clubData.name_ru || null,
      nameKz: clubData.name_kz || null,
      nameEn: clubData.name_en || null,
      descriptionRu: clubData.description_ru || null,
      descriptionKz: clubData.description_kz || null,
      descriptionEn: clubData.description_en || null,
      category: clubData.category || "other",
      subcategory: clubData.subcategory || null,
      city: clubData.city || "Астана",
      address: clubData.address || null,
      phone: clubData.phone || null,
      whatsapp: clubData.whatsapp || null,
      telegram: clubData.telegram || null,
      instagram: clubData.instagram || null,
      gisUrl: clubData.gis_url || null,
      ageMin: clubData.age_min ?? 3,
      ageMax: clubData.age_max ?? 18,
      priceFrom: clubData.price_from ?? 0,
      priceCurrency: clubData.price_currency || "₸",
      avatarUrl: clubData.avatar_url || null,
      gallery: clubData.gallery || [],
      updatedAt: new Date(),
    };

    await db.update(clubsTable).set(payload).where(eq(clubsTable.id, req.params.id));

    // Patch instructor + teaching_languages via raw SQL
    const instructor2 = clubData.instructor || null;
    const tlangs2 = JSON.stringify(clubData.teaching_languages || []);
    const pid = req.params.id;
    await db.execute(sql`UPDATE clubs SET instructor = ${instructor2}, teaching_languages = ${tlangs2}::json WHERE id = ${pid}`);

    await db.delete(clubSchedulesTable).where(eq(clubSchedulesTable.clubId, req.params.id));

    if (schedules && schedules.length > 0) {
      await db.insert(clubSchedulesTable).values(
        schedules.map((s: any) => ({
          clubId: req.params.id,
          dayOfWeek: s.day_of_week,
          startTime: s.start_time,
          endTime: s.end_time,
          maxSlots: s.max_slots || 10,
        }))
      );
    }

    return res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to update club");
    return res.status(500).json({ error: "Internal error" });
  }
});

router.get("/:id/schedules", async (req, res) => {
  try {
    const schedules = await db
      .select()
      .from(clubSchedulesTable)
      .where(eq(clubSchedulesTable.clubId, req.params.id))
      .orderBy(clubSchedulesTable.dayOfWeek);

    return res.json(schedules);
  } catch (err) {
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;
