import { Hono } from "hono";
import { prisma } from "../config/database.js";
import { authMiddleware, getUser } from "../middleware/auth.js";

export const goals = new Hono();

goals.get("/", authMiddleware, async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const status = c.req.query("status");

  const where: Record<string, unknown> = { userId: user.userId };
  if (status) {
    where.status = status;
  }

  const userGoals = await prisma.goal.findMany({
    where,
    include: {
      milestones: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return c.json({
    goals: userGoals.map((g) => ({
      ...g,
      milestones: g.milestones.map((m) => ({
        ...m,
        completed: m.completed,
      })),
    })),
  });
});

goals.get("/:id", authMiddleware, async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const id = c.req.param("id");

  const goal = await prisma.goal.findFirst({
    where: { id, userId: user.userId },
    include: {
      milestones: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!goal) {
    return c.json({ error: "Goal not found" }, 404);
  }

  return c.json({ goal });
});

goals.post("/", authMiddleware, async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const { title, description, category, targetDate, priority, milestones } =
    body;

  if (!title || !category || !targetDate) {
    return c.json(
      { error: "Title, category, and target date are required" },
      400,
    );
  }

  const goal = await prisma.goal.create({
    data: {
      userId: user.userId,
      title,
      description,
      category,
      targetDate: new Date(targetDate),
      priority: priority || "medium",
      milestones: milestones
        ? {
            create: milestones.map(
              (m: {
                title: string;
                description?: string;
                dueDate?: string;
              }) => ({
                title: m.title,
                description: m.description,
                dueDate: m.dueDate ? new Date(m.dueDate) : undefined,
              }),
            ),
          }
        : undefined,
    },
    include: {
      milestones: true,
    },
  });

  return c.json({ goal }, 201);
});

goals.put("/:id", authMiddleware, async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const id = c.req.param("id");

  const existingGoal = await prisma.goal.findFirst({
    where: { id, userId: user.userId },
  });

  if (!existingGoal) {
    return c.json({ error: "Goal not found" }, 404);
  }

  const body = await c.req.json();
  const {
    title,
    description,
    category,
    targetDate,
    status,
    progress,
    priority,
  } = body;

  const goal = await prisma.goal.update({
    where: { id },
    data: {
      title,
      description,
      category,
      targetDate: targetDate ? new Date(targetDate) : undefined,
      status,
      progress,
      priority,
    },
    include: {
      milestones: true,
    },
  });

  return c.json({ goal });
});

goals.delete("/:id", authMiddleware, async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const id = c.req.param("id");

  const existingGoal = await prisma.goal.findFirst({
    where: { id, userId: user.userId },
  });

  if (!existingGoal) {
    return c.json({ error: "Goal not found" }, 404);
  }

  await prisma.goal.delete({ where: { id } });

  return c.json({ message: "Goal deleted successfully" });
});

goals.post("/:id/milestones", authMiddleware, async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const goalId = c.req.param("id");

  const existingGoal = await prisma.goal.findFirst({
    where: { id: goalId, userId: user.userId },
  });

  if (!existingGoal) {
    return c.json({ error: "Goal not found" }, 404);
  }

  const body = await c.req.json();
  const { title, description, dueDate } = body;

  if (!title) {
    return c.json({ error: "Title is required" }, 400);
  }

  const milestone = await prisma.goalMilestone.create({
    data: {
      goalId,
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    },
  });

  return c.json({ milestone }, 201);
});

goals.put("/:id/milestones/:milestoneId", authMiddleware, async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const goalId = c.req.param("id");
  const milestoneId = c.req.param("milestoneId");

  const existingGoal = await prisma.goal.findFirst({
    where: { id: goalId, userId: user.userId },
  });

  if (!existingGoal) {
    return c.json({ error: "Goal not found" }, 404);
  }

  const body = await c.req.json();
  const { title, description, dueDate, completed } = body;

  const milestone = await prisma.goalMilestone.update({
    where: { id: milestoneId },
    data: {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      completed,
      completedAt: completed ? new Date() : undefined,
    },
  });

  const allMilestones = await prisma.goalMilestone.findMany({
    where: { goalId },
  });

  const completedCount = allMilestones.filter((m) => m.completed).length;
  const progress = Math.round((completedCount / allMilestones.length) * 100);

  await prisma.goal.update({
    where: { id: goalId },
    data: {
      progress,
      status: progress === 100 ? "completed" : "in_progress",
    },
  });

  return c.json({ milestone });
});

goals.delete("/:id/milestones/:milestoneId", authMiddleware, async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const goalId = c.req.param("id");
  const milestoneId = c.req.param("milestoneId");

  const existingGoal = await prisma.goal.findFirst({
    where: { id: goalId, userId: user.userId },
  });

  if (!existingGoal) {
    return c.json({ error: "Goal not found" }, 404);
  }

  await prisma.goalMilestone.delete({
    where: { id: milestoneId },
  });

  return c.json({ message: "Milestone deleted successfully" });
});

goals.get("/stats/summary", authMiddleware, async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const goals = await prisma.goal.findMany({
    where: { userId: user.userId },
    include: {
      milestones: true,
    },
  });

  const stats = {
    total: goals.length,
    inProgress: goals.filter((g) => g.status === "in_progress").length,
    completed: goals.filter((g) => g.status === "completed").length,
    overdue: goals.filter(
      (g) => g.status !== "completed" && new Date(g.targetDate) < new Date(),
    ).length,
    averageProgress:
      goals.length > 0
        ? Math.round(
            goals.reduce((sum, g) => sum + g.progress, 0) / goals.length,
          )
        : 0,
    byCategory: goals.reduce(
      (acc, g) => {
        acc[g.category] = (acc[g.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
  };

  return c.json({ stats });
});
