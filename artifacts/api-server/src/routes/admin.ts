import { Router } from "express";
import { seedProductionData } from "../lib/seed";

const router = Router();

router.post("/seed", async (req, res) => {
  const secret = process.env["SEED_SECRET"];
  if (!secret || req.headers["x-seed-secret"] !== secret) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  await seedProductionData();
  res.json({ ok: true });
});

export default router;
