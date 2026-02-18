import type { Context, Next } from "hono";
import { logger } from "../utils/logger.js";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const inMemoryStore = new Map<string, RateLimitEntry>();

function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of inMemoryStore.entries()) {
    if (entry.resetTime < now) {
      inMemoryStore.delete(key);
    }
  }
}

setInterval(cleanupExpiredEntries, 60000);

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
  keyGenerator?: (c: Context) => string;
}

export function rateLimit(options: RateLimitOptions) {
  const {
    windowMs,
    maxRequests,
    message = "Too many requests, please try again later",
    keyGenerator = (c: Context) =>
      c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown",
  } = options;

  return async (c: Context, next: Next) => {
    const key = keyGenerator(c);
    const now = Date.now();

    let entry = inMemoryStore.get(key);

    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + windowMs,
      };
      inMemoryStore.set(key, entry);
    }

    entry.count++;

    const remaining = Math.max(0, maxRequests - entry.count);
    const resetTime = Math.ceil((entry.resetTime - now) / 1000);

    c.res.headers.set("X-RateLimit-Limit", maxRequests.toString());
    c.res.headers.set("X-RateLimit-Remaining", remaining.toString());
    c.res.headers.set("X-RateLimit-Reset", resetTime.toString());

    if (entry.count > maxRequests) {
      logger.warn("Rate limit exceeded", { key, count: entry.count });
      return c.json({ error: message }, 429);
    }

    await next();
  };
}

export const generalRateLimit = rateLimit({
  windowMs: 60000,
  maxRequests: 100,
  message: "Too many requests, please try again later",
});

export const authRateLimit = rateLimit({
  windowMs: 900000,
  maxRequests: 5,
  message: "Too many authentication attempts, please try again later",
});

export const uploadRateLimit = rateLimit({
  windowMs: 3600000,
  maxRequests: 10,
  message: "Too many uploads, please try again later",
});
