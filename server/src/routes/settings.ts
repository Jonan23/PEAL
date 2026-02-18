import { Hono } from "hono";
import { prisma } from "../config/database.js";
import { authMiddleware, getUser } from "../middleware/auth.js";

export const settings = new Hono();

settings.get("/", authMiddleware, async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  let settings = await prisma.userSettings.findUnique({
    where: { userId: user.userId },
  });

  if (!settings) {
    settings = await prisma.userSettings.create({
      data: { userId: user.userId },
    });
  }

  return c.json({ settings });
});

settings.put("/", authMiddleware, async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const {
    emailNotifications,
    pushNotifications,
    mentorMessagesNotifications,
    supporterUpdatesNotifications,
    weeklyDigest,
    language,
    theme,
  } = body;

  const settings = await prisma.userSettings.upsert({
    where: { userId: user.userId },
    update: {
      emailNotifications,
      pushNotifications,
      mentorMessagesNotifications,
      supporterUpdatesNotifications,
      weeklyDigest,
      language,
      theme,
    },
    create: {
      userId: user.userId,
      emailNotifications: emailNotifications ?? true,
      pushNotifications: pushNotifications ?? true,
      mentorMessagesNotifications: mentorMessagesNotifications ?? true,
      supporterUpdatesNotifications: supporterUpdatesNotifications ?? true,
      weeklyDigest: weeklyDigest ?? false,
      language: language ?? "en",
      theme: theme ?? "system",
    },
  });

  return c.json({ settings });
});

settings.put("/language", authMiddleware, async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const { language } = body;

  if (!language) {
    return c.json({ error: "Language is required" }, 400);
  }

  const settings = await prisma.userSettings.upsert({
    where: { userId: user.userId },
    update: { language },
    create: { userId: user.userId, language },
  });

  return c.json({ settings });
});

settings.put("/theme", authMiddleware, async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const { theme } = body;

  if (!theme) {
    return c.json({ error: "Theme is required" }, 400);
  }

  const settings = await prisma.userSettings.upsert({
    where: { userId: user.userId },
    update: { theme },
    create: { userId: user.userId, theme },
  });

  return c.json({ settings });
});

settings.put("/notifications", authMiddleware, async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const {
    emailNotifications,
    pushNotifications,
    mentorMessagesNotifications,
    supporterUpdatesNotifications,
    weeklyDigest,
  } = body;

  const settings = await prisma.userSettings.upsert({
    where: { userId: user.userId },
    update: {
      emailNotifications,
      pushNotifications,
      mentorMessagesNotifications,
      supporterUpdatesNotifications,
      weeklyDigest,
    },
    create: {
      userId: user.userId,
      emailNotifications: emailNotifications ?? true,
      pushNotifications: pushNotifications ?? true,
      mentorMessagesNotifications: mentorMessagesNotifications ?? true,
      supporterUpdatesNotifications: supporterUpdatesNotifications ?? true,
      weeklyDigest: weeklyDigest ?? false,
    },
  });

  return c.json({ settings });
});
