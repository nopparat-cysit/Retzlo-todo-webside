export const cardColorOptions = [
  {
    value: "DEFAULT",
    label: "Default",
    swatchClass: "bg-white/10 border-white/15",
    cardClass: "border-white/10 bg-ink-950/70",
    softClass: "border-white/10 bg-white/[0.05]",
    accentClass: "text-stone-400"
  },
  {
    value: "LAVENDER",
    label: "Lavender",
    swatchClass: "bg-dusk-lavender border-dusk-lavender",
    cardClass: "border-dusk-lavender/35 bg-dusk-lavender/[0.13]",
    softClass: "border-dusk-lavender/30 bg-dusk-lavender/[0.11]",
    accentClass: "text-dusk-lavender"
  },
  {
    value: "CYAN",
    label: "Cyan",
    swatchClass: "bg-dusk-cyan border-dusk-cyan",
    cardClass: "border-dusk-cyan/35 bg-dusk-cyan/[0.12]",
    softClass: "border-dusk-cyan/30 bg-dusk-cyan/[0.1]",
    accentClass: "text-dusk-cyan"
  },
  {
    value: "AMBER",
    label: "Amber",
    swatchClass: "bg-dusk-amber border-dusk-amber",
    cardClass: "border-dusk-amber/35 bg-dusk-amber/[0.12]",
    softClass: "border-dusk-amber/30 bg-dusk-amber/[0.1]",
    accentClass: "text-dusk-amber"
  },
  {
    value: "ROSE",
    label: "Rose",
    swatchClass: "bg-dusk-rose border-dusk-rose",
    cardClass: "border-dusk-rose/35 bg-dusk-rose/[0.12]",
    softClass: "border-dusk-rose/30 bg-dusk-rose/[0.1]",
    accentClass: "text-dusk-rose"
  },
  {
    value: "EMERALD",
    label: "Emerald",
    swatchClass: "bg-emerald-300 border-emerald-300",
    cardClass: "border-emerald-300/30 bg-emerald-300/[0.1]",
    softClass: "border-emerald-300/25 bg-emerald-300/[0.09]",
    accentClass: "text-emerald-200"
  },
  {
    value: "VIOLET",
    label: "Violet",
    swatchClass: "bg-violet-300 border-violet-300",
    cardClass: "border-violet-300/30 bg-violet-300/[0.11]",
    softClass: "border-violet-300/25 bg-violet-300/[0.09]",
    accentClass: "text-violet-200"
  },
  {
    value: "BLUE",
    label: "Blue",
    swatchClass: "bg-sky-300 border-sky-300",
    cardClass: "border-sky-300/30 bg-sky-300/[0.1]",
    softClass: "border-sky-300/25 bg-sky-300/[0.09]",
    accentClass: "text-sky-200"
  },
  {
    value: "WINE",
    label: "Wine",
    swatchClass: "bg-pink-300 border-pink-300",
    cardClass: "border-pink-300/30 bg-pink-300/[0.1]",
    softClass: "border-pink-300/25 bg-pink-300/[0.09]",
    accentClass: "text-pink-200"
  },
  {
    value: "SLATE",
    label: "Slate",
    swatchClass: "bg-slate-300 border-slate-300",
    cardClass: "border-slate-300/25 bg-slate-300/[0.08]",
    softClass: "border-slate-300/20 bg-slate-300/[0.07]",
    accentClass: "text-slate-200"
  }
] as const;

export type CardColor = (typeof cardColorOptions)[number]["value"];

export const cardColorValues = cardColorOptions.map((option) => option.value) as [CardColor, ...CardColor[]];

export function normalizeCardColor(value: unknown): CardColor {
  return cardColorOptions.some((option) => option.value === value) ? (value as CardColor) : "DEFAULT";
}

export function getCardColorMeta(value: unknown) {
  const color = normalizeCardColor(value);

  return cardColorOptions.find((option) => option.value === color) ?? cardColorOptions[0];
}
