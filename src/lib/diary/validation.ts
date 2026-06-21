import { z } from "zod";

import { normalizeDiaryChecklist } from "@/lib/diary/checklist";
import { cardColorValues } from "@/lib/theme/card-colors";

const diaryChecklistSchema = z.array(
  z.object({
    id: z.string().trim().min(1).optional(),
    label: z.string().trim().min(1).max(160),
    description: z.string().trim().max(1000).optional().default(""),
    intervalDays: z.coerce.number().int().min(1).max(365),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    dueTime: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
    completedDates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).default([])
  })
).default([]);

export const createDiaryItemSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.preprocess((value) => value ?? "", z.string().trim().max(5000)),
  color: z.enum(cardColorValues).default("DEFAULT"),
  intervalDays: z.coerce.number().int().min(1).max(365),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checklist: diaryChecklistSchema,
  dueTime: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  isStarred: z.boolean().default(false),
  isHidden: z.boolean().default(false)
});

export const updateDiaryItemSchema = createDiaryItemSchema.partial();

export function parseCreateDiaryItemPayload(payload: unknown) {
  const parsed = createDiaryItemSchema.parse(payload);

  return {
    ...parsed,
    checklist: normalizeDiaryChecklist(parsed.checklist, parsed.startDate)
  };
}

export function parseUpdateDiaryItemPayload(payload: unknown, fallbackStartDate?: string | Date) {
  const parsed = updateDiaryItemSchema.parse(payload);

  return {
    ...parsed,
    checklist: parsed.checklist ? normalizeDiaryChecklist(parsed.checklist, parsed.startDate ?? fallbackStartDate) : undefined
  };
}
