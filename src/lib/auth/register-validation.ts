import { z } from "zod";

const registerSchema = z
  .object({
    email: z.string().email(),
    username: z
      .string()
      .trim()
      .min(3)
      .max(30)
      .regex(/^[a-zA-Z0-9_-]+$/),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    name: z.string().trim().min(1).max(80).optional()
  })
  .refine((payload) => payload.password === payload.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
  });

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
  name?: string;
}

export function parseRegisterPayload(payload: unknown): RegisterPayload {
  const parsed = registerSchema.parse(payload);

  return {
    email: parsed.email.toLowerCase(),
    username: parsed.username.trim().toLowerCase(),
    password: parsed.password,
    name: parsed.name?.trim()
  };
}
