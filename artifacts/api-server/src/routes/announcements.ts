import { Router } from "express";
import { db } from "@workspace/db";
import { announcementsTable } from "@workspace/db";
import { eq, and, gt, desc } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { city, category } = req.query as Record<string, string>;
    const now = new Date();

    const conditions = [gt(announcementsTable.expiresAt, now)];
    if (city) conditions.push(eq(announcementsTable.city, city));
    if (category) conditions.push(eq(announcementsTable.category, category));

    const rows = await db
      .select()
      .from(announcementsTable)
      .where(and(...conditions))
      .orderBy(desc(announcementsTable.createdAt))
      .limit(100);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { category, title, body, name, phone, city } = req.body as {
      category: string;
      title: string;
      body: string;
      name: string;
      phone?: string;
      city: string;
    };

    if (!title?.trim() || !body?.trim() || !name?.trim() || !city?.trim()) {
      return res.status(400).json({ error: "title, body, name and city are required" });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const [row] = await db
      .insert(announcementsTable)
      .values({
        category: category || "other",
        title: title.trim(),
        body: body.trim(),
        name: name.trim(),
        phone: phone?.trim() || null,
        city: city.trim(),
        expiresAt,
      })
      .returning();

    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: "Failed to create announcement" });
  }
});

export default router;
