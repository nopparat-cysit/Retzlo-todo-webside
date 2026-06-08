import { z } from "zod";

import { cardColorValues } from "@/lib/theme/card-colors";

export const createNoteSchema = z.object({
  title: z.string().trim().min(1).max(120),
  content: z.preprocess((value) => value ?? "", z.string().trim().max(5000)),
  color: z.enum(cardColorValues).default("DEFAULT"),
  isHidden: z.boolean().default(false),
  dueDate: z.string().datetime().nullable().optional(),
  dueDateAllDay: z.boolean().default(false)
});

export const updateNoteSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  content: z.string().trim().max(5000).optional(),
  color: z.enum(cardColorValues).optional(),
  isStarred: z.boolean().optional(),
  isHidden: z.boolean().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  dueDateAllDay: z.boolean().optional()
});

export function parseCreateNotePayload(payload: unknown) {
  const parsed = createNoteSchema.parse(payload);

  return {
    title: parsed.title,
    content: parsed.content,
    color: parsed.color,
    isHidden: parsed.isHidden,
    dueDate: parsed.dueDate,
    dueDateAllDay: parsed.dueDateAllDay
  };
}

export function parseUpdateNotePayload(payload: unknown) {
  return updateNoteSchema.parse(payload);
}
