import type { CardStatus } from "@/types/kanban";

export type CardTone =
  | "DEFAULT"
  | "LAVENDER"
  | "ROSE"
  | "AMBER"
  | "CYAN"
  | "EMERALD"
  | "BLUE"
  | "VIOLET"
  | "SLATE"
  | "WINE";

export interface CardToneVariant {
  surface: string;
  border: string;
  text: string;
  muted: string;
  swatch: string;
  hover: string;
}

export const cardToneVariants: Record<CardTone, CardToneVariant> = {
  DEFAULT: {
    surface: "bg-white/[0.035]",
    border: "border-white/10",
    text: "text-theme-foreground",
    muted: "text-theme-muted",
    swatch: "bg-stone-400",
    hover: "hover:border-dusk-lavender/35 hover:bg-white/[0.055]"
  },
  LAVENDER: {
    surface: "bg-dusk-lavender/10",
    border: "border-dusk-lavender/25",
    text: "text-theme-foreground",
    muted: "text-theme-muted",
    swatch: "bg-dusk-lavender",
    hover: "hover:border-dusk-lavender/55 hover:bg-dusk-lavender/15"
  },
  ROSE: {
    surface: "bg-dusk-rose/10",
    border: "border-dusk-rose/25",
    text: "text-theme-foreground",
    muted: "text-theme-muted",
    swatch: "bg-dusk-rose",
    hover: "hover:border-dusk-rose/55 hover:bg-dusk-rose/15"
  },
  AMBER: {
    surface: "bg-dusk-amber/10",
    border: "border-dusk-amber/25",
    text: "text-theme-foreground",
    muted: "text-theme-muted",
    swatch: "bg-dusk-amber",
    hover: "hover:border-dusk-amber/55 hover:bg-dusk-amber/15"
  },
  CYAN: {
    surface: "bg-dusk-cyan/10",
    border: "border-dusk-cyan/25",
    text: "text-theme-foreground",
    muted: "text-theme-muted",
    swatch: "bg-dusk-cyan",
    hover: "hover:border-dusk-cyan/55 hover:bg-dusk-cyan/15"
  },
  EMERALD: {
    surface: "bg-emerald-400/10",
    border: "border-emerald-300/25",
    text: "text-theme-foreground",
    muted: "text-theme-muted",
    swatch: "bg-emerald-300",
    hover: "hover:border-emerald-300/50 hover:bg-emerald-400/15"
  },
  BLUE: {
    surface: "bg-blue-400/10",
    border: "border-blue-300/25",
    text: "text-theme-foreground",
    muted: "text-theme-muted",
    swatch: "bg-blue-300",
    hover: "hover:border-blue-300/50 hover:bg-blue-400/15"
  },
  VIOLET: {
    surface: "bg-violet-400/10",
    border: "border-violet-300/25",
    text: "text-theme-foreground",
    muted: "text-theme-muted",
    swatch: "bg-violet-300",
    hover: "hover:border-violet-300/50 hover:bg-violet-400/15"
  },
  SLATE: {
    surface: "bg-slate-400/10",
    border: "border-slate-300/20",
    text: "text-theme-foreground",
    muted: "text-theme-muted",
    swatch: "bg-slate-300",
    hover: "hover:border-slate-300/40 hover:bg-slate-400/15"
  },
  WINE: {
    surface: "bg-pink-300/10",
    border: "border-pink-300/25",
    text: "text-theme-foreground",
    muted: "text-theme-muted",
    swatch: "bg-pink-300",
    hover: "hover:border-pink-300/50 hover:bg-pink-300/15"
  }
};

export interface StatusToneVariant {
  label: string;
  badge: string;
  button: string;
  selectedButton: string;
}

export const statusToneVariants: Record<CardStatus, StatusToneVariant> = {
  TODO: {
    label: "Todo",
    badge: "border-dusk-lavender/25 bg-dusk-lavender/10 text-theme-foreground",
    button: "border-white/10 bg-white/[0.035] text-theme-muted hover:border-dusk-lavender/40",
    selectedButton: "border-dusk-lavender bg-dusk-lavender/20 text-theme-foreground"
  },
  DOING: {
    label: "Doing",
    badge: "border-dusk-cyan/25 bg-dusk-cyan/10 text-theme-foreground",
    button: "border-white/10 bg-white/[0.035] text-theme-muted hover:border-dusk-cyan/40",
    selectedButton: "border-dusk-cyan bg-dusk-cyan/20 text-theme-foreground"
  },
  WAITING: {
    label: "Waiting",
    badge: "border-dusk-amber/25 bg-dusk-amber/10 text-theme-foreground",
    button: "border-white/10 bg-white/[0.035] text-theme-muted hover:border-dusk-amber/40",
    selectedButton: "border-dusk-amber bg-dusk-amber/20 text-theme-foreground"
  },
  DONE: {
    label: "Done",
    badge: "border-theme-success-border bg-theme-success-surface text-theme-success",
    button: "border-white/10 bg-white/[0.035] text-theme-muted hover:border-theme-success-border",
    selectedButton: "border-theme-success-border bg-theme-success-surface text-theme-success"
  }
};

export interface StateToneVariant {
  icon: string;
  panel: string;
  title: string;
  text: string;
}

export const stateToneVariants: Record<"empty" | "error" | "warning" | "success" | "info", StateToneVariant> = {
  empty: {
    icon: "text-theme-muted",
    panel: "border-theme-border bg-theme-paper",
    title: "text-theme-foreground",
    text: "text-theme-muted"
  },
  error: {
    icon: "text-theme-danger",
    panel: "border-theme-danger-border bg-theme-danger-surface",
    title: "text-theme-danger",
    text: "text-theme-danger"
  },
  warning: {
    icon: "text-theme-warning",
    panel: "border-theme-warning-border bg-theme-warning-surface",
    title: "text-theme-warning",
    text: "text-theme-warning"
  },
  success: {
    icon: "text-theme-success",
    panel: "border-theme-success-border bg-theme-success-surface",
    title: "text-theme-success",
    text: "text-theme-success"
  },
  info: {
    icon: "text-theme-info",
    panel: "border-theme-info-border bg-theme-info-surface",
    title: "text-theme-info",
    text: "text-theme-info"
  }
};

export function getCardTone(value: string | null | undefined): CardToneVariant {
  const key = String(value ?? "DEFAULT").toUpperCase() as CardTone;
  return cardToneVariants[key] ?? cardToneVariants.DEFAULT;
}

export function getStatusTone(value: string | null | undefined): StatusToneVariant {
  const key = String(value ?? "TODO").toUpperCase() as CardStatus;
  return statusToneVariants[key] ?? statusToneVariants.TODO;
}

export function getStateTone(value: string | null | undefined): StateToneVariant {
  const key = String(value ?? "info").toLowerCase() as keyof typeof stateToneVariants;
  return stateToneVariants[key] ?? stateToneVariants.info;
}
