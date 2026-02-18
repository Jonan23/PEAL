import { Hono } from "hono";
import { prisma } from "../config/database.js";
import { authMiddleware, getUser } from "../middleware/auth.js";

export const requests = new Hono();

requests.get("/", async (c) => {
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "20");
  const skip = (page - 1) * limit;
  const category = c.req.query("category");
  const status = c.req.query("status") || "active";

  const where: Record<string, unknown> = { status };
  if (category) where.category = category;

  const [requests, total] = await Promise.all([
    prisma.fundingRequest.findMany({
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
    prisma.fundingRequest.count({ where }),
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

requests.get("/:id", async (c) => {
  const id = c.req.param("id");

  const request = await prisma.fundingRequest.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      donations: {
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          donor: {
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

  if (!request) {
    return c.json({ error: "Funding request not found" }, 404);
  }

  return c.json({ request });
});

requests.post("/", authMiddleware, async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const { title, description, coverImageUrl, category, goalAmount, deadline } =
    body;

  if (!title || !description || !goalAmount || !deadline) {
    return c.json(
      { error: "Title, description, goal amount, and deadline are required" },
      400,
    );
  }

  if (goalAmount < 100) {
    return c.json({ error: "Minimum goal amount is $100" }, 400);
  }

  const deadlineDate = new Date(deadline);
  const maxDeadline = new Date();
  maxDeadline.setDate(maxDeadline.getDate() + 90);

  if (deadlineDate > maxDeadline) {
    return c.json({ error: "Maximum deadline is 90 days from now" }, 400);
  }

  const request = await prisma.fundingRequest.create({
    data: {
      title,
      description,
      coverImageUrl,
      category,
      goalAmount,
      deadline: deadlineDate,
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

  return c.json({ request }, 201);
});

requests.put("/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = getUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const existingRequest = await prisma.fundingRequest.findUnique({
    where: { id },
  });
  if (!existingRequest) {
    return c.json({ error: "Funding request not found" }, 404);
  }

  if (existingRequest.authorId !== user.userId) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  if (existingRequest.status !== "active") {
    return c.json({ error: "Cannot update a non-active funding request" }, 400);
  }

  const body = await c.req.json();

  const request = await prisma.fundingRequest.update({
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

  return c.json({ request });
});

requests.delete("/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = getUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const existingRequest = await prisma.fundingRequest.findUnique({
    where: { id },
  });
  if (!existingRequest) {
    return c.json({ error: "Funding request not found" }, 404);
  }

  if (existingRequest.authorId !== user.userId) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  await prisma.fundingRequest.delete({ where: { id } });

  return c.json({ message: "Funding request deleted successfully" });
});

requests.post("/:id/donate", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = getUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const fundingRequest = await prisma.fundingRequest.findUnique({
    where: { id },
  });
  if (!fundingRequest) {
    return c.json({ error: "Funding request not found" }, 404);
  }

  if (fundingRequest.status !== "active") {
    return c.json({ error: "This funding request is no longer active" }, 400);
  }

  const body = await c.req.json();
  const { amount, message, isAnonymous } = body;

  if (!amount || amount <= 0) {
    return c.json({ error: "Valid donation amount is required" }, 400);
  }

  const donation = await prisma.fundingDonation.create({
    data: {
      fundingRequestId: id,
      donorId: user.userId,
      amount,
      message,
      isAnonymous: isAnonymous || false,
    },
    include: {
      donor: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  const currentAmount = Number(fundingRequest.currentAmount) + amount;
  const newStatus =
    currentAmount >= Number(fundingRequest.goalAmount) ? "funded" : "active";

  await prisma.fundingRequest.update({
    where: { id },
    data: {
      currentAmount: currentAmount,
      supportersCount: { increment: 1 },
      status: newStatus,
    },
  });

  if (fundingRequest.authorId !== user.userId) {
    await prisma.notification.create({
      data: {
        userId: fundingRequest.authorId,
        type: "donation",
        title: "New Donation!",
        message: `Someone donated $${amount} to your funding request "${fundingRequest.title}"`,
        data: { fundingRequestId: id, donationId: donation.id },
      },
    });
  }

  return c.json({ donation }, 201);
});

requests.get("/:id/donations", async (c) => {
  const id = c.req.param("id");
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "20");
  const skip = (page - 1) * limit;

  const [donations, total] = await Promise.all([
    prisma.fundingDonation.findMany({
      skip,
      take: limit,
      where: { fundingRequestId: id },
      include: {
        donor: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.fundingDonation.count({ where: { fundingRequestId: id } }),
  ]);

  return c.json({
    data: donations.map((d) => ({
      ...d,
      donor: d.isAnonymous ? null : d.donor,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});
