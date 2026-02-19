import { Hono } from "hono";
import { prisma } from "../config/database.js";
import { authMiddleware, getUser } from "../middleware/auth.js";

export const stories = new Hono();

stories.get("/", async (c) => {
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "20");
  const skip = (page - 1) * limit;

  const [stories, total] = await Promise.all([
    prisma.successStory.findMany({
      skip,
      take: limit,
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
    prisma.successStory.count(),
  ]);

  return c.json({
    data: stories,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

stories.get("/featured", async (c) => {
  const story = await prisma.successStory.findFirst({
    where: { isFeatured: true },
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

  if (!story) {
    const latestStory = await prisma.successStory.findFirst({
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
    return c.json({ story: latestStory });
  }

  return c.json({ story });
});

stories.get("/:id", async (c) => {
  const id = c.req.param("id");

  const story = await prisma.successStory.findUnique({
    where: { id },
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

  if (!story) {
    return c.json({ error: "Success story not found" }, 404);
  }

  return c.json({ story });
});

stories.post("/", authMiddleware, async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const {
    title,
    description,
    beforeImageUrl,
    afterImageUrl,
    impactDescription,
  } = body;

  if (!title || !description) {
    return c.json({ error: "Title and description are required" }, 400);
  }

  const story = await prisma.successStory.create({
    data: {
      title,
      description,
      beforeImageUrl,
      afterImageUrl,
      impactDescription,
      authorId: user.userId,
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

  return c.json({ story }, 201);
});

stories.put("/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = getUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const existingStory = await prisma.successStory.findUnique({ where: { id } });
  if (!existingStory) {
    return c.json({ error: "Success story not found" }, 404);
  }

  if (existingStory.authorId !== user.userId) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const body = await c.req.json();

  const story = await prisma.successStory.update({
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

  return c.json({ story });
});

stories.delete("/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = getUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const existingStory = await prisma.successStory.findUnique({ where: { id } });
  if (!existingStory) {
    return c.json({ error: "Success story not found" }, 404);
  }

  if (existingStory.authorId !== user.userId) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  await prisma.successStory.delete({ where: { id } });

  return c.json({ message: "Success story deleted successfully" });
});

stories.post("/:id/celebrate", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = getUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const story = await prisma.successStory.findUnique({ where: { id } });
  if (!story) {
    return c.json({ error: "Success story not found" }, 404);
  }

  const existingCelebration = await prisma.successStoryCelebration.findUnique({
    where: {
      successStoryId_userId: {
        successStoryId: id,
        userId: user.userId,
      },
    },
  });

  if (existingCelebration) {
    await prisma.successStoryCelebration.delete({
      where: { id: existingCelebration.id },
    });
    await prisma.successStory.update({
      where: { id },
      data: { celebrationsCount: { decrement: 1 } },
    });
    return c.json({ celebrated: false });
  }

  await prisma.successStoryCelebration.create({
    data: {
      successStoryId: id,
      userId: user.userId,
    },
  });
  await prisma.successStory.update({
    where: { id },
    data: { celebrationsCount: { increment: 1 } },
  });

  return c.json({ celebrated: true });
});

stories.delete("/:id/celebrate", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = getUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const existingCelebration = await prisma.successStoryCelebration.findUnique({
    where: {
      successStoryId_userId: {
        successStoryId: id,
        userId: user.userId,
      },
    },
  });

  if (existingCelebration) {
    await prisma.successStoryCelebration.delete({
      where: { id: existingCelebration.id },
    });
    await prisma.successStory.update({
      where: { id },
      data: { celebrationsCount: { decrement: 1 } },
    });
  }

  return c.json({ message: "Celebration removed" });
});
