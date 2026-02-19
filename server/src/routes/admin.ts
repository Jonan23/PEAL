import { Hono } from "hono";
import { prisma } from "../config/database.js";
import { authMiddleware, getUser } from "../middleware/auth.js";

export const admin = new Hono();

admin.use("*", authMiddleware);

admin.use("*", async (c, next) => {
  const user = getUser(c);
  if (!user || user.role !== "admin") {
    return c.json({ error: "Admin access required" }, 403);
  }
  await next();
});

admin.get("/dashboard", async (c) => {
  const [
    totalUsers,
    activeUsers,
    totalVideos,
    totalFundingRequests,
    totalDonations,
    totalMentors,
    pendingReports,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { emailVerified: true } }),
    prisma.video.count(),
    prisma.fundingRequest.count({ where: { status: "active" } }),
    prisma.fundingDonation.count(),
    prisma.mentorProfile.count({ where: { availability: "available" } }),
    prisma.moderationReport.count({ where: { status: "pending" } }),
  ]);

  const donationSum = await prisma.fundingDonation.aggregate({
    _sum: { amount: true },
  });

  return c.json({
    stats: {
      totalUsers,
      activeUsers,
      totalVideos,
      totalFundingRequests,
      totalDonations,
      totalDonationAmount: donationSum._sum.amount || 0,
      totalMentors,
      pendingReports,
    },
  });
});

admin.get("/users", async (c) => {
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "20");
  const search = c.req.query("search");
  const role = c.req.query("role");

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }
  if (role) {
    where.role = role;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: {
            videos: true,
            fundingRequests: true,
            fundingDonations: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return c.json({ users, total, page, limit });
});

admin.patch("/users/:id", async (c) => {
  const userId = c.req.param("id");
  const body = await c.req.json();
  const { role, emailVerified } = body;

  const updateData: any = {};
  if (role) updateData.role = role;
  if (emailVerified !== undefined) updateData.emailVerified = emailVerified;

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return c.json({ user });
});

admin.delete("/users/:id", async (c) => {
  const userId = c.req.param("id");

  await prisma.user.delete({ where: { id: userId } });

  return c.json({ success: true });
});

admin.get("/videos", async (c) => {
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "20");

  const [videos, total] = await Promise.all([
    prisma.video.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.video.count(),
  ]);

  return c.json({ videos, total, page, limit });
});

admin.delete("/videos/:id", async (c) => {
  const videoId = c.req.param("id");

  await prisma.video.delete({ where: { id: videoId } });

  return c.json({ success: true });
});

admin.get("/funding-requests", async (c) => {
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "20");
  const status = c.req.query("status");

  const where: any = {};
  if (status) where.status = status;

  const [requests, total] = await Promise.all([
    prisma.fundingRequest.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, email: true } },
        _count: { select: { donations: true } },
      },
    }),
    prisma.fundingRequest.count({ where }),
  ]);

  return c.json({ requests, total, page, limit });
});

admin.patch("/funding-requests/:id", async (c) => {
  const requestId = c.req.param("id");
  const body = await c.req.json();
  const { status } = body;

  const request = await prisma.fundingRequest.update({
    where: { id: requestId },
    data: { status },
  });

  return c.json({ request });
});

admin.get("/reports", async (c) => {
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "20");
  const status = c.req.query("status");

  const where: any = {};
  if (status) where.status = status;

  const [reports, total] = await Promise.all([
    prisma.moderationReport.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.moderationReport.count({ where }),
  ]);

  return c.json({ reports, total, page, limit });
});

admin.get("/analytics", async (c) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [newUsers, newVideos, newDonations, donationTotal] = await Promise.all([
    prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.video.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.fundingDonation.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.fundingDonation.aggregate({
      where: { createdAt: { gte: thirtyDaysAgo } },
      _sum: { amount: true },
    }),
  ]);

  return c.json({
    analytics: {
      period: "30 days",
      newUsers,
      newVideos,
      newDonations,
      donationTotal: donationTotal._sum.amount || 0,
    },
  });
});
