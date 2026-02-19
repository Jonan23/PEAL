import { Hono } from "hono";
import { prisma } from "../config/database.js";
import { authMiddleware, getUser } from "../middleware/auth.js";

export const videos = new Hono();

videos.get("/", async (c) => {
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "20");
  const skip = (page - 1) * limit;
  const category = c.req.query("category");

  const where: Record<string, unknown> = {};
  if (category) where.category = category;

  const [videos, total] = await Promise.all([
    prisma.video.findMany({
      skip,
      take: limit,
      where,
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
    }),
    prisma.video.count({ where }),
  ]);

  return c.json({
    data: videos,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

videos.get("/trending", async (c) => {
  const limit = parseInt(c.req.query("limit") || "10");

  const videos = await prisma.video.findMany({
    take: limit,
    where: { isTrending: true },
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

  return c.json({ data: videos });
});

videos.get("/feed", authMiddleware, async (c) => {
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "20");
  const skip = (page - 1) * limit;

  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const following = await prisma.userFollow.findMany({
    where: { followerId: user.userId },
    select: { followingId: true },
  });

  const followingIds = following.map((f) => f.followingId);

  const [videos, total] = await Promise.all([
    prisma.video.findMany({
      skip,
      take: limit,
      where: {
        authorId: { in: followingIds.length > 0 ? followingIds : ["none"] },
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
    }),
    prisma.video.count({
      where: {
        authorId: { in: followingIds.length > 0 ? followingIds : ["none"] },
      },
    }),
  ]);

  return c.json({
    data: videos,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

videos.get("/:id", async (c) => {
  const id = c.req.param("id");

  const video = await prisma.video.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      tags: {
        select: { tag: true },
      },
    },
  });

  if (!video) {
    return c.json({ error: "Video not found" }, 404);
  }

  return c.json({ video });
});

videos.post("/", authMiddleware, async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const { title, description, videoUrl, thumbnailUrl, category, tags } = body;

  if (!title || !videoUrl) {
    return c.json({ error: "Title and video URL are required" }, 400);
  }

  const video = await prisma.video.create({
    data: {
      title,
      description,
      videoUrl,
      thumbnailUrl,
      category,
      authorId: user.userId,
      tags: tags ? { create: tags.map((tag: string) => ({ tag })) } : undefined,
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
  });

  return c.json({ video }, 201);
});

videos.put("/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = getUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const existingVideo = await prisma.video.findUnique({ where: { id } });
  if (!existingVideo) {
    return c.json({ error: "Video not found" }, 404);
  }

  if (existingVideo.authorId !== user.userId) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const body = await c.req.json();

  const video = await prisma.video.update({
    where: { id },
    data: body,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  return c.json({ video });
});

videos.delete("/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = getUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const existingVideo = await prisma.video.findUnique({ where: { id } });
  if (!existingVideo) {
    return c.json({ error: "Video not found" }, 404);
  }

  if (existingVideo.authorId !== user.userId) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  await prisma.video.delete({ where: { id } });

  return c.json({ message: "Video deleted successfully" });
});

videos.post("/:id/like", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = getUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const video = await prisma.video.findUnique({ where: { id } });
  if (!video) {
    return c.json({ error: "Video not found" }, 404);
  }

  const existingLike = await prisma.videoLike.findUnique({
    where: {
      videoId_userId: {
        videoId: id,
        userId: user.userId,
      },
    },
  });

  if (existingLike) {
    await prisma.videoLike.delete({ where: { id: existingLike.id } });
    await prisma.video.update({
      where: { id },
      data: { likesCount: { decrement: 1 } },
    });
    return c.json({ liked: false });
  }

  await prisma.videoLike.create({
    data: {
      videoId: id,
      userId: user.userId,
    },
  });
  await prisma.video.update({
    where: { id },
    data: { likesCount: { increment: 1 } },
  });

  return c.json({ liked: true });
});

videos.get("/:id/comments", async (c) => {
  const id = c.req.param("id");
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "20");
  const skip = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    prisma.videoComment.findMany({
      skip,
      take: limit,
      where: { videoId: id, parentId: null },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.videoComment.count({ where: { videoId: id } }),
  ]);

  return c.json({
    data: comments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

videos.post("/:id/comments", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = getUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const video = await prisma.video.findUnique({ where: { id } });
  if (!video) {
    return c.json({ error: "Video not found" }, 404);
  }

  const body = await c.req.json();
  const { content, parentId } = body;

  if (!content) {
    return c.json({ error: "Content is required" }, 400);
  }

  const comment = await prisma.videoComment.create({
    data: {
      videoId: id,
      userId: user.userId,
      content,
      parentId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  await prisma.video.update({
    where: { id },
    data: { commentsCount: { increment: 1 } },
  });

  return c.json({ comment }, 201);
});

videos.delete("/:id/comments/:commentId", authMiddleware, async (c) => {
  const commentId = c.req.param("commentId");
  const user = getUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const comment = await prisma.videoComment.findUnique({
    where: { id: commentId },
  });
  if (!comment) {
    return c.json({ error: "Comment not found" }, 404);
  }

  if (comment.userId !== user.userId) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  await prisma.videoComment.delete({ where: { id: commentId } });
  await prisma.video.update({
    where: { id: comment.videoId },
    data: { commentsCount: { decrement: 1 } },
  });

  return c.json({ message: "Comment deleted successfully" });
});
