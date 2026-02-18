import { Hono } from "hono";
import { authMiddleware, getUser } from "../middleware/auth.js";
import { prisma } from "../config/database.js";

export const payments = new Hono();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";

payments.post("/create-donation-intent", authMiddleware, async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const { requestId, amount, message, isAnonymous } = body;

  if (!requestId || !amount || amount <= 0) {
    return c.json({ error: "Request ID and valid amount are required" }, 400);
  }

  const fundingRequest = await prisma.fundingRequest.findUnique({
    where: { id: requestId },
  });

  if (!fundingRequest) {
    return c.json({ error: "Funding request not found" }, 404);
  }

  if (fundingRequest.status !== "active") {
    return c.json({ error: "This funding request is no longer active" }, 400);
  }

  if (!STRIPE_SECRET_KEY) {
    await prisma.fundingDonation.create({
      data: {
        fundingRequestId: requestId,
        donorId: user.userId,
        amount: parseFloat(amount),
        message: message || null,
        isAnonymous: isAnonymous || false,
      },
    });

    await prisma.fundingRequest.update({
      where: { id: requestId },
      data: {
        currentAmount: { increment: parseFloat(amount) },
        supportersCount: { increment: 1 },
      },
    });

    return c.json({
      clientSecret: "demo_mode",
      donationId: "demo",
      message: "Donation recorded in demo mode (no Stripe key configured)",
    });
  }

  try {
    const response = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        amount: Math.round(parseFloat(amount) * 100).toString(),
        currency: "usd",
        "metadata[requestId]": requestId,
        "metadata[donorId]": user.userId,
        "metadata[isAnonymous]": isAnonymous ? "true" : "false",
        "metadata[message]": message || "",
      }).toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Stripe error:", error);
      return c.json({ error: "Failed to create payment intent" }, 500);
    }

    const paymentIntent = (await response.json()) as {
      id: string;
      client_secret: string;
    };

    const donation = await prisma.fundingDonation.create({
      data: {
        fundingRequestId: requestId,
        donorId: user.userId,
        amount: parseFloat(amount),
        message: message || null,
        isAnonymous: isAnonymous || false,
      },
    });

    return c.json({
      clientSecret: paymentIntent.client_secret,
      donationId: donation.id,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Payment intent creation error:", error);
    return c.json({ error: "Failed to create payment intent" }, 500);
  }
});

payments.post("/confirm-donation", authMiddleware, async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const { donationId, paymentIntentId } = body;

  if (!donationId) {
    return c.json({ error: "Donation ID is required" }, 400);
  }

  const donation = await prisma.fundingDonation.findUnique({
    where: { id: donationId },
    include: { fundingRequest: true },
  });

  if (!donation) {
    return c.json({ error: "Donation not found" }, 404);
  }

  if (donation.donorId !== user.userId) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  if (STRIPE_SECRET_KEY && paymentIntentId) {
    try {
      const response = await fetch(
        `https://api.stripe.com/v1/payment_intents/${paymentIntentId}`,
        {
          headers: {
            Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
          },
        },
      );

      if (!response.ok) {
        return c.json({ error: "Failed to verify payment" }, 500);
      }

      const paymentIntent = (await response.json()) as { status: string };

      if (paymentIntent.status !== "succeeded") {
        return c.json({ error: "Payment not completed" }, 400);
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      return c.json({ error: "Failed to verify payment" }, 500);
    }
  }

  await prisma.fundingRequest.update({
    where: { id: donation.fundingRequestId },
    data: {
      currentAmount: { increment: donation.amount },
      supportersCount: { increment: 1 },
    },
  });

  return c.json({
    success: true,
    message: "Donation confirmed successfully",
    donation: {
      id: donation.id,
      amount: donation.amount,
      requestId: donation.fundingRequestId,
    },
  });
});

payments.get("/donations/:requestId", async (c) => {
  const requestId = c.req.param("requestId");

  const donations = await prisma.fundingDonation.findMany({
    where: { fundingRequestId: requestId },
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
  });

  const publicDonations = donations.map((d) => ({
    id: d.id,
    amount: d.isAnonymous ? null : d.amount,
    message: d.message,
    isAnonymous: d.isAnonymous,
    createdAt: d.createdAt,
    donor: d.isAnonymous
      ? { name: "Anonymous" }
      : { name: d.donor.name, avatarUrl: d.donor.avatarUrl },
  }));

  return c.json({ donations: publicDonations });
});
