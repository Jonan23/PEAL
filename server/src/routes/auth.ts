import { Hono } from "hono";
import { prisma } from "../config/database.js";
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "../config/auth.js";
import { authMiddleware, getUser } from "../middleware/auth.js";
import {
  validate,
  registerSchema,
  loginSchema,
  getValidatedBody,
} from "../middleware/validate.js";
import { authRateLimit } from "../middleware/rate-limit.js";
import { sendWelcomeEmail } from "../services/email.js";
import bcrypt from "bcrypt";

export const auth = new Hono();

auth.post("/register", authRateLimit, validate(registerSchema), async (c) => {
  const body = getValidatedBody<{
    email: string;
    password: string;
    name: string;
    role: string;
  }>(c);
  const { email, password, name, role } = body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return c.json({ error: "Email already registered" }, 400);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role,
    },
  });

  await prisma.userSettings.create({
    data: { userId: user.id },
  });

  sendWelcomeEmail(user.email, user.name).catch(console.error);

  const accessToken = await createAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = await createRefreshToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    accessToken,
    refreshToken,
  });
});

auth.post("/login", authRateLimit, validate(loginSchema), async (c) => {
  const body = getValidatedBody<{ email: string; password: string }>(c);
  const { email, password } = body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const accessToken = await createAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = await createRefreshToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    accessToken,
    refreshToken,
  });
});

auth.post("/refresh", async (c) => {
  const body = await c.req.json();
  const { refreshToken } = body;

  if (!refreshToken) {
    return c.json({ error: "Refresh token required" }, 400);
  }

  try {
    const payload = await verifyRefreshToken(refreshToken);
    const userId = payload.userId as string;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return c.json({ error: "User not found" }, 401);
    }

    const accessToken = await createAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = await createRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return c.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch {
    return c.json({ error: "Invalid refresh token" }, 401);
  }
});

auth.get("/me", authMiddleware, async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatarUrl: true,
      bio: true,
      location: true,
      isPublic: true,
      createdAt: true,
    },
  });

  if (!dbUser) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json({ user: dbUser });
});

auth.post("/logout", authMiddleware, async (c) => {
  return c.json({ message: "Logged out successfully" });
});
