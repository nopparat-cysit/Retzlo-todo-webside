import { z } from "zod";

import { cardColorValues } from "@/lib/theme/card-colors";

export const createDiaryItemSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.preprocess((value) => value ?? "", z.string().trim().max(5000)),
  color: z.enum(cardColorValues).default("DEFAULT"),
  intervalDays: z.coerce.number().int().min(1).max(365),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dueTime: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  isStarred: z.boolean().default(false),
  isHidden: z.boolean().default(false)
});

export const updateDiaryItemSchema = createDiaryItemSchema.partial();

export function parseCreateDiaryItemPayload(payload: unknown) {
  return createDiaryItemSchema.parse(payload);
}

export function parseUpdateDiaryItemPayload(payload: unknown) {
  return updateDiaryItemSchema.parse(payload);
}
