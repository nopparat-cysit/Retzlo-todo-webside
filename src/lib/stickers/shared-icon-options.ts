export interface SharedIconOption {
  id: string;
  label: string;
  src: string;
}

const retroIconOptions = [
  { id: "coin-reward", src: "/stickers/retro/retro-sticker-01-coin-reward.png", label: "Coin reward" },
  { id: "diary-notebook", src: "/stickers/retro/retro-sticker-02-diary-notebook.png", label: "Diary notebook" },
  { id: "checklist", src: "/stickers/retro/retro-sticker-03-checklist.png", label: "Checklist" },
  { id: "calendar", src: "/stickers/retro/retro-sticker-04-calendar.png", label: "Calendar" },
  { id: "alarm-clock", src: "/stickers/retro/retro-sticker-05-alarm-clock.png", label: "Alarm clock" },
  { id: "soft-star", src: "/stickers/retro/retro-sticker-06-soft-star.png", label: "Soft star" },
  { id: "moon", src: "/stickers/retro/retro-sticker-07-moon.png", label: "Moon" },
  { id: "ring-planet", src: "/stickers/retro/retro-sticker-08-ring-planet.png", label: "Ring planet" },
  { id: "headphones", src: "/stickers/retro/retro-sticker-09-headphones.png", label: "Headphones" },
  { id: "coffee-cup", src: "/stickers/retro/retro-sticker-10-coffee-cup.png", label: "Coffee cup" },
  { id: "pencil", src: "/stickers/retro/retro-sticker-11-pencil.png", label: "Pencil" },
  { id: "paper-note", src: "/stickers/retro/retro-sticker-12-paper-note.png", label: "Paper note" },
  { id: "project-folder", src: "/stickers/retro/retro-sticker-13-project-folder.png", label: "Project folder" },
  { id: "city-sunset", src: "/stickers/retro/retro-sticker-14-city-sunset.png", label: "City sunset" },
  { id: "cloud", src: "/stickers/retro/retro-sticker-15-cloud.png", label: "Cloud" },
  { id: "tape", src: "/stickers/retro/retro-sticker-16-tape.png", label: "Tape" },
  { id: "envelope", src: "/stickers/retro/retro-sticker-17-envelope.png", label: "Envelope" },
  { id: "gift", src: "/stickers/retro/retro-sticker-18-gift.png", label: "Gift" },
  { id: "heart", src: "/stickers/retro/retro-sticker-19-heart.png", label: "Heart" },
  { id: "sparkles", src: "/stickers/retro/retro-sticker-20-sparkles.png", label: "Sparkles" },
  { id: "music-note", src: "/stickers/retro/retro-sticker-21-music-note.png", label: "Music note" },
  { id: "bookmark", src: "/stickers/retro/retro-sticker-22-bookmark.png", label: "Bookmark" },
  { id: "keyboard-key", src: "/stickers/retro/retro-sticker-23-keyboard-key.png", label: "Keyboard key" },
  { id: "focus-timer", src: "/stickers/retro/retro-sticker-24-focus-timer.png", label: "Focus timer" },
  { id: "mascot-blob", src: "/stickers/retro/retro-sticker-25-mascot-blob.png", label: "Mascot blob" }
] as const satisfies readonly SharedIconOption[];

const uniqueRewardIconOptions = [
  { id: "reward-game", src: "/stickers/rewards/reward-icon-04-game.png", label: "Game" },
  { id: "reward-ticket", src: "/stickers/rewards/reward-icon-05-ticket.png", label: "Ticket" },
  { id: "reward-snack", src: "/stickers/rewards/reward-icon-06-snack.png", label: "Snack" },
  { id: "reward-book", src: "/stickers/rewards/reward-icon-07-book.png", label: "Book" },
  { id: "reward-plant", src: "/stickers/rewards/reward-icon-09-plant.png", label: "Plant" },
  { id: "reward-trophy", src: "/stickers/rewards/reward-icon-10-trophy.png", label: "Trophy" },
  { id: "reward-medal", src: "/stickers/rewards/reward-icon-11-medal.png", label: "Medal" },
  { id: "reward-coupon", src: "/stickers/rewards/reward-icon-12-coupon.png", label: "Coupon" },
  { id: "reward-wallet", src: "/stickers/rewards/reward-icon-16-wallet.png", label: "Wallet" },
  { id: "reward-shopping-bag", src: "/stickers/rewards/reward-icon-17-shopping-bag.png", label: "Shopping bag" },
  { id: "reward-tea", src: "/stickers/rewards/reward-icon-19-tea.png", label: "Tea" },
  { id: "reward-cake", src: "/stickers/rewards/reward-icon-20-cake.png", label: "Cake" },
  { id: "reward-rest-pillow", src: "/stickers/rewards/reward-icon-22-rest-pillow.png", label: "Rest pillow" },
  { id: "reward-lucky-charm", src: "/stickers/rewards/reward-icon-23-lucky-charm.png", label: "Lucky charm" },
  { id: "reward-treasure", src: "/stickers/rewards/reward-icon-25-treasure.png", label: "Treasure" }
] as const satisfies readonly SharedIconOption[];

export const sharedIconOptions = [
  ...retroIconOptions,
  ...uniqueRewardIconOptions
] as const satisfies readonly SharedIconOption[];

const sharedIconSrcSet: Set<string> = new Set(sharedIconOptions.map((icon) => icon.src));

const sharedIconKeywordMap = [
  ["coffee", "coffee-cup"],
  ["tea", "reward-tea"],
  ["game", "reward-game"],
  ["gaming", "reward-game"],
  ["movie", "reward-ticket"],
  ["ticket", "reward-ticket"],
  ["snack", "reward-snack"],
  ["food", "reward-snack"],
  ["book", "reward-book"],
  ["read", "reward-book"],
  ["headphone", "headphones"],
  ["music", "music-note"],
  ["plant", "reward-plant"],
  ["trophy", "reward-trophy"],
  ["medal", "reward-medal"],
  ["keycap", "keyboard-key"],
  ["keyboard", "keyboard-key"],
  ["coupon", "reward-coupon"],
  ["calendar", "calendar"],
  ["badge", "soft-star"],
  ["star", "soft-star"],
  ["wallet", "reward-wallet"],
  ["cash", "reward-wallet"],
  ["money", "reward-wallet"],
  ["shop", "reward-shopping-bag"],
  ["bag", "reward-shopping-bag"],
  ["cake", "reward-cake"],
  ["rest", "reward-rest-pillow"],
  ["sleep", "reward-rest-pillow"],
  ["lucky", "reward-lucky-charm"],
  ["check", "checklist"],
  ["treasure", "reward-treasure"],
  ["coin", "coin-reward"],
  ["gift", "gift"]
] as const;

export function isSharedIconPath(value: string) {
  return sharedIconSrcSet.has(value);
}

export function normalizeSharedIconSelection(values: unknown) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values.filter((value): value is string => typeof value === "string" && isSharedIconPath(value));
}

export function getSharedIconOption(id: string) {
  return sharedIconOptions.find((icon) => icon.id === id) ?? sharedIconOptions[17];
}

export function getSharedIconForName(name: string) {
  const normalized = name.toLowerCase();
  const match = sharedIconKeywordMap.find(([keyword]) => normalized.includes(keyword));

  return getSharedIconOption(match?.[1] ?? "gift");
}
