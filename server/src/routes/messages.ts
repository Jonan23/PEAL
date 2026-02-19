import { Hono } from "hono";
import { prisma } from "../config/database.js";
import { authMiddleware, getUser } from "../middleware/auth.js";

export const messages = new Hono();

messages.get("/", authMiddleware, async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "20");
  const skip = (page - 1) * limit;

  const conversations = await prisma.conversationParticipant.findMany({
    where: { userId: user.userId },
    skip,
    take: limit,
    include: {
      conversation: {
        include: {
          participants: {
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
          messages: {
            take: 1,
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
    orderBy: {
      lastMessageAt: "desc",
    },
  });

  const total = await prisma.conversationParticipant.count({
    where: { userId: user.userId },
  });

  return c.json({
    data: conversations.map((cp) => ({
      id: cp.conversation.id,
      participants: cp.conversation.participants.map((p) => p.user),
      lastMessage: cp.conversation.messages[0] || null,
      unreadCount: cp.unreadCount,
      lastMessageAt: cp.lastMessageAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

messages.get("/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = getUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const participant = await prisma.conversationParticipant.findFirst({
    where: {
      conversationId: id,
      userId: user.userId,
    },
  });

  if (!participant) {
    return c.json({ error: "Conversation not found" }, 404);
  }

  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "50");
  const skip = (page - 1) * limit;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      participants: {
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
      messages: {
        skip,
        take: limit,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!conversation) {
    return c.json({ error: "Conversation not found" }, 404);
  }

  return c.json({
    conversation: {
      id: conversation.id,
      participants: conversation.participants.map((p) => p.user),
      messages: conversation.messages.reverse(),
    },
  });
});

messages.post("/", authMiddleware, async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const { recipientId, content } = body;

  if (!recipientId || !content) {
    return c.json({ error: "Recipient ID and content are required" }, 400);
  }

  if (recipientId === user.userId) {
    return c.json({ error: "Cannot start a conversation with yourself" }, 400);
  }

  const recipient = await prisma.user.findUnique({
    where: { id: recipientId },
  });
  if (!recipient) {
    return c.json({ error: "Recipient not found" }, 404);
  }

  let conversation = await prisma.conversationParticipant.findFirst({
    where: {
      userId: user.userId,
      conversation: {
        participants: {
          some: { userId: recipientId },
        },
      },
    },
    include: {
      conversation: true,
    },
  });

  let conversationId: string;

  if (conversation) {
    conversationId = conversation.conversation.id;
  } else {
    const newConversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: user.userId }, { userId: recipientId }],
        },
      },
    });
    conversationId = newConversation.id;
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: user.userId,
      content,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  await prisma.conversationParticipant.updateMany({
    where: {
      conversationId,
      userId: { not: user.userId },
    },
    data: {
      lastMessageAt: new Date(),
      unreadCount: { increment: 1 },
    },
  });

  await prisma.notification.create({
    data: {
      userId: recipientId,
      type: "message",
      title: "New Message",
      message: `You have a new message from ${user.userId}`,
      data: {
        conversationId,
        messageId: message.id,
      },
    },
  });

  return c.json({ message, conversationId }, 201);
});

messages.post("/:id/messages", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = getUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const participant = await prisma.conversationParticipant.findFirst({
    where: {
      conversationId: id,
      userId: user.userId,
    },
  });

  if (!participant) {
    return c.json({ error: "Conversation not found" }, 404);
  }

  const body = await c.req.json();
  const { content } = body;

  if (!content) {
    return c.json({ error: "Content is required" }, 400);
  }

  const message = await prisma.message.create({
    data: {
      conversationId: id,
      senderId: user.userId,
      content,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  await prisma.conversationParticipant.updateMany({
    where: {
      conversationId: id,
      userId: { not: user.userId },
    },
    data: {
      lastMessageAt: new Date(),
      unreadCount: { increment: 1 },
    },
  });

  const otherParticipants = await prisma.conversationParticipant.findMany({
    where: {
      conversationId: id,
      userId: { not: user.userId },
    },
  });

  for (const p of otherParticipants) {
    await prisma.notification.create({
      data: {
        userId: p.userId,
        type: "message",
        title: "New Message",
        message: `You have a new message from ${user.userId}`,
        data: { conversationId: id, messageId: message.id },
      },
    });
  }

  return c.json({ message }, 201);
});

messages.put("/:id/read", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = getUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const participant = await prisma.conversationParticipant.findFirst({
    where: {
      conversationId: id,
      userId: user.userId,
    },
  });

  if (!participant) {
    return c.json({ error: "Conversation not found" }, 404);
  }

  await prisma.conversationParticipant.update({
    where: { id: participant.id },
    data: { unreadCount: 0 },
  });

  await prisma.message.updateMany({
    where: {
      conversationId: id,
      senderId: { not: user.userId },
      isRead: false,
    },
    data: { isRead: true },
  });

  return c.json({ message: "Marked as read" });
});
