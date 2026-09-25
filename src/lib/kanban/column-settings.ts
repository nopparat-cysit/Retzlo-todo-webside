import { z } from "zod";

import type { CardStatus } from "@/types/kanban";

export const columnThemeOptions = [
  {
    id: "default",
    label: "Default",
    swatchClass: "bg-stone-400 dark:bg-stone-500",
    accentBarClass: "bg-stone-300 dark:bg-stone-600",
    iconColorClass: "text-stone-500 dark:text-stone-400",
    columnClass: "border-stone-200/80 bg-stone-100/75 dark:border-white/10 dark:bg-white/[0.04]",
    headerClass: "border-stone-200/80 dark:border-white/10"
  },
  {
    id: "lavender",
    label: "Lavender",
    swatchClass: "bg-indigo-500 dark:bg-dusk-lavender",
    accentBarClass: "bg-indigo-500 dark:bg-dusk-lavender",
    iconColorClass: "text-indigo-600 dark:text-dusk-lavender",
    columnClass: "border-indigo-200/60 bg-indigo-50/30 dark:border-dusk-lavender/25 dark:bg-dusk-lavender/[0.07]",
    headerClass: "border-indigo-100/90 dark:border-dusk-lavender/20"
  },
  {
    id: "amber",
    label: "Amber",
    swatchClass: "bg-amber-500 dark:bg-dusk-amber",
    accentBarClass: "bg-amber-500 dark:bg-dusk-amber",
    iconColorClass: "text-amber-600 dark:text-dusk-amber",
    columnClass: "border-amber-200/60 bg-amber-50/30 dark:border-dusk-amber/25 dark:bg-dusk-amber/[0.06]",
    headerClass: "border-amber-100/90 dark:border-dusk-amber/20"
  },
  {
    id: "rose",
    label: "Rose",
    swatchClass: "bg-rose-500 dark:bg-dusk-rose",
    accentBarClass: "bg-rose-500 dark:bg-dusk-rose",
    iconColorClass: "text-rose-500 dark:text-dusk-rose",
    columnClass: "border-rose-200/60 bg-rose-50/30 dark:border-dusk-rose/25 dark:bg-dusk-rose/[0.06]",
    headerClass: "border-rose-100/90 dark:border-dusk-rose/20"
  },
  {
    id: "cyan",
    label: "Cyan",
    swatchClass: "bg-teal-500 dark:bg-dusk-cyan",
    accentBarClass: "bg-teal-500 dark:bg-dusk-cyan",
    iconColorClass: "text-teal-600 dark:text-dusk-cyan",
    columnClass: "border-teal-200/60 bg-teal-50/30 dark:border-dusk-cyan/25 dark:bg-dusk-cyan/[0.06]",
    headerClass: "border-teal-100/90 dark:border-dusk-cyan/20"
  },
  {
    id: "mint",
    label: "Mint",
    swatchClass: "bg-emerald-500 dark:bg-emerald-300",
    accentBarClass: "bg-emerald-500 dark:bg-emerald-400",
    iconColorClass: "text-emerald-600 dark:text-emerald-400",
    columnClass: "border-emerald-200/60 bg-emerald-50/30 dark:border-emerald-300/20 dark:bg-emerald-300/[0.055]",
    headerClass: "border-emerald-100/90 dark:border-emerald-300/15"
  }
] as const;

export const columnIconOptions = [
  { id: "kanban", label: "Board" },
  { id: "inbox", label: "Inbox" },
  { id: "list", label: "List" },
  { id: "sparkles", label: "Sparkles" },
  { id: "clock", label: "Clock" },
  { id: "timer", label: "Timer" },
  { id: "calendar", label: "Calendar" },
  { id: "target", label: "Target" },
  { id: "rocket", label: "Rocket" },
  { id: "flame", label: "Flame" },
  { id: "star", label: "Star" },
  { id: "heart", label: "Heart" },
  { id: "coffee", label: "Coffee" },
  { id: "book", label: "Book" },
  { id: "code", label: "Code" },
  { id: "palette", label: "Palette" },
  { id: "wrench", label: "Wrench" },
  { id: "bug", label: "Bug" },
  { id: "shield", label: "Shield" },
  { id: "check", label: "Check" },
  { id: "archive", label: "Archive" },
  { id: "package", label: "Package" },
  { id: "gift", label: "Gift" },
  { id: "coin", label: "Coin" }
] as const;

export const columnStatusOptions: Array<{ value: CardStatus; label: string }> = [
  { value: "TODO", label: "Todo" },
  { value: "DOING", label: "Doing" },
  { value: "WAITING", label: "Waiting" },
  { value: "DONE", label: "Done" }
];

export type ColumnThemeId = (typeof columnThemeOptions)[number]["id"];
export type ColumnIconId = (typeof columnIconOptions)[number]["id"];

const columnThemeIds = columnThemeOptions.map((option) => option.id) as [ColumnThemeId, ...ColumnThemeId[]];
const columnIconIds = columnIconOptions.map((option) => option.id) as [ColumnIconId, ...ColumnIconId[]];
const columnStatusIds = columnStatusOptions.map((option) => option.value) as [CardStatus, ...CardStatus[]];

export const columnSettingsSchema = z.object({
  name: z.string().trim().min(1).max(80),
  color: z.enum(columnThemeIds).default("default"),
  icon: z.enum(columnIconIds).default("kanban"),
  defaultCardStatus: z.enum(columnStatusIds).default("TODO"),
  wipLimit: z
    .union([
      z.number().int().min(1).max(99),
      z.literal("").transform(() => null),
      z.null()
    ])
    .optional()
    .nullable()
});

export type ColumnSettingsInput = z.infer<typeof columnSettingsSchema>;

export function getColumnThemeOption(color: string | null | undefined) {
  return columnThemeOptions.find((option) => option.id === color) ?? columnThemeOptions[0];
}

export function getColumnIconOption(icon: string | null | undefined) {
  return columnIconOptions.find((option) => option.id === icon) ?? columnIconOptions[0];
}