import { Router } from "express";
import multer from "multer";
import { db } from "@workspace/db";
import { userSessionsTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import { ObjectStorageService } from "../lib/objectStorage";

type UserSession = typeof userSessionsTable.$inferSelect;

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const storageService = new ObjectStorageService();

async function getSession(req: { headers: { authorization?: string } }): Promise<UserSession | null> {
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

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: "Unauthorized" });

    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file provided" });

    const uploadUrl = await storageService.getObjectEntityUploadURL();

    const response = await fetch(uploadUrl, {
      method: "PUT",
      body: file.buffer,
      headers: { "Content-Type": file.mimetype },
    });

    if (!response.ok) {
      return res.status(500).json({ error: "Upload failed" });
    }

    const objectPath = storageService.normalizeObjectEntityPath(uploadUrl);

    // Set ACL to public so <img> tags can display the uploaded image without auth
    await storageService.trySetObjectEntityAclPolicy(uploadUrl, {
      owner: session.userId,
      visibility: "public",
    });

    const publicUrl = `/api/storage${objectPath}`;
    return res.json({ url: publicUrl, objectPath });
  } catch (err) {
    req.log.error({ err }, "Failed to upload file");
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;
