import { Hono } from "hono";
import { prisma } from "../config/database.js";
import { authMiddleware, getUser } from "../middleware/auth.js";
import { validate, updateUserSchema } from "../middleware/validate.js";

export const users = new Hono();

users.get("/", async (c) => {
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "20");
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      where: { isPublic: true },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        bio: true,
        location: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where: { isPublic: true } }),
  ]);

  return c.json({
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

users.get("/:id", async (c) => {
  const id = c.req.param("id");

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      bio: true,
      location: true,
      role: true,
      isPublic: true,
      createdAt: true,
      skills: true,
      interests: true,
    },
  });

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  const currentUser = getUser(c);
  if (!user.isPublic && (!currentUser || currentUser.userId !== id)) {
    return c.json({ error: "User profile is private" }, 403);
  }

  return c.json({ user });
});

users.put("/:id", authMiddleware, validate(updateUserSchema), async (c) => {
  const id = c.req.param("id");
  const currentUser = getUser(c);

  if (currentUser?.userId !== id) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const body = c.get("validatedBody");

  const user = await prisma.user.update({
    where: { id },
    data: body,
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      bio: true,
      location: true,
      role: true,
      isPublic: true,
      createdAt: true,
    },
  });

  return c.json({ user });
});

users.delete("/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const currentUser = getUser(c);

  if (currentUser?.userId !== id) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  await prisma.user.delete({ where: { id } });

  return c.json({ message: "User deleted successfully" });
});

users.get("/:id/videos", async (c) => {
  const id = c.req.param("id");
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "20");
  const skip = (page - 1) * limit;

  const [videos, total] = await Promise.all([
    prisma.video.findMany({
      skip,
      take: limit,
      where: { authorId: id },
      select: {
        id: true,
        title: true,
        thumbnailUrl: true,
        category: true,
        viewsCount: true,
        likesCount: true,
        commentsCount: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.video.count({ where: { authorId: id } }),
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

users.get("/:id/requests", async (c) => {
  const id = c.req.param("id");
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "20");
  const skip = (page - 1) * limit;

  const [requests, total] = await Promise.all([
    prisma.fundingRequest.findMany({
      skip,
      take: limit,
      where: { authorId: id },
      select: {
        id: true,
        title: true,
        coverImageUrl: true,
        category: true,
        goalAmount: true,
        currentAmount: true,
        supportersCount: true,
        status: true,
        deadline: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.fundingRequest.count({ where: { authorId: id } }),
  ]);

  return c.json({
    data: requests,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

users.get("/:id/skills", async (c) => {
  const id = c.req.param("id");

  const skills = await prisma.userSkill.findMany({
    where: { userId: id },
    select: { skill: true },
  });

  return c.json({ skills: skills.map((s) => s.skill) });
});

users.put("/:id/skills", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const currentUser = getUser(c);

  if (currentUser?.userId !== id) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const body = await c.req.json();
  const { skills } = body;

  await prisma.userSkill.deleteMany({ where: { userId: id } });

  if (skills && Array.isArray(skills)) {
    await prisma.userSkill.createMany({
      data: skills.map((skill: string) => ({ userId: id, skill })),
    });
  }

  const updatedSkills = await prisma.userSkill.findMany({
    where: { userId: id },
    select: { skill: true },
  });

  return c.json({ skills: updatedSkills.map((s) => s.skill) });
});

users.get("/:id/interests", async (c) => {
  const id = c.req.param("id");

  const interests = await prisma.userInterest.findMany({
    where: { userId: id },
    select: { interest: true },
  });

  return c.json({ interests: interests.map((i) => i.interest) });
});

users.put("/:id/interests", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const currentUser = getUser(c);

  if (currentUser?.userId !== id) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const body = await c.req.json();
  const { interests } = body;

  await prisma.userInterest.deleteMany({ where: { userId: id } });

  if (interests && Array.isArray(interests)) {
    await prisma.userInterest.createMany({
      data: interests.map((interest: string) => ({ userId: id, interest })),
    });
  }

  const updatedInterests = await prisma.userInterest.findMany({
    where: { userId: id },
    select: { interest: true },
  });

  return c.json({ interests: updatedInterests.map((i) => i.interest) });
});

users.get("/:id/followers", async (c) => {
  const id = c.req.param("id");
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "20");
  const skip = (page - 1) * limit;

  const [followers, total] = await Promise.all([
    prisma.userFollow.findMany({
      skip,
      take: limit,
      where: { followingId: id },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.userFollow.count({ where: { followingId: id } }),
  ]);

  return c.json({
    data: followers.map((f) => f.follower),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

users.get("/:id/following", async (c) => {
  const id = c.req.param("id");
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "20");
  const skip = (page - 1) * limit;

  const [following, total] = await Promise.all([
    prisma.userFollow.findMany({
      skip,
      take: limit,
      where: { followerId: id },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.userFollow.count({ where: { followerId: id } }),
  ]);

  return c.json({
    data: following.map((f) => f.following),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

users.post("/:id/follow", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const currentUser = getUser(c);

  if (!currentUser || currentUser.userId === id) {
    return c.json({ error: "Cannot follow yourself" }, 400);
  }

  const targetUser = await prisma.user.findUnique({ where: { id } });
  if (!targetUser) {
    return c.json({ error: "User not found" }, 404);
  }

  await prisma.userFollow.create({
    data: {
      followerId: currentUser.userId,
      followingId: id,
    },
  });

  return c.json({ message: "Followed successfully" });
});

users.delete("/:id/follow", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const currentUser = getUser(c);

  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await prisma.userFollow.deleteMany({
    where: {
      followerId: currentUser.userId,
      followingId: id,
    },
  });

  return c.json({ message: "Unfollowed successfully" });
});
