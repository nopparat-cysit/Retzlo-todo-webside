import { z } from "zod";

import { isSharedIconPath } from "@/lib/stickers/shared-icon-options";
import { cardColorValues } from "@/lib/theme/card-colors";

const DEFAULT_NOTE_STICKER = "/stickers/retro/retro-sticker-12-paper-note.png";
const noteEmojiSchema = z
  .string()
  .trim()
  .min(1)
  .max(128)
  .refine((value) => value.length <= 16 || isSharedIconPath(value), "Use a short emoji or a supported sticker.")
  .default(DEFAULT_NOTE_STICKER);

export const createNoteSchema = z.object({
  title: z.string().trim().min(1).max(120),
  content: z.preprocess((value) => value ?? "", z.string().trim().max(5000)),
  emoji: noteEmojiSchema,
  color: z.enum(cardColorValues).default("DEFAULT"),
  isHidden: z.boolean().default(false),
  dueDate: z.string().datetime().nullable().optional(),
  dueDateAllDay: z.boolean().default(false)
});

export const updateNoteSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  content: z.string().trim().max(5000).optional(),
  emoji: noteEmojiSchema.optional(),
  color: z.enum(cardColorValues).optional(),
  isStarred: z.boolean().optional(),
  isHidden: z.boolean().optional(),
  isCompleted: z.boolean().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  dueDateAllDay: z.boolean().optional()
});

export function parseCreateNotePayload(payload: unknown) {
  const parsed = createNoteSchema.parse(payload);

  return {
    title: parsed.title,
    content: parsed.content,
    emoji: parsed.emoji,
    color: parsed.color,
    isHidden: parsed.isHidden,
    dueDate: parsed.dueDate,
    dueDateAllDay: parsed.dueDateAllDay
  };
}

export function parseUpdateNotePayload(payload: unknown) {
  return updateNoteSchema.parse(payload);
}
