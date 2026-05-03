import { Router } from "express";
import { db } from "@workspace/db";
import { reviewsTable, reviewReportsTable, userSessionsTable, clubsTable, usersTable } from "@workspace/db";
import { eq, and, desc, sql, gt } from "drizzle-orm";

const router = Router();

async function getSession(req: any) {
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

router.get("/club/:clubId", async (req, res) => {
  try {
    const reviews = await db
      .select()
      .from(reviewsTable)
      .where(and(eq(reviewsTable.clubId, req.params.clubId), eq(reviewsTable.isHidden, false)))
      .orderBy(desc(reviewsTable.createdAt));

    return res.json(reviews);
  } catch (err) {
    req.log.error({ err }, "Failed to get reviews");
    return res.status(500).json({ error: "Internal error" });
  }
});

router.post("/club/:clubId", async (req, res) => {
  try {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: "Unauthorized" });

    const { rating, comment, author_name } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be 1-5" });
    }

    const existing = await db
      .select()
      .from(reviewsTable)
      .where(and(eq(reviewsTable.clubId, req.params.clubId), eq(reviewsTable.userId, session.userId)))
      .limit(1)
      .then((rows) => rows[0] || null);

    if (existing) {
      await db
        .update(reviewsTable)
        .set({ rating, comment: comment || "", authorName: author_name || null, updatedAt: new Date() })
        .where(eq(reviewsTable.id, existing.id));
    } else {
      await db.insert(reviewsTable).values({
        clubId: req.params.clubId,
        userId: session.userId,
        rating,
        comment: comment || "",
        authorName: author_name || null,
      });
    }

    await updateClubRating(req.params.clubId);

    return res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to post review");
    return res.status(500).json({ error: "Internal error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: "Unauthorized" });

    const review = await db
      .select()
      .from(reviewsTable)
      .where(and(eq(reviewsTable.id, req.params.id), eq(reviewsTable.userId, session.userId)))
      .limit(1)
      .then((rows) => rows[0] || null);

    if (!review) return res.status(404).json({ error: "Review not found" });

    await db.delete(reviewsTable).where(eq(reviewsTable.id, req.params.id));
    await updateClubRating(review.clubId);

    return res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete review");
    return res.status(500).json({ error: "Internal error" });
  }
});

router.post("/:id/report", async (req, res) => {
  try {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: "Unauthorized" });

    const { reason } = req.body;

    try {
      await db.insert(reviewReportsTable).values({
        reviewId: req.params.id,
        userId: session.userId,
        reason: reason || "",
      });
    } catch (e: any) {
      if (e.message?.includes("duplicate") || e.code === "23505") {
        return res.json({ success: true });
      }
      throw e;
    }

    return res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to report review");
    return res.status(500).json({ error: "Internal error" });
  }
});

async function updateClubRating(clubId: string) {
  const reviews = await db
    .select()
    .from(reviewsTable)
    .where(and(eq(reviewsTable.clubId, clubId), eq(reviewsTable.isHidden, false)));

  if (reviews.length === 0) {
    await db.update(clubsTable).set({ rating: null, reviewsCount: 0 }).where(eq(clubsTable.id, clubId));
  } else {
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await db
      .update(clubsTable)
      .set({ rating: Math.round(avg * 10) / 10, reviewsCount: reviews.length })
      .where(eq(clubsTable.id, clubId));
  }
}

export default router;
