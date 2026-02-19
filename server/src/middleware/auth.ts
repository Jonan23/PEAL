import type { Context, Next } from "hono";
import { verifyAccessToken, type TokenPayload } from "../config/auth.js";

export interface AuthContext {
  user: TokenPayload;
  userId: string;
}

declare module "hono" {
  interface ContextVariableMap extends AuthContext {}
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized: No token provided" }, 401);
  }

  const token = authHeader.substring(7);

  try {
    const payload = await verifyAccessToken(token);
    c.set("user", payload as TokenPayload);
    c.set("userId", payload.userId);
    await next();
  } catch {
    return c.json({ error: "Unauthorized: Invalid token" }, 401);
  }
}

export function getUser(c: Context): TokenPayload | undefined {
  return c.get("user") as TokenPayload | undefined;
}
