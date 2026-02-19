import { Hono } from "hono";
import { prisma } from "../config/database.js";
import { authMiddleware, getUser } from "../middleware/auth.js";

export const moderation = new Hono();

moderation.use("*", authMiddleware);

moderation.post("/report", async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const body = await c.req.json();
  const { contentType, contentId, reason, description } = body;

  if (!contentType || !contentId || !reason) {
    return c.json(
      { error: "Content type, content ID, and reason are required" },
      400,
    );
  }

  const validContentTypes = [
    "video",
    "comment",
    "user",
    "funding_request",
    "success_story",
  ];
  if (!validContentTypes.includes(contentType)) {
    return c.json({ error: "Invalid content type" }, 400);
  }

  const existingReport = await prisma.moderationReport.findFirst({
    where: {
      reporterId: user.userId,
      contentType,
      contentId,
      status: "pending",
    },
  });

  if (existingReport) {
    return c.json({ error: "You have already reported this content" }, 400);
  }

  const report = await prisma.moderationReport.create({
    data: {
      reporterId: user.userId,
      contentType,
      contentId,
      reason,
      description,
    },
  });

  return c.json({ report }, 201);
});

moderation.get("/my-reports", async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const reports = await prisma.moderationReport.findMany({
    where: { reporterId: user.userId },
    orderBy: { createdAt: "desc" },
  });

  return c.json({ reports });
});

moderation.get("/pending", async (c) => {
  const user = getUser(c);
  if (!user || user.role !== "admin") {
    return c.json({ error: "Admin access required" }, 403);
  }

  const reports = await prisma.moderationReport.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "desc" },
  });

  return c.json({ reports });
});

moderation.post("/:id/review", async (c) => {
  const user = getUser(c);
  const reportId = c.req.param("id");
  const body = await c.req.json();
  const { action } = body;

  if (!user || user.role !== "admin") {
    return c.json({ error: "Admin access required" }, 403);
  }

  const validActions = ["dismiss", "warn", "remove_content", "ban_user"];
  if (!action || !validActions.includes(action)) {
    return c.json(
      {
        error:
          "Valid action required (dismiss, warn, remove_content, ban_user)",
      },
      400,
    );
  }

  const report = await prisma.moderationReport.findUnique({
    where: { id: reportId },
  });

  if (!report) {
    return c.json({ error: "Report not found" }, 404);
  }

  if (action === "remove_content") {
    if (report.contentType === "video") {
      await prisma.video.delete({ where: { id: report.contentId } });
    } else if (report.contentType === "comment") {
      await prisma.videoComment.delete({ where: { id: report.contentId } });
    } else if (report.contentType === "funding_request") {
      await prisma.fundingRequest.update({
        where: { id: report.contentId },
        data: { status: "removed" },
      });
    } else if (report.contentType === "success_story") {
      await prisma.successStory.delete({ where: { id: report.contentId } });
    }
  }

  if (action === "ban_user") {
    await prisma.user.update({
      where: { id: report.contentId },
      data: { role: "banned" },
    });
  }

  const updatedReport = await prisma.moderationReport.update({
    where: { id: reportId },
    data: {
      status: "reviewed",
      reviewedBy: user.userId,
      reviewedAt: new Date(),
      action,
    },
  });

  return c.json({ report: updatedReport });
});

moderation.get("/stats", async (c) => {
  const user = getUser(c);
  if (!user || user.role !== "admin") {
    return c.json({ error: "Admin access required" }, 403);
  }

  const [pending, reviewed, dismissed, actioned] = await Promise.all([
    prisma.moderationReport.count({ where: { status: "pending" } }),
    prisma.moderationReport.count({ where: { status: "reviewed" } }),
    prisma.moderationReport.count({
      where: { status: "reviewed", action: "dismiss" },
    }),
    prisma.moderationReport.count({
      where: { status: "reviewed", action: { not: "dismiss" } },
    }),
  ]);

  return c.json({ stats: { pending, reviewed, dismissed, actioned } });
});
