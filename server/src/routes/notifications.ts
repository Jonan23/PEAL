import { Hono } from "hono";
import { prisma } from "../config/database.js";
import { authMiddleware, getUser } from "../middleware/auth.js";

export const notifications = new Hono();

notifications.get("/", authMiddleware, async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "20");
  const skip = (page - 1) * limit;
  const unreadOnly = c.req.query("unread") === "true";

  const where: Record<string, unknown> = { userId: user.userId };
  if (unreadOnly) where.isRead = false;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      skip,
      take: limit,
      where,
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({
      where: { userId: user.userId, isRead: false },
    }),
  ]);

  return c.json({
    data: notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    unreadCount,
  });
});

notifications.put("/:id/read", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = getUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const notification = await prisma.notification.findUnique({ where: { id } });

  if (!notification) {
    return c.json({ error: "Notification not found" }, 404);
  }

  if (notification.userId !== user.userId) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  return c.json({ message: "Notification marked as read" });
});

notifications.put("/read-all", authMiddleware, async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await prisma.notification.updateMany({
    where: { userId: user.userId, isRead: false },
    data: { isRead: true },
  });

  return c.json({ message: "All notifications marked as read" });
});

notifications.delete("/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = getUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const notification = await prisma.notification.findUnique({ where: { id } });

  if (!notification) {
    return c.json({ error: "Notification not found" }, 404);
  }

  if (notification.userId !== user.userId) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  await prisma.notification.delete({ where: { id } });

  return c.json({ message: "Notification deleted" });
});
