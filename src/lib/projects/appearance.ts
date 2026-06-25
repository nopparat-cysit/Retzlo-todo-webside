import { z } from "zod";

import { isSharedIconPath } from "@/lib/stickers/shared-icon-options";
import { cardColorValues } from "@/lib/theme/card-colors";

export const DEFAULT_PROJECT_STICKER = "/stickers/retro/retro-sticker-13-project-folder.png";

export const projectAppearanceSchema = z.object({
  themeColor: z.enum(cardColorValues).default("DEFAULT"),
  sticker: z
    .string()
    .trim()
    .default(DEFAULT_PROJECT_STICKER)
    .refine((value) => isSharedIconPath(value), "Use a supported project sticker.")
});

export const projectAppearanceUpdateSchema = projectAppearanceSchema.partial();

export function parseProjectAppearancePayload(payload: unknown) {
  return projectAppearanceSchema.parse(payload);
}
