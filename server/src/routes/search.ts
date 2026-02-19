import { Hono } from "hono";
import { prisma } from "../config/database.js";

export const search = new Hono();

search.get("/", async (c) => {
  const query = c.req.query("q") || "";
  const type = c.req.query("type");
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "20");
  const skip = (page - 1) * limit;

  if (!query) {
    return c.json({ error: "Search query is required" }, 400);
  }

  const searchQuery = query.toLowerCase();

  if (!type || type === "users") {
    const users = await prisma.user.findMany({
      take: limit,
      where: {
        OR: [
          { name: { contains: searchQuery } },
          { bio: { contains: searchQuery } },
        ],
        isPublic: true,
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        bio: true,
        role: true,
      },
    });

    if (type === "users") {
      return c.json({ data: users, type: "users" });
    }
  }

  if (!type || type === "videos") {
    const videos = await prisma.video.findMany({
      skip,
      take: limit,
      where: {
        OR: [
          { title: { contains: searchQuery } },
          { description: { contains: searchQuery } },
        ],
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { viewsCount: "desc" },
    });

    if (type === "videos") {
      return c.json({ data: videos, type: "videos" });
    }
  }

  if (!type || type === "requests") {
    const requests = await prisma.fundingRequest.findMany({
      skip,
      take: limit,
      where: {
        OR: [
          { title: { contains: searchQuery } },
          { description: { contains: searchQuery } },
        ],
        status: "active",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (type === "requests") {
      return c.json({ data: requests, type: "fundingRequests" });
    }
  }

  if (!type || type === "stories") {
    const stories = await prisma.successStory.findMany({
      skip,
      take: limit,
      where: {
        OR: [
          { title: { contains: searchQuery } },
          { description: { contains: searchQuery } },
          { impactDescription: { contains: searchQuery } },
        ],
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { celebrationsCount: "desc" },
    });

    if (type === "stories") {
      return c.json({ data: stories, type: "stories" });
    }
  }

  const [users, videos, requests, stories] = await Promise.all([
    prisma.user.findMany({
      take: 5,
      where: {
        OR: [
          { name: { contains: searchQuery } },
          { bio: { contains: searchQuery } },
        ],
        isPublic: true,
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        role: true,
      },
    }),
    prisma.video.findMany({
      take: 5,
      where: {
        OR: [
          { title: { contains: searchQuery } },
          { description: { contains: searchQuery } },
        ],
      },
      select: {
        id: true,
        title: true,
        thumbnailUrl: true,
      },
    }),
    prisma.fundingRequest.findMany({
      take: 5,
      where: {
        OR: [
          { title: { contains: searchQuery } },
          { description: { contains: searchQuery } },
        ],
        status: "active",
      },
      select: {
        id: true,
        title: true,
        coverImageUrl: true,
        goalAmount: true,
        currentAmount: true,
      },
    }),
    prisma.successStory.findMany({
      take: 5,
      where: {
        OR: [
          { title: { contains: searchQuery } },
          { description: { contains: searchQuery } },
        ],
      },
      select: {
        id: true,
        title: true,
        afterImageUrl: true,
      },
    }),
  ]);

  return c.json({
    data: {
      users,
      videos,
      fundingRequests: requests,
      stories,
    },
  });
});
