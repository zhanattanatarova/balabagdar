import { Router, Request } from "express";
import { db } from "@workspace/db";
import { clubsTable, clubSchedulesTable, userSessionsTable } from "@workspace/db";
import { eq, and, desc, gt } from "drizzle-orm";

const router = Router();

interface ScheduleInput {
  day_of_week: number;
  start_time: string;
  end_time: string;
  max_slots?: number;
}

interface ClubBodyInput {
  name_ru?: string;
  name_kz?: string;
  name_en?: string;
  description_ru?: string;
  description_kz?: string;
  description_en?: string;
  category?: string;
  subcategory?: string;
  city?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  telegram?: string;
  instagram?: string;
  gis_url?: string;
  age_min?: number;
  age_max?: number;
  price_from?: number;
  price_currency?: string;
  avatar_url?: string;
  gallery?: string[];
  instructor?: string;
  teaching_languages?: string[];
  schedules?: ScheduleInput[];
}

async function getSession(req: Request) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return null;
  const now = new Date();
  return db
    .select()
    .from(userSessionsTable)
    .where(and(eq(userSessionsTable.token, token), gt(userSessionsTable.expiresAt, now)))
    .limit(1)
    .then((rows) => rows[0] ?? null);
}

router.get("/", async (req, res) => {
  try {
    const { city, category, subcategory, tag, search, age, limit = "50" } = req.query as Record<string, string>;

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
    if (tag) filtered = filtered.filter((c) => ((c.tags as string[]) || []).includes(tag) || c.subcategory === tag);
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

    return res.json(clubs[0] ?? null);
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
      .then((rows) => rows[0] ?? null);

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

    const { schedules, ...clubData } = req.body as ClubBodyInput & { schedules?: ScheduleInput[] };

    const nameRu = clubData.name_ru?.trim() || null;
    const nameKz = clubData.name_kz?.trim() || null;
    const nameEn = clubData.name_en?.trim() || null;

    if (!nameRu && !nameKz && !nameEn) {
      return res.status(400).json({ error: "Club name is required in at least one language" });
    }

    const payload = {
      userId: session.userId,
      nameRu,
      nameKz,
      nameEn,
      descriptionRu: clubData.description_ru?.trim() || null,
      descriptionKz: clubData.description_kz?.trim() || null,
      descriptionEn: clubData.description_en?.trim() || null,
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
      instructor: clubData.instructor || null,
      teachingLanguages: clubData.teaching_languages || [],
    };

    const inserted = await db.insert(clubsTable).values(payload).returning();
    const club = inserted[0];

    if (schedules && schedules.length > 0) {
      await db.insert(clubSchedulesTable).values(
        schedules.map((s) => ({
          clubId: club.id,
          dayOfWeek: s.day_of_week,
          startTime: s.start_time,
          endTime: s.end_time,
          maxSlots: s.max_slots ?? 10,
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
      .then((rows) => rows[0] ?? null);

    if (!existing) return res.status(404).json({ error: "Club not found" });

    const { schedules, ...clubData } = req.body as ClubBodyInput & { schedules?: ScheduleInput[] };

    const payload = {
      nameRu: clubData.name_ru?.trim() || null,
      nameKz: clubData.name_kz?.trim() || null,
      nameEn: clubData.name_en?.trim() || null,
      descriptionRu: clubData.description_ru?.trim() || null,
      descriptionKz: clubData.description_kz?.trim() || null,
      descriptionEn: clubData.description_en?.trim() || null,
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
      instructor: clubData.instructor || null,
      teachingLanguages: clubData.teaching_languages || [],
      updatedAt: new Date(),
    };

    await db.update(clubsTable).set(payload).where(eq(clubsTable.id, req.params.id));

    await db.delete(clubSchedulesTable).where(eq(clubSchedulesTable.clubId, req.params.id));

    if (schedules && schedules.length > 0) {
      await db.insert(clubSchedulesTable).values(
        schedules.map((s) => ({
          clubId: req.params.id,
          dayOfWeek: s.day_of_week,
          startTime: s.start_time,
          endTime: s.end_time,
          maxSlots: s.max_slots ?? 10,
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
    req.log.error({ err }, "Failed to get schedules");
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;
