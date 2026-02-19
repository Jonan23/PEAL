import { Hono } from "hono";
import { cors } from "hono/cors";
import { config } from "./config/env.js";
import { errorMiddleware } from "./middleware/error.js";
import {
  generalRateLimit,
  authRateLimit,
  uploadRateLimit,
} from "./middleware/rate-limit.js";
import { logger } from "./utils/logger.js";
import { auth } from "./routes/auth.js";
import { users } from "./routes/users.js";
import { videos } from "./routes/videos.js";
import { requests } from "./routes/requests.js";
import { stories } from "./routes/stories.js";
import { search } from "./routes/search.js";
import { mentors } from "./routes/mentors.js";
import { messages } from "./routes/messages.js";
import { notifications } from "./routes/notifications.js";
import { settings } from "./routes/settings.js";
import { uploads } from "./routes/uploads.js";
import { payments } from "./routes/payments.js";
import { goals } from "./routes/goals.js";
import { events } from "./routes/events.js";
import { moderation } from "./routes/moderation.js";
import { admin } from "./routes/admin.js";
import { prisma } from "./config/database.js";
import { initWebSocket } from "./services/websocket.js";
import {
  findMatchingMentors,
  getRecommendedMentors,
} from "./services/mentor-matching.js";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: config.app.frontendUrl,
    credentials: true,
  }),
);

app.use("*", errorMiddleware);

app.get("/health", async (c) => {
  try {
    await prisma.$queryRaw`SELECT 1 as health`;
    return c.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "up",
      },
    });
  } catch (e) {
    logger.error("Health check failed", e as Error);
    return c.json(
      {
        status: "degraded",
        timestamp: new Date().toISOString(),
        services: {
          database: "down",
        },
      },
      503,
    );
  }
});

app.get("/logs", (c) => {
  if (config.app.nodeEnv !== "development") {
    return c.json({ error: "Not found" }, 404);
  }
  const level = c.req.query("level");
  const limit = parseInt(c.req.query("limit") || "100");
  return c.json({ logs: logger.getLogs(level as any, limit) });
});

app.route("/api/auth", auth);
app.route("/api/users", users);
app.route("/api/videos", videos);
app.route("/api/requests", requests);
app.route("/api/stories", stories);
app.route("/api/search", search);
app.route("/api/mentors", mentors);
app.route("/api/messages", messages);
app.route("/api/notifications", notifications);
app.route("/api/settings", settings);
app.route("/api/uploads", uploads);
app.route("/api/payments", payments);
app.route("/api/goals", goals);
app.route("/api/events", events);
app.route("/api/moderation", moderation);
app.route("/api/admin", admin);

app.get("/api/mentors/match/recommendations", async (c) => {
  const userId = c.req.query("userId");
  if (!userId) {
    return c.json({ error: "User ID is required" }, 400);
  }

  try {
    const matches = await getRecommendedMentors(userId);
    return c.json({ matches });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get recommendations";
    return c.json({ error: message }, 500);
  }
});

app.post("/api/mentors/match", async (c) => {
  const body = await c.req.json();
  const { userId, criteria, limit } = body;

  if (!userId) {
    return c.json({ error: "User ID is required" }, 400);
  }

  try {
    const matches = await findMatchingMentors(userId, criteria, limit);
    return c.json({ matches });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to find matching mentors";
    return c.json({ error: message }, 500);
  }
});

app.notFound((c) => {
  return c.json({ error: "Not Found" }, 404);
});

logger.info("Server starting", {
  port: config.app.port,
  env: config.app.nodeEnv,
});

const websocketPort = parseInt(process.env.WEBSOCKET_PORT || "3001");
if (config.app.nodeEnv !== "test") {
  initWebSocket(websocketPort);
}

console.log(`Server running on port ${config.app.port}`);
if (config.app.nodeEnv !== "test") {
  console.log(`WebSocket running on port ${websocketPort}`);
}

export default {
  port: config.app.port,
  fetch: app.fetch,
};
