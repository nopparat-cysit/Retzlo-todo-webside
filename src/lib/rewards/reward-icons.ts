import {
  getSharedIconForName,
  getSharedIconOption,
  sharedIconOptions
} from "@/lib/stickers/shared-icon-options";

export const rewardIconOptions = sharedIconOptions;

export function getRewardIconOption(id: string) {
  return getSharedIconOption(id);
}

export function getRewardIconForName(name: string) {
  return getSharedIconForName(name);
}
