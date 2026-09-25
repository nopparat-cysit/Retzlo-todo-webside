export const cardColorOptions = [
  {
    value: "DEFAULT",
    label: "Default",
    swatchClass: "bg-stone-100 border-stone-300 dark:bg-white/10 dark:border-white/15",
    cardClass: "border-stone-200/90 bg-white text-stone-900 shadow-sm dark:border-white/10 dark:bg-ink-950/70 dark:text-stone-100",
    softClass: "border-stone-200 bg-stone-50 dark:border-white/10 dark:bg-white/[0.05]",
    accentClass: "text-stone-600 dark:text-stone-400"
  },
  {
    value: "LAVENDER",
    label: "Lavender",
    swatchClass: "bg-indigo-100 border-indigo-400 dark:bg-dusk-lavender dark:border-dusk-lavender",
    cardClass: "border-indigo-200/90 bg-[#faf8ff] text-stone-900 shadow-sm dark:border-dusk-lavender/35 dark:bg-dusk-lavender/[0.13] dark:text-stone-100",
    softClass: "border-indigo-100 bg-indigo-50/60 dark:border-dusk-lavender/30 dark:bg-dusk-lavender/[0.11]",
    accentClass: "text-indigo-600 dark:text-dusk-lavender"
  },
  {
    value: "CYAN",
    label: "Cyan",
    swatchClass: "bg-teal-100 border-teal-400 dark:bg-dusk-cyan dark:border-dusk-cyan",
    cardClass: "border-teal-200/90 bg-[#f2fbfb] text-stone-900 shadow-sm dark:border-dusk-cyan/35 dark:bg-dusk-cyan/[0.12] dark:text-stone-100",
    softClass: "border-teal-100 bg-teal-50/60 dark:border-dusk-cyan/30 dark:bg-dusk-cyan/[0.1]",
    accentClass: "text-teal-600 dark:text-dusk-cyan"
  },
  {
    value: "AMBER",
    label: "Amber",
    swatchClass: "bg-amber-100 border-amber-400 dark:bg-dusk-amber dark:border-dusk-amber",
    cardClass: "border-amber-200/90 bg-[#fefdf5] text-stone-900 shadow-sm dark:border-dusk-amber/35 dark:bg-dusk-amber/[0.12] dark:text-stone-100",
    softClass: "border-amber-100 bg-amber-50/60 dark:border-dusk-amber/30 dark:bg-dusk-amber/[0.1]",
    accentClass: "text-amber-600 dark:text-dusk-amber"
  },
  {
    value: "ROSE",
    label: "Rose",
    swatchClass: "bg-rose-100 border-rose-400 dark:bg-dusk-rose dark:border-dusk-rose",
    cardClass: "border-rose-200/90 bg-[#fff5f6] text-stone-900 shadow-sm dark:border-dusk-rose/35 dark:bg-dusk-rose/[0.12] dark:text-stone-100",
    softClass: "border-rose-100 bg-rose-50/60 dark:border-dusk-rose/30 dark:bg-dusk-rose/[0.1]",
    accentClass: "text-rose-600 dark:text-dusk-rose"
  },
  {
    value: "EMERALD",
    label: "Emerald",
    swatchClass: "bg-emerald-100 border-emerald-400 dark:bg-emerald-300 dark:border-emerald-300",
    cardClass: "border-emerald-200/90 bg-[#f3fcf6] text-stone-900 shadow-sm dark:border-emerald-300/30 dark:bg-emerald-300/[0.1] dark:text-stone-100",
    softClass: "border-emerald-100 bg-emerald-50/60 dark:border-emerald-300/25 dark:bg-emerald-300/[0.09]",
    accentClass: "text-emerald-600 dark:text-emerald-200"
  },
  {
    value: "VIOLET",
    label: "Violet",
    swatchClass: "bg-violet-100 border-violet-400 dark:bg-violet-300 dark:border-violet-300",
    cardClass: "border-violet-200/90 bg-[#f8f6ff] text-stone-900 shadow-sm dark:border-violet-300/30 dark:bg-violet-300/[0.11] dark:text-stone-100",
    softClass: "border-violet-100 bg-violet-50/60 dark:border-violet-300/25 dark:bg-violet-300/[0.09]",
    accentClass: "text-violet-600 dark:text-violet-200"
  },
  {
    value: "BLUE",
    label: "Blue",
    swatchClass: "bg-sky-100 border-sky-400 dark:bg-sky-300 dark:border-sky-300",
    cardClass: "border-sky-200/90 bg-[#f3f9ff] text-stone-900 shadow-sm dark:border-sky-300/30 dark:bg-sky-300/[0.1] dark:text-stone-100",
    softClass: "border-sky-100 bg-sky-50/60 dark:border-sky-300/25 dark:bg-sky-300/[0.09]",
    accentClass: "text-sky-600 dark:text-sky-200"
  },
  {
    value: "WINE",
    label: "Wine",
    swatchClass: "bg-pink-100 border-pink-400 dark:bg-pink-300 dark:border-pink-300",
    cardClass: "border-pink-200/90 bg-[#fdf4f8] text-stone-900 shadow-sm dark:border-pink-300/30 dark:bg-pink-300/[0.1] dark:text-stone-100",
    softClass: "border-pink-100 bg-pink-50/60 dark:border-pink-300/25 dark:bg-pink-300/[0.09]",
    accentClass: "text-pink-600 dark:text-pink-200"
  },
  {
    value: "SLATE",
    label: "Slate",
    swatchClass: "bg-slate-200 border-slate-400 dark:bg-slate-300 dark:border-slate-300",
    cardClass: "border-slate-300/90 bg-[#f8fafc] text-stone-900 shadow-sm dark:border-slate-300/25 dark:bg-slate-300/[0.08] dark:text-stone-100",
    softClass: "border-slate-200 bg-slate-100/60 dark:border-slate-300/20 dark:bg-slate-300/[0.07]",
    accentClass: "text-slate-600 dark:text-slate-200"
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
