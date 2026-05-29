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
    badgeClass: "bg-dusk-lavender/10 text-dusk-lavender border-dusk-lavender/20",
    buttonClass: "border-dusk-lavender/20 bg-dusk-lavender/10 text-dusk-lavender hover:border-dusk-lavender/60",
    selectedButtonClass: "border-dusk-lavender bg-dusk-lavender text-ink-950"
  },
  DOING: {
    label: "Doing",
    badgeClass: "bg-dusk-cyan/10 text-dusk-cyan border-dusk-cyan/20",
    buttonClass: "border-dusk-cyan/20 bg-dusk-cyan/10 text-dusk-cyan hover:border-dusk-cyan/60",
    selectedButtonClass: "border-dusk-cyan bg-dusk-cyan text-ink-950"
  },
  WAITING: {
    label: "Waiting",
    badgeClass: "bg-dusk-amber/10 text-dusk-amber border-dusk-amber/20",
    buttonClass: "border-dusk-amber/20 bg-dusk-amber/10 text-dusk-amber hover:border-dusk-amber/60",
    selectedButtonClass: "border-dusk-amber bg-dusk-amber text-ink-950"
  },
  DONE: {
    label: "Done",
    badgeClass: "bg-emerald-300/10 text-emerald-200 border-emerald-300/20",
    buttonClass: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200 hover:border-emerald-300/60",
    selectedButtonClass: "border-emerald-300 bg-emerald-300 text-ink-950"
  }
};

export function getStatusMeta(status: CardStatus) {
  return statusMeta[status];
}
