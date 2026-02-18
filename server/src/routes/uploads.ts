import { Hono } from "hono";
import { authMiddleware, getUser } from "../middleware/auth.js";
import { generateUploadUrl, getStorageService } from "../services/storage.js";

export const uploads = new Hono();

uploads.post("/presigned-url", authMiddleware, async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const { fileName, contentType } = body;

  if (!fileName || !contentType) {
    return c.json({ error: "File name and content type are required" }, 400);
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ];

  if (!allowedTypes.includes(contentType)) {
    return c.json({ error: "File type not allowed" }, 400);
  }

  const maxSize = contentType.startsWith("video")
    ? 500 * 1024 * 1024
    : 10 * 1024 * 1024;

  try {
    const result = await generateUploadUrl(user.userId, fileName, contentType);
    return c.json({
      ...result,
      maxSize,
    });
  } catch (error) {
    console.error("Upload URL generation error:", error);
    return c.json({ error: "Failed to generate upload URL" }, 500);
  }
});

uploads.post("/complete", authMiddleware, async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const { key, fileName, contentType } = body;

  if (!key || !fileName || !contentType) {
    return c.json(
      { error: "Key, file name and content type are required" },
      400,
    );
  }

  const storage = getStorageService();
  const fileUrl = `/uploads/${key}`;

  return c.json({
    url: fileUrl,
    key,
    fileName,
    contentType,
  });
});

uploads.delete("/:key", authMiddleware, async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const key = c.req.param("key");

  if (!key.startsWith(`uploads/${user.userId}/`)) {
    return c.json({ error: "Cannot delete files not owned by you" }, 403);
  }

  try {
    const storage = getStorageService();
    await storage.delete(key);
    return c.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("File deletion error:", error);
    return c.json({ error: "Failed to delete file" }, 500);
  }
});
