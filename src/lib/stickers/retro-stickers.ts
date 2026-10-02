import {
  type SharedIconOption,
  isSharedIconPath,
  sharedIconOptions
} from "@/lib/stickers/shared-icon-options";

export const retroStickerOptions = sharedIconOptions;

const newCardStickerOptions = [
  { id: "idea-bulb", src: "/stickers/retro/retro-sticker-51-idea-bulb.png", label: "Idea bulb" },
  { id: "speech-bubble", src: "/stickers/retro/retro-sticker-52-speech-bubble.png", label: "Speech bubble" },
  { id: "microphone", src: "/stickers/retro/retro-sticker-53-microphone.png", label: "Microphone" },
  { id: "magnifying-glass", src: "/stickers/retro/retro-sticker-54-magnifying-glass.png", label: "Magnifying glass" },
  { id: "hardhat", src: "/stickers/retro/retro-sticker-55-hardhat.png", label: "Safety helmet" },
  { id: "wrench", src: "/stickers/retro/retro-sticker-56-wrench.png", label: "Wrench" },
  { id: "warning-triangle", src: "/stickers/retro/retro-sticker-57-warning-triangle.png", label: "Warning" },
  { id: "priority-flag", src: "/stickers/retro/retro-sticker-58-priority-flag.png", label: "Priority flag" },
  { id: "road-barricade", src: "/stickers/retro/retro-sticker-59-road-barricade.png", label: "Blocked" },
  { id: "repeat-arrows", src: "/stickers/retro/retro-sticker-60-repeat-arrows.png", label: "Repeat" },
  { id: "handoff-arrows", src: "/stickers/retro/retro-sticker-61-handoff-arrows.png", label: "Handoff" },
  { id: "play-button", src: "/stickers/retro/retro-sticker-62-play-button.png", label: "Ready to start" },
  { id: "pause-button", src: "/stickers/retro/retro-sticker-63-pause-button.png", label: "Paused" },
  { id: "team-group", src: "/stickers/retro/retro-sticker-64-team-group.png", label: "Team" },
  { id: "assignee", src: "/stickers/retro/retro-sticker-65-assignee.png", label: "Assignee" },
  { id: "handshake", src: "/stickers/retro/retro-sticker-66-handshake.png", label: "Collaboration" },
  { id: "thumbs-up", src: "/stickers/retro/retro-sticker-67-thumbs-up.png", label: "Approved" },
  { id: "approval-seal", src: "/stickers/retro/retro-sticker-68-approval-seal.png", label: "Approval seal" },
  { id: "receipt", src: "/stickers/retro/retro-sticker-69-receipt.png", label: "Expense" },
  { id: "shopping-cart", src: "/stickers/retro/retro-sticker-70-shopping-cart.png", label: "Shopping" },
  { id: "first-aid-kit", src: "/stickers/retro/retro-sticker-71-first-aid-kit.png", label: "First aid" },
  { id: "shield", src: "/stickers/retro/retro-sticker-72-shield.png", label: "Security" },
  { id: "padlock", src: "/stickers/retro/retro-sticker-73-padlock.png", label: "Private" },
  { id: "notification-bell", src: "/stickers/retro/retro-sticker-74-notification-bell.png", label: "Reminder" },
  { id: "suitcase", src: "/stickers/retro/retro-sticker-75-suitcase.png", label: "Travel" }
] as const satisfies readonly SharedIconOption[];

const cardStickerLibraryOptions = sharedIconOptions.filter(({ src }) => {
  const match = src.match(/^\/stickers\/retro\/retro-sticker-(\d+)-/);
  if (!match) return true;

  const stickerNumber = Number(match[1]);
  return stickerNumber < 26 || stickerNumber > 50;
});

const cardRetroStickerLibraryOptions = cardStickerLibraryOptions.filter(({ src }) => src.startsWith("/stickers/retro/"));
const cardOtherStickerLibraryOptions = cardStickerLibraryOptions.filter(({ src }) => !src.startsWith("/stickers/retro/"));

// Cards use the original 1–25 stickers, the new curated 51–75 set, and reward icons.
// The shared picker library remains untouched for notes, rewards, and project settings.
export const cardStickerOptions: readonly SharedIconOption[] = [
  ...cardRetroStickerLibraryOptions,
  ...newCardStickerOptions,
  ...cardOtherStickerLibraryOptions
];

const newCardStickerPaths = new Set<string>(newCardStickerOptions.map(({ src }) => src));

export function isRetroStickerPath(value: string) {
  return isSharedIconPath(value) || newCardStickerPaths.has(value);
}

export function normalizeRetroStickerSelection(values: unknown) {
  if (!Array.isArray(values)) return [];

  return values.filter((value): value is string => typeof value === "string" && isRetroStickerPath(value));
}
