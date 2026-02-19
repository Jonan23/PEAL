import type { Context, Next } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export interface AppError extends Error {
  status?: number;
}

export async function errorMiddleware(c: Context, next: Next) {
  try {
    await next();
  } catch (err) {
    const error = err as AppError;
    console.error("Error:", error.message);

    return c.json(
      {
        error: error.message || "Internal Server Error",
        ...(Bun.env.NODE_ENV === "development" && { stack: error.stack }),
      },
      (error.status || 500) as ContentfulStatusCode,
    );
  }
}
