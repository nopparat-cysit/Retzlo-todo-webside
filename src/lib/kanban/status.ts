import type { CardStatus } from "@/types/kanban";

export interface CustomStatusOption {
  value: string;
  label: string;
  color?: string; // e.g. "indigo", "teal", "amber", "emerald", "rose", "purple", "cyan", "stone"
  isDefault?: boolean;
}

export const DEFAULT_STATUS_OPTIONS: CustomStatusOption[] = [
  { value: "TODO", label: "Todo", color: "indigo", isDefault: true },
  { value: "DOING", label: "Doing", color: "teal", isDefault: true },
  { value: "WAITING", label: "Waiting", color: "amber", isDefault: true },
  { value: "DONE", label: "Done", color: "emerald", isDefault: true }
];

export const STATUS_COLOR_CONFIGS: Record<
  string,
  {
    badgeClass: string;
    buttonClass: string;
    selectedButtonClass: string;
    dot: string;
  }
> = {
  indigo: {
    badgeClass: "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-dusk-lavender/20 dark:bg-dusk-lavender/10 dark:text-dusk-lavender",
    buttonClass: "border-stone-200 bg-stone-50 text-stone-700 hover:border-indigo-300 dark:border-dusk-lavender/20 dark:bg-dusk-lavender/10 dark:text-dusk-lavender dark:hover:border-dusk-lavender/60",
    selectedButtonClass: "border-indigo-600 bg-indigo-600 text-white dark:border-dusk-lavender dark:bg-dusk-lavender dark:text-ink-950",
    dot: "bg-indigo-500"
  },
  teal: {
    badgeClass: "border-teal-200 bg-teal-50 text-teal-700 dark:border-dusk-cyan/20 dark:bg-dusk-cyan/10 dark:text-dusk-cyan",
    buttonClass: "border-stone-200 bg-stone-50 text-stone-700 hover:border-teal-300 dark:border-dusk-cyan/20 dark:bg-dusk-cyan/10 dark:text-dusk-cyan dark:hover:border-dusk-cyan/60",
    selectedButtonClass: "border-teal-600 bg-teal-600 text-white dark:border-dusk-cyan dark:bg-dusk-cyan dark:text-ink-950",
    dot: "bg-teal-500"
  },
  cyan: {
    badgeClass: "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-300",
    buttonClass: "border-stone-200 bg-stone-50 text-stone-700 hover:border-cyan-300 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-300 dark:hover:border-cyan-400/60",
    selectedButtonClass: "border-cyan-600 bg-cyan-600 text-white dark:border-cyan-400 dark:bg-cyan-400 dark:text-ink-950",
    dot: "bg-cyan-500"
  },
  amber: {
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700 dark:border-dusk-amber/20 dark:bg-dusk-amber/10 dark:text-dusk-amber",
    buttonClass: "border-stone-200 bg-stone-50 text-stone-700 hover:border-amber-300 dark:border-dusk-amber/20 dark:bg-dusk-amber/10 dark:text-dusk-amber dark:hover:border-dusk-amber/60",
    selectedButtonClass: "border-amber-600 bg-amber-600 text-white dark:border-dusk-amber dark:bg-dusk-amber dark:text-ink-950",
    dot: "bg-amber-500"
  },
  emerald: {
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-300/20 dark:bg-emerald-300/10 dark:text-emerald-200",
    buttonClass: "border-stone-200 bg-stone-50 text-stone-700 hover:border-emerald-300 dark:border-emerald-300/20 dark:bg-emerald-300/10 dark:text-emerald-200 dark:hover:border-emerald-300/60",
    selectedButtonClass: "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-300 dark:bg-emerald-300 dark:text-ink-950",
    dot: "bg-emerald-500"
  },
  rose: {
    badgeClass: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300",
    buttonClass: "border-stone-200 bg-stone-50 text-stone-700 hover:border-rose-300 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300 dark:hover:border-rose-400/60",
    selectedButtonClass: "border-rose-600 bg-rose-600 text-white dark:border-rose-400 dark:bg-rose-400 dark:text-ink-950",
    dot: "bg-rose-500"
  },
  purple: {
    badgeClass: "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-400/20 dark:bg-purple-400/10 dark:text-purple-300",
    buttonClass: "border-stone-200 bg-stone-50 text-stone-700 hover:border-purple-300 dark:border-purple-400/20 dark:bg-purple-400/10 dark:text-purple-300 dark:hover:border-purple-400/60",
    selectedButtonClass: "border-purple-600 bg-purple-600 text-white dark:border-purple-400 dark:bg-purple-400 dark:text-ink-950",
    dot: "bg-purple-500"
  },
  stone: {
    badgeClass: "border-stone-200 bg-stone-100 text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300",
    buttonClass: "border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:border-stone-600",
    selectedButtonClass: "border-stone-600 bg-stone-600 text-white dark:border-stone-400 dark:bg-stone-400 dark:text-ink-950",
    dot: "bg-stone-500"
  }
};

export const statusOptions: Array<{ value: CardStatus; label: string }> = [
  { value: "TODO", label: "Todo" },
  { value: "DOING", label: "Doing" },
  { value: "WAITING", label: "Waiting" },
  { value: "DONE", label: "Done" }
];

export interface StatusWorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  statuses: CustomStatusOption[];
}

export const STATUS_WORKFLOW_TEMPLATES: Record<string, StatusWorkflowTemplate> = {
  standard: {
    id: "standard",
    name: "Classic Kanban",
    description: "Standard 4-step workflow for general tasks and workflows",
    category: "General",
    icon: "kanban",
    statuses: [
      { value: "TODO", label: "Todo", color: "indigo", isDefault: true },
      { value: "DOING", label: "Doing", color: "teal", isDefault: true },
      { value: "WAITING", label: "Waiting", color: "amber", isDefault: true },
      { value: "DONE", label: "Done", color: "emerald", isDefault: true }
    ]
  },
  software: {
    id: "software",
    name: "Software & IT",
    description: "Software development lifecycle, code review, and QA testing",
    category: "Engineering",
    icon: "code",
    statuses: [
      { value: "BACKLOG", label: "Backlog", color: "stone" },
      { value: "TODO", label: "To Do", color: "indigo", isDefault: true },
      { value: "DOING", label: "In Development", color: "cyan", isDefault: true },
      { value: "CODE_REVIEW", label: "Code Review", color: "purple" },
      { value: "QA_TESTING", label: "QA Testing", color: "amber" },
      { value: "DONE", label: "Released", color: "emerald", isDefault: true }
    ]
  },
  scrum: {
    id: "scrum",
    name: "Agile & Scrum",
    description: "Agile sprint management with Backlog, Blocked tasks, and Review",
    category: "Agile",
    icon: "target",
    statuses: [
      { value: "BACKLOG", label: "Product Backlog", color: "stone" },
      { value: "SPRINT_TODO", label: "Sprint Backlog", color: "indigo" },
      { value: "DOING", label: "In Progress", color: "cyan", isDefault: true },
      { value: "BLOCKED", label: "Blocked", color: "rose" },
      { value: "WAITING", label: "In Review", color: "amber", isDefault: true },
      { value: "DONE", label: "Done", color: "emerald", isDefault: true }
    ]
  },
  marketing: {
    id: "marketing",
    name: "Marketing & Content",
    description: "Marketing campaigns, ideas, content drafting, and publishing",
    category: "Marketing",
    icon: "sparkles",
    statuses: [
      { value: "IDEAS", label: "Ideas", color: "purple" },
      { value: "PLANNED", label: "Planned", color: "indigo" },
      { value: "DOING", label: "Drafting", color: "cyan", isDefault: true },
      { value: "WAITING", label: "Review", color: "amber", isDefault: true },
      { value: "DONE", label: "Published", color: "emerald", isDefault: true }
    ]
  },
  bug_tracker: {
    id: "bug_tracker",
    name: "Bug Tracker",
    description: "Bug tracking, triage, resolution, retesting, and closure",
    category: "Quality",
    icon: "bug",
    statuses: [
      { value: "REPORTED", label: "Reported", color: "rose" },
      { value: "TRIAGED", label: "Triaged", color: "amber" },
      { value: "DOING", label: "Fixing", color: "cyan", isDefault: true },
      { value: "WAITING", label: "Retesting", color: "purple", isDefault: true },
      { value: "DONE", label: "Resolved", color: "emerald", isDefault: true }
    ]
  },
  design: {
    id: "design",
    name: "Creative & Design",
    description: "Creative design process: research, wireframing, feedback, and approval",
    category: "Design",
    icon: "palette",
    statuses: [
      { value: "RESEARCH", label: "Research", color: "stone" },
      { value: "CONCEPT", label: "Wireframe", color: "indigo" },
      { value: "DOING", label: "Designing", color: "purple", isDefault: true },
      { value: "WAITING", label: "Feedback", color: "amber", isDefault: true },
      { value: "DONE", label: "Approved", color: "emerald", isDefault: true }
    ]
  },
  sales: {
    id: "sales",
    name: "Sales Pipeline",
    description: "Sales opportunities, leads, proposals, negotiations, and closed deals",
    category: "Business",
    icon: "briefcase",
    statuses: [
      { value: "LEAD", label: "New Lead", color: "stone" },
      { value: "CONTACTED", label: "Contacted", color: "indigo" },
      { value: "PROPOSAL", label: "Proposal", color: "cyan" },
      { value: "WAITING", label: "Negotiation", color: "amber", isDefault: true },
      { value: "DONE", label: "Closed Won", color: "emerald", isDefault: true }
    ]
  }
};

let activeBoardStatusesCache: CustomStatusOption[] = [];

export function setActiveBoardStatuses(statuses: CustomStatusOption[]) {
  activeBoardStatusesCache = statuses;
}

export function getStoredStatuses(boardId?: string): CustomStatusOption[] {
  if (typeof window === "undefined") return DEFAULT_STATUS_OPTIONS;
  try {
    const key = boardId ? `retzlo:custom_statuses_${boardId}` : `retzlo:custom_statuses_default`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        activeBoardStatusesCache = parsed;
        return parsed;
      }
    }
  } catch {}
  return DEFAULT_STATUS_OPTIONS;
}

export function saveStoredStatuses(statuses: CustomStatusOption[], boardId?: string) {
  if (typeof window === "undefined") return;
  try {
    const key = boardId ? `retzlo:custom_statuses_${boardId}` : `retzlo:custom_statuses_default`;
    localStorage.setItem(key, JSON.stringify(statuses));
    activeBoardStatusesCache = statuses;
    window.dispatchEvent(
      new CustomEvent("retzlo:statuses-updated", {
        detail: { boardId, statuses }
      })
    );
  } catch {}
}

const fallbackStatusMeta = STATUS_COLOR_CONFIGS.indigo;

export function getStatusMeta(status: string, customOptions?: CustomStatusOption[]) {
  const optionsToUse =
    customOptions && customOptions.length > 0
      ? customOptions
      : activeBoardStatusesCache.length > 0
        ? activeBoardStatusesCache
        : undefined;

  if (optionsToUse && optionsToUse.length > 0) {
    const found = optionsToUse.find((o) => o.value.toUpperCase() === status.toUpperCase());
    if (found) {
      const colorKey = found.color || "indigo";
      const config = STATUS_COLOR_CONFIGS[colorKey] || STATUS_COLOR_CONFIGS.indigo;
      return {
        label: found.label,
        badgeClass: config.badgeClass,
        buttonClass: config.buttonClass,
        selectedButtonClass: config.selectedButtonClass
      };
    }
  }

  const upper = status.toUpperCase();
  if (upper === "TODO") {
    return { label: "Todo", ...STATUS_COLOR_CONFIGS.indigo };
  }
  if (upper === "DOING") {
    return { label: "Doing", ...STATUS_COLOR_CONFIGS.teal };
  }
  if (upper === "WAITING") {
    return { label: "Waiting", ...STATUS_COLOR_CONFIGS.amber };
  }
  if (upper === "DONE") {
    return { label: "Done", ...STATUS_COLOR_CONFIGS.emerald };
  }

  return {
    label: status,
    ...fallbackStatusMeta
  };
}
