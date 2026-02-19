import { Hono } from "hono";
import { prisma } from "../config/database.js";
import { authMiddleware, getUser } from "../middleware/auth.js";

export const events = new Hono();

events.get("/", async (c) => {
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "20");
  const skip = (page - 1) * limit;
  const status = c.req.query("status") || "upcoming";
  const category = c.req.query("category");

  const where: Record<string, unknown> = { status };
  if (category) {
    where.category = category;
  }

  const allEvents = await prisma.event.findMany({
    skip,
    take: limit,
    where,
    include: {
      host: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { eventDate: "asc" },
  });

  const total = await prisma.event.count({ where });

  return c.json({
    events: allEvents,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

events.get("/:id", async (c) => {
  const id = c.req.param("id");

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      host: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          bio: true,
        },
      },
      attendees: {
        where: { status: "registered" },
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
  });

  if (!event) {
    return c.json({ error: "Event not found" }, 404);
  }

  return c.json({
    event: {
      ...event,
      attendees: event.attendees.map((a) => a.user),
    },
  });
});

events.post("/", authMiddleware, async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const {
    title,
    description,
    coverImage,
    eventDate,
    endDate,
    location,
    isVirtual,
    meetingUrl,
    category,
    maxAttendees,
  } = body;

  if (!title || !eventDate || !category) {
    return c.json(
      { error: "Title, event date, and category are required" },
      400,
    );
  }

  if (isVirtual && !meetingUrl) {
    return c.json({ error: "Meeting URL is required for virtual events" }, 400);
  }

  if (!isVirtual && !location) {
    return c.json({ error: "Location is required for in-person events" }, 400);
  }

  const event = await prisma.event.create({
    data: {
      title,
      description,
      coverImage,
      eventDate: new Date(eventDate),
      endDate: endDate ? new Date(endDate) : undefined,
      location,
      isVirtual: isVirtual || false,
      meetingUrl,
      category,
      maxAttendees,
      hostId: user.userId,
    },
    include: {
      host: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  return c.json({ event }, 201);
});

events.put("/:id", authMiddleware, async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const id = c.req.param("id");

  const existingEvent = await prisma.event.findUnique({ where: { id } });
  if (!existingEvent) {
    return c.json({ error: "Event not found" }, 404);
  }

  if (existingEvent.hostId !== user.userId) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const body = await c.req.json();
  const {
    title,
    description,
    coverImage,
    eventDate,
    endDate,
    location,
    isVirtual,
    meetingUrl,
    category,
    maxAttendees,
    status,
  } = body;

  const event = await prisma.event.update({
    where: { id },
    data: {
      title,
      description,
      coverImage,
      eventDate: eventDate ? new Date(eventDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      location,
      isVirtual,
      meetingUrl,
      category,
      maxAttendees,
      status,
    },
    include: {
      host: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  return c.json({ event });
});

events.delete("/:id", authMiddleware, async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const id = c.req.param("id");

  const existingEvent = await prisma.event.findUnique({ where: { id } });
  if (!existingEvent) {
    return c.json({ error: "Event not found" }, 404);
  }

  if (existingEvent.hostId !== user.userId) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  await prisma.event.delete({ where: { id } });

  return c.json({ message: "Event deleted successfully" });
});

events.post("/:id/register", authMiddleware, async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const eventId = c.req.param("id");

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return c.json({ error: "Event not found" }, 404);
  }

  if (event.status !== "upcoming") {
    return c.json({ error: "Cannot register for this event" }, 400);
  }

  if (event.maxAttendees && event.attendeeCount >= event.maxAttendees) {
    return c.json({ error: "Event is full" }, 400);
  }

  const existingRegistration = await prisma.eventAttendee.findUnique({
    where: {
      eventId_userId: {
        eventId,
        userId: user.userId,
      },
    },
  });

  if (existingRegistration) {
    return c.json({ error: "Already registered" }, 400);
  }

  await prisma.$transaction([
    prisma.eventAttendee.create({
      data: {
        eventId,
        userId: user.userId,
        status: "registered",
      },
    }),
    prisma.event.update({
      where: { id: eventId },
      data: { attendeeCount: { increment: 1 } },
    }),
  ]);

  return c.json({ message: "Successfully registered for event" }, 201);
});

events.delete("/:id/register", authMiddleware, async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const eventId = c.req.param("id");

  const existingRegistration = await prisma.eventAttendee.findUnique({
    where: {
      eventId_userId: {
        eventId,
        userId: user.userId,
      },
    },
  });

  if (!existingRegistration) {
    return c.json({ error: "Not registered for this event" }, 400);
  }

  await prisma.$transaction([
    prisma.eventAttendee.delete({
      where: {
        eventId_userId: {
          eventId,
          userId: user.userId,
        },
      },
    }),
    prisma.event.update({
      where: { id: eventId },
      data: { attendeeCount: { decrement: 1 } },
    }),
  ]);

  return c.json({ message: "Successfully unregistered from event" });
});
