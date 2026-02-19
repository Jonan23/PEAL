import type { Context, Next } from "hono";
import { z, ZodSchema } from "zod";

type InferZod<T extends ZodSchema> = z.infer<T>;

declare module "hono" {
  interface ContextVariableMap {
    validatedBody: unknown;
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

    c.set("validatedBody", result.data as InferZod<T>);
    await next();
  };
}

export function getValidatedBody<T>(c: Context): T {
  return c.get("validatedBody") as T;
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
  avatarUrl: z.string().url().optional().nullable(),
  isPublic: z.boolean().optional(),
});
