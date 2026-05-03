import { Router } from "express";
import { db } from "@workspace/db";
import { bookingsTable, userSessionsTable, clubsTable } from "@workspace/db";
import { eq, and, desc, gt } from "drizzle-orm";

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

router.post("/", async (req, res) => {
  try {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: "Unauthorized" });

    const { club_id, booking_date, child_name, child_age, phone, message, schedule_id } = req.body;

    if (!club_id || !booking_date) {
      return res.status(400).json({ error: "club_id and booking_date required" });
    }

    const inserted = await db
      .insert(bookingsTable)
      .values({
        clubId: club_id,
        userId: session.userId,
        scheduleId: schedule_id || null,
        bookingDate: booking_date,
        childName: child_name || null,
        childAge: child_age ? parseInt(child_age) : null,
        phone: phone || null,
        message: message || null,
        status: "pending",
      })
      .returning();

    return res.json(inserted[0]);
  } catch (err) {
    req.log.error({ err }, "Failed to create booking");
    return res.status(500).json({ error: "Internal error" });
  }
});

router.get("/my-club", async (req, res) => {
  try {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: "Unauthorized" });

    const club = await db
      .select()
      .from(clubsTable)
      .where(eq(clubsTable.userId, session.userId))
      .limit(1)
      .then((rows) => rows[0] || null);

    if (!club) return res.json([]);

    const bookings = await db
      .select()
      .from(bookingsTable)
      .where(eq(bookingsTable.clubId, club.id))
      .orderBy(desc(bookingsTable.createdAt));

    return res.json(bookings);
  } catch (err) {
    req.log.error({ err }, "Failed to get bookings");
    return res.status(500).json({ error: "Internal error" });
  }
});

router.patch("/:id/status", async (req, res) => {
  try {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: "Unauthorized" });

    const { status } = req.body;
    if (!status || !["pending", "confirmed", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const booking = await db
      .select()
      .from(bookingsTable)
      .where(eq(bookingsTable.id, req.params.id))
      .limit(1)
      .then((rows) => rows[0] || null);

    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const club = await db
      .select()
      .from(clubsTable)
      .where(and(eq(clubsTable.id, booking.clubId), eq(clubsTable.userId, session.userId)))
      .limit(1)
      .then((rows) => rows[0] || null);

    if (!club) return res.status(403).json({ error: "Forbidden" });

    await db
      .update(bookingsTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookingsTable.id, req.params.id));

    return res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to update booking");
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;
