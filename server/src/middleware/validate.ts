import type { Context, Next } from "hono";
import { z, ZodSchema } from "zod";

declare module "hono" {
  interface ContextVariableMap {
    validatedBody?: unknown;
  }
}

export function validate<T extends ZodSchema>(schema: T) {
  return async (c: Context, next: Next) => {
    const body = await c.req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return c.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        400,
      );
    }

    c.set("validatedBody", result.data);
    await next();
  };
}

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.enum(["woman", "sponsor"]).default("woman"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  isPublic: z.boolean().optional(),
});
