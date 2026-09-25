import type { CardStatus } from "@/types/kanban";

export const statusOptions: Array<{ value: CardStatus; label: string }> = [
  { value: "TODO", label: "Todo" },
  { value: "DOING", label: "Doing" },
  { value: "WAITING", label: "Waiting" },
  { value: "DONE", label: "Done" }
];

const statusMeta: Record<
  CardStatus,
  {
    label: string;
    badgeClass: string;
    buttonClass: string;
    selectedButtonClass: string;
  }
> = {
  TODO: {
    label: "Todo",
    badgeClass: "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-dusk-lavender/20 dark:bg-dusk-lavender/10 dark:text-dusk-lavender",
    buttonClass: "border-stone-200 bg-stone-50 text-stone-700 hover:border-indigo-300 dark:border-dusk-lavender/20 dark:bg-dusk-lavender/10 dark:text-dusk-lavender dark:hover:border-dusk-lavender/60",
    selectedButtonClass: "border-indigo-600 bg-indigo-600 text-white dark:border-dusk-lavender dark:bg-dusk-lavender dark:text-ink-950"
  },
  DOING: {
    label: "Doing",
    badgeClass: "border-teal-200 bg-teal-50 text-teal-700 dark:border-dusk-cyan/20 dark:bg-dusk-cyan/10 dark:text-dusk-cyan",
    buttonClass: "border-stone-200 bg-stone-50 text-stone-700 hover:border-teal-300 dark:border-dusk-cyan/20 dark:bg-dusk-cyan/10 dark:text-dusk-cyan dark:hover:border-dusk-cyan/60",
    selectedButtonClass: "border-teal-600 bg-teal-600 text-white dark:border-dusk-cyan dark:bg-dusk-cyan dark:text-ink-950"
  },
  WAITING: {
    label: "Waiting",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700 dark:border-dusk-amber/20 dark:bg-dusk-amber/10 dark:text-dusk-amber",
    buttonClass: "border-stone-200 bg-stone-50 text-stone-700 hover:border-amber-300 dark:border-dusk-amber/20 dark:bg-dusk-amber/10 dark:text-dusk-amber dark:hover:border-dusk-amber/60",
    selectedButtonClass: "border-amber-600 bg-amber-600 text-white dark:border-dusk-amber dark:bg-dusk-amber dark:text-ink-950"
  },
  DONE: {
    label: "Done",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-300/20 dark:bg-emerald-300/10 dark:text-emerald-200",
    buttonClass: "border-stone-200 bg-stone-50 text-stone-700 hover:border-emerald-300 dark:border-emerald-300/20 dark:bg-emerald-300/10 dark:text-emerald-200 dark:hover:border-emerald-300/60",
    selectedButtonClass: "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-300 dark:bg-emerald-300 dark:text-ink-950"
  }
};

export function getStatusMeta(status: CardStatus) {
  return statusMeta[status];
}
