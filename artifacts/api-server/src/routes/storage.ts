import { Router, type IRouter, type Request, type Response } from "express";
import { Readable } from "stream";
import {
  RequestUploadUrlBody,
  RequestUploadUrlResponse,
} from "@workspace/api-zod";
import { ObjectStorageService, ObjectNotFoundError } from "../lib/objectStorage";
import { canAccessObject, ObjectPermission, setObjectAclPolicy } from "../lib/objectAcl";
import { db } from "@workspace/db";
import { userSessionsTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";

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

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

/**
 * POST /storage/uploads/request-url
 *
 * Request a presigned URL for file upload.
 * Requires a valid bearer-token session.
 * The client sends JSON metadata (name, size, contentType) — NOT the file.
 * Then uploads the file directly to the returned presigned URL.
 * After upload, the object ACL is set to public/read for the authenticated user.
 */
router.post("/uploads/request-url", async (req: Request, res: Response) => {
  const session = await getSession(req);
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = RequestUploadUrlBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Missing or invalid required fields" });
    return;
  }

  try {
    const { name, size, contentType } = parsed.data;

    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);

    res.json(
      RequestUploadUrlResponse.parse({
        uploadURL,
        objectPath,
        metadata: { name, size, contentType },
        ownerId: session.userId,
      }),
    );
  } catch (error) {
    req.log.error({ err: error }, "Error generating upload URL");
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

/**
 * POST /storage/uploads/confirm
 *
 * After a presigned-URL upload completes, call this to set the ACL policy
 * on the uploaded object (owner = current user, visibility = public for club images).
 */
router.post("/uploads/confirm", async (req: Request, res: Response) => {
  const session = await getSession(req);
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const { objectPath, visibility = "public" } = req.body;
    if (!objectPath) {
      res.status(400).json({ error: "objectPath required" });
      return;
    }

    const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
    await setObjectAclPolicy(objectFile, {
      owner: session.userId,
      visibility: visibility === "private" ? "private" : "public",
    });

    res.json({ success: true });
  } catch (error) {
    req.log.error({ err: error }, "Error confirming upload ACL");
    res.status(500).json({ error: "Failed to confirm upload" });
  }
});

/**
 * GET /storage/public-objects/*
 *
 * Serve public assets from PUBLIC_OBJECT_SEARCH_PATHS.
 * These are unconditionally public — no authentication or ACL checks.
 * IMPORTANT: Always provide this endpoint when object storage is set up.
 */
router.get("/public-objects/*filePath", async (req: Request, res: Response) => {
  try {
    const raw = req.params.filePath;
    const filePath = Array.isArray(raw) ? raw.join("/") : raw;
    const file = await objectStorageService.searchPublicObject(filePath);
    if (!file) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    const response = await objectStorageService.downloadObject(file);

    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));

    if (response.body) {
      const nodeStream = Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    req.log.error({ err: error }, "Error serving public object");
    res.status(500).json({ error: "Failed to serve public object" });
  }
});

/**
 * GET /storage/objects/*
 *
 * Serve object entities from PRIVATE_OBJECT_DIR.
 * Requires a valid bearer-token session, then checks the object's ACL policy:
 * - public objects: readable by any authenticated user
 * - private objects: only the owner can read
 * - no ACL policy set: treated as owner-only (fall back to auth-only access)
 */
router.get("/objects/*path", async (req: Request, res: Response) => {
  try {
    const session = await getSession(req);
    if (!session) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const raw = req.params.path;
    const wildcardPath = Array.isArray(raw) ? raw.join("/") : raw;
    const objectPath = `/objects/${wildcardPath}`;
    const objectFile = await objectStorageService.getObjectEntityFile(objectPath);

    const allowed = await canAccessObject({
      userId: session.userId,
      objectFile,
      requestedPermission: ObjectPermission.READ,
    }).catch(() => null);

    if (allowed === false) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    // allowed === null means no ACL policy set (legacy objects without ACL).
    // We still serve them to any authenticated user to maintain backwards compatibility.

    const response = await objectStorageService.downloadObject(objectFile);

    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));

    if (response.body) {
      const nodeStream = Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      req.log.warn({ err: error }, "Object not found");
      res.status(404).json({ error: "Object not found" });
      return;
    }
    req.log.error({ err: error }, "Error serving object");
    res.status(500).json({ error: "Failed to serve object" });
  }
});

export default router;
