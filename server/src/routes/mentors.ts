import { Hono } from "hono";
import { prisma } from "../config/database.js";
import { authMiddleware, getUser } from "../middleware/auth.js";

export const mentors = new Hono();

mentors.get("/", async (c) => {
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "20");
  const skip = (page - 1) * limit;
  const availability = c.req.query("availability");
  const acceptsRemote = c.req.query("acceptsRemote");
  const skill = c.req.query("skill");

  const where: Record<string, unknown> = {};

  if (availability) where.availability = availability;
  if (acceptsRemote !== undefined)
    where.acceptsRemote = acceptsRemote === "true";

  let mentorProfiles;
  if (skill) {
    mentorProfiles = await prisma.mentorProfile.findMany({
      skip,
      take: limit,
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            bio: true,
            location: true,
          },
        },
        skills: {
          where: { skill: { contains: skill } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } else {
    mentorProfiles = await prisma.mentorProfile.findMany({
      skip,
      take: limit,
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            bio: true,
            location: true,
          },
        },
        skills: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  const total = await prisma.mentorProfile.count({ where });

  return c.json({
    data: mentorProfiles.map((m) => ({
      id: m.id,
      bio: m.bio,
      availability: m.availability,
      yearsExperience: m.yearsExperience,
      maxMentees: m.maxMentees,
      currentMenteesCount: m.currentMenteesCount,
      acceptsRemote: m.acceptsRemote,
      skills: m.skills.map((s) => s.skill),
      user: m.user,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

mentors.get("/:id", async (c) => {
  const id = c.req.param("id");

  const mentor = await prisma.mentorProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          bio: true,
          location: true,
        },
      },
      skills: true,
      connectionsAsMentor: {
        where: { status: "accepted" },
        include: {
          mentee: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  if (!mentor) {
    return c.json({ error: "Mentor not found" }, 404);
  }

  return c.json({
    mentor: {
      id: mentor.id,
      bio: mentor.bio,
      availability: mentor.availability,
      yearsExperience: mentor.yearsExperience,
      maxMentees: mentor.maxMentees,
      currentMenteesCount: mentor.currentMenteesCount,
      acceptsRemote: mentor.acceptsRemote,
      skills: mentor.skills.map((s) => s.skill),
      mentees: mentor.connectionsAsMentor.map((c) => c.mentee),
      user: mentor.user,
    },
  });
});

mentors.post("/", authMiddleware, async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (user.role !== "sponsor") {
    return c.json({ error: "Only sponsors can create mentor profiles" }, 403);
  }

  const existingProfile = await prisma.mentorProfile.findUnique({
    where: { userId: user.userId },
  });

  if (existingProfile) {
    return c.json({ error: "Mentor profile already exists" }, 400);
  }

  const body = await c.req.json();
  const {
    bio,
    availability,
    yearsExperience,
    maxMentees,
    acceptsRemote,
    skills,
  } = body;

  const mentor = await prisma.mentorProfile.create({
    data: {
      userId: user.userId,
      bio,
      availability: availability || "available",
      yearsExperience,
      maxMentees: maxMentees || 5,
      acceptsRemote: acceptsRemote !== false,
      skills: skills
        ? { create: skills.map((skill: string) => ({ skill })) }
        : undefined,
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

  return c.json({ mentor }, 201);
});

mentors.put("/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = getUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const existingMentor = await prisma.mentorProfile.findUnique({
    where: { id },
  });
  if (!existingMentor) {
    return c.json({ error: "Mentor not found" }, 404);
  }

  if (existingMentor.userId !== user.userId) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const body = await c.req.json();
  const {
    bio,
    availability,
    yearsExperience,
    maxMentees,
    acceptsRemote,
    skills,
  } = body;

  if (skills) {
    await prisma.mentorSkill.deleteMany({ where: { mentorId: id } });
    await prisma.mentorSkill.createMany({
      data: skills.map((skill: string) => ({ mentorId: id, skill })),
    });
  }

  const mentor = await prisma.mentorProfile.update({
    where: { id },
    data: {
      bio,
      availability,
      yearsExperience,
      maxMentees,
      acceptsRemote,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      skills: true,
    },
  });

  return c.json({
    mentor: {
      ...mentor,
      skills: mentor.skills.map((s) => s.skill),
    },
  });
});

mentors.post("/:id/connect", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = getUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const mentor = await prisma.mentorProfile.findUnique({ where: { id } });
  if (!mentor) {
    return c.json({ error: "Mentor not found" }, 404);
  }

  if (mentor.userId === user.userId) {
    return c.json({ error: "Cannot connect with yourself" }, 400);
  }

  if (mentor.currentMenteesCount >= mentor.maxMentees) {
    return c.json({ error: "Mentor has reached maximum mentees" }, 400);
  }

  const existingConnection = await prisma.mentorConnection.findFirst({
    where: {
      mentorId: id,
      menteeId: user.userId,
    },
  });

  if (existingConnection) {
    return c.json({ error: "Connection already exists" }, 400);
  }

  const connection = await prisma.mentorConnection.create({
    data: {
      mentorId: id,
      menteeId: user.userId,
      status: "pending",
    },
  });

  await prisma.notification.create({
    data: {
      userId: mentor.userId,
      type: "mentor_request",
      title: "New Mentor Connection Request",
      message: "Someone wants to connect with you as a mentee",
      data: { connectionId: connection.id },
    },
  });

  return c.json({ connection, message: "Connection request sent" }, 201);
});

mentors.put("/:id/connection", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = getUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const mentor = await prisma.mentorProfile.findUnique({ where: { id } });
  if (!mentor) {
    return c.json({ error: "Mentor not found" }, 404);
  }

  if (mentor.userId !== user.userId) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const body = await c.req.json();
  const { connectionId, action } = body;

  if (!connectionId || !action) {
    return c.json({ error: "Connection ID and action are required" }, 400);
  }

  const connection = await prisma.mentorConnection.findUnique({
    where: { id: connectionId },
  });

  if (!connection || connection.mentorId !== id) {
    return c.json({ error: "Connection not found" }, 404);
  }

  if (action === "accept") {
    await prisma.mentorConnection.update({
      where: { id: connectionId },
      data: { status: "accepted" },
    });
    await prisma.mentorProfile.update({
      where: { id },
      data: { currentMenteesCount: { increment: 1 } },
    });

    await prisma.notification.create({
      data: {
        userId: connection.menteeId,
        type: "mentor_accepted",
        title: "Mentor Connection Accepted",
        message: "Your mentor connection request has been accepted",
        data: { connectionId },
      },
    });

    return c.json({ message: "Connection accepted" });
  } else if (action === "reject") {
    await prisma.mentorConnection.update({
      where: { id: connectionId },
      data: { status: "rejected" },
    });

    return c.json({ message: "Connection rejected" });
  }

  return c.json({ error: "Invalid action" }, 400);
});

mentors.delete("/:id/connection", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = getUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const mentor = await prisma.mentorProfile.findUnique({ where: { id } });
  if (!mentor) {
    return c.json({ error: "Mentor not found" }, 404);
  }

  const body = await c.req.json();
  const { connectionId } = body;

  const connection = await prisma.mentorConnection.findUnique({
    where: { id: connectionId },
  });

  if (!connection) {
    return c.json({ error: "Connection not found" }, 404);
  }

  if (connection.mentorId !== id && connection.menteeId !== user.userId) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  if (connection.status === "accepted" && connection.mentorId === id) {
    await prisma.mentorProfile.update({
      where: { id },
      data: { currentMenteesCount: { decrement: 1 } },
    });
  }

  await prisma.mentorConnection.delete({ where: { id: connectionId } });

  return c.json({ message: "Connection removed" });
});

mentors.get("/:id/mentees", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = getUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const mentor = await prisma.mentorProfile.findUnique({ where: { id } });
  if (!mentor) {
    return c.json({ error: "Mentor not found" }, 404);
  }

  if (mentor.userId !== user.userId) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const connections = await prisma.mentorConnection.findMany({
    where: { mentorId: id, status: "accepted" },
    include: {
      mentee: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          bio: true,
        },
      },
    },
  });

  return c.json({
    mentees: connections.map((c) => c.mentee),
  });
});
