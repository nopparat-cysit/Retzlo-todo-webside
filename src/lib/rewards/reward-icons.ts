export const rewardIconOptions = [
  { id: "coin", src: "/stickers/rewards/reward-icon-01-coin.png", label: "Coin" },
  { id: "gift", src: "/stickers/rewards/reward-icon-02-gift.png", label: "Gift" },
  { id: "coffee", src: "/stickers/rewards/reward-icon-03-coffee.png", label: "Coffee" },
  { id: "game", src: "/stickers/rewards/reward-icon-04-game.png", label: "Game" },
  { id: "ticket", src: "/stickers/rewards/reward-icon-05-ticket.png", label: "Ticket" },
  { id: "snack", src: "/stickers/rewards/reward-icon-06-snack.png", label: "Snack" },
  { id: "book", src: "/stickers/rewards/reward-icon-07-book.png", label: "Book" },
  { id: "headphones", src: "/stickers/rewards/reward-icon-08-headphones.png", label: "Headphones" },
  { id: "plant", src: "/stickers/rewards/reward-icon-09-plant.png", label: "Plant" },
  { id: "trophy", src: "/stickers/rewards/reward-icon-10-trophy.png", label: "Trophy" },
  { id: "medal", src: "/stickers/rewards/reward-icon-11-medal.png", label: "Medal" },
  { id: "coupon", src: "/stickers/rewards/reward-icon-12-coupon.png", label: "Coupon" },
  { id: "keycap", src: "/stickers/rewards/reward-icon-13-keycap.png", label: "Keycap" },
  { id: "calendar-pass", src: "/stickers/rewards/reward-icon-14-calendar-pass.png", label: "Calendar pass" },
  { id: "star-badge", src: "/stickers/rewards/reward-icon-15-star-badge.png", label: "Star badge" },
  { id: "wallet", src: "/stickers/rewards/reward-icon-16-wallet.png", label: "Wallet" },
  { id: "shopping-bag", src: "/stickers/rewards/reward-icon-17-shopping-bag.png", label: "Shopping bag" },
  { id: "sparkles", src: "/stickers/rewards/reward-icon-18-sparkles.png", label: "Sparkles" },
  { id: "tea", src: "/stickers/rewards/reward-icon-19-tea.png", label: "Tea" },
  { id: "cake", src: "/stickers/rewards/reward-icon-20-cake.png", label: "Cake" },
  { id: "music", src: "/stickers/rewards/reward-icon-21-music.png", label: "Music" },
  { id: "rest-pillow", src: "/stickers/rewards/reward-icon-22-rest-pillow.png", label: "Rest pillow" },
  { id: "lucky-charm", src: "/stickers/rewards/reward-icon-23-lucky-charm.png", label: "Lucky charm" },
  { id: "checklist", src: "/stickers/rewards/reward-icon-24-checklist.png", label: "Checklist" },
  { id: "treasure", src: "/stickers/rewards/reward-icon-25-treasure.png", label: "Treasure" }
] as const;

const rewardKeywordMap = [
  ["coffee", "coffee"],
  ["tea", "tea"],
  ["game", "game"],
  ["gaming", "game"],
  ["movie", "ticket"],
  ["ticket", "ticket"],
  ["snack", "snack"],
  ["food", "snack"],
  ["book", "book"],
  ["read", "book"],
  ["headphone", "headphones"],
  ["music", "music"],
  ["plant", "plant"],
  ["trophy", "trophy"],
  ["medal", "medal"],
  ["coupon", "coupon"],
  ["keycap", "keycap"],
  ["keyboard", "keycap"],
  ["calendar", "calendar-pass"],
  ["badge", "star-badge"],
  ["wallet", "wallet"],
  ["cash", "wallet"],
  ["money", "wallet"],
  ["shop", "shopping-bag"],
  ["bag", "shopping-bag"],
  ["cake", "cake"],
  ["rest", "rest-pillow"],
  ["sleep", "rest-pillow"],
  ["lucky", "lucky-charm"],
  ["check", "checklist"],
  ["treasure", "treasure"],
  ["gift", "gift"]
] as const;

export function getRewardIconForName(name: string) {
  const normalized = name.toLowerCase();
  const match = rewardKeywordMap.find(([keyword]) => normalized.includes(keyword));
  const id = match?.[1] ?? "gift";

  return rewardIconOptions.find((icon) => icon.id === id) ?? rewardIconOptions[1];
}
