import {
  isSharedIconPath,
  normalizeSharedIconSelection,
  sharedIconOptions
} from "@/lib/stickers/shared-icon-options";

export const retroStickerOptions = sharedIconOptions;

export function isRetroStickerPath(value: string) {
  return isSharedIconPath(value);
}

export function normalizeRetroStickerSelection(values: unknown) {
  return normalizeSharedIconSelection(values);
}
