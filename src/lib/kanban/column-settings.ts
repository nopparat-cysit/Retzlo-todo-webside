import { z } from "zod";

export const columnThemeOptions = [
  {
    id: "default",
    label: "Default",
    swatchClass: "bg-stone-400",
    columnClass: "border-white/10 bg-white/[0.04]",
    headerClass: "border-white/10"
  },
  {
    id: "lavender",
    label: "Lavender",
    swatchClass: "bg-dusk-lavender",
    columnClass: "border-dusk-lavender/25 bg-dusk-lavender/[0.07]",
    headerClass: "border-dusk-lavender/20"
  },
  {
    id: "amber",
    label: "Amber",
    swatchClass: "bg-dusk-amber",
    columnClass: "border-dusk-amber/25 bg-dusk-amber/[0.06]",
    headerClass: "border-dusk-amber/20"
  },
  {
    id: "rose",
    label: "Rose",
    swatchClass: "bg-dusk-rose",
    columnClass: "border-dusk-rose/25 bg-dusk-rose/[0.06]",
    headerClass: "border-dusk-rose/20"
  },
  {
    id: "cyan",
    label: "Cyan",
    swatchClass: "bg-dusk-cyan",
    columnClass: "border-dusk-cyan/25 bg-dusk-cyan/[0.06]",
    headerClass: "border-dusk-cyan/20"
  },
  {
    id: "mint",
    label: "Mint",
    swatchClass: "bg-emerald-300",
    columnClass: "border-emerald-300/20 bg-emerald-300/[0.055]",
    headerClass: "border-emerald-300/15"
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

export type ColumnThemeId = (typeof columnThemeOptions)[number]["id"];
export type ColumnIconId = (typeof columnIconOptions)[number]["id"];

const columnThemeIds = columnThemeOptions.map((option) => option.id) as [ColumnThemeId, ...ColumnThemeId[]];
const columnIconIds = columnIconOptions.map((option) => option.id) as [ColumnIconId, ...ColumnIconId[]];

export const columnSettingsSchema = z.object({
  name: z.string().trim().min(1).max(80),
  color: z.enum(columnThemeIds).default("default"),
  icon: z.enum(columnIconIds).default("kanban")
});

export type ColumnSettingsInput = z.infer<typeof columnSettingsSchema>;

export function getColumnThemeOption(color: string | null | undefined) {
  return columnThemeOptions.find((option) => option.id === color) ?? columnThemeOptions[0];
}

export function getColumnIconOption(icon: string | null | undefined) {
  return columnIconOptions.find((option) => option.id === icon) ?? columnIconOptions[0];
}
