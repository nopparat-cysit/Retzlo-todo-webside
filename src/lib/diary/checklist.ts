import { isDiaryItemDueOnDate } from "@/lib/diary/recurrence";

export interface DiaryChecklistItem {
  id: string;
  label: string;
  description: string;
  intervalDays: number;
  startDate: string;
  dueTime: string | null;
  completedDates: string[];
}

export interface DiaryChecklistScheduleSource {
  checklist: unknown;
  intervalDays: number;
  startDate: string | Date;
}

export interface DiaryChecklistSummary {
  completedCount: number;
  dueCount: number;
  hasChecklist: boolean;
  isDue: boolean;
  totalCount: number;
}

export type DiaryRewardCoinType = "PROJECT" | "GLOBAL";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^\d{2}:\d{2}$/;

export function normalizeDiaryChecklist(value: unknown, fallbackStartDate?: string | Date): DiaryChecklistItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalizedFallbackStartDate = normalizeDateKey(fallbackStartDate) ?? "1970-01-01";

  return value
    .map((entry) => {
      if (!isRecord(entry)) {
        return null;
      }

      const label = typeof entry.label === "string" ? entry.label.trim() : "";
      const startDate = typeof entry.startDate === "string" && datePattern.test(entry.startDate)
        ? entry.startDate
        : normalizedFallbackStartDate;

      if (!label) {
        return null;
      }

      return {
        id: typeof entry.id === "string" && entry.id.trim() ? entry.id : crypto.randomUUID(),
        label: label.slice(0, 160),
        description: typeof entry.description === "string" ? entry.description.trim().slice(0, 1000) : "",
        intervalDays: sanitizeIntervalDays(entry.intervalDays),
        startDate,
        dueTime: typeof entry.dueTime === "string" && timePattern.test(entry.dueTime) ? entry.dueTime : null,
        completedDates: normalizeCompletedDates(entry.completedDates)
      };
    })
    .filter((entry): entry is DiaryChecklistItem => Boolean(entry));
}

export function getDiaryChecklistSummary(
  item: DiaryChecklistScheduleSource,
  selectedDate: string | Date
): DiaryChecklistSummary {
  const checklist = normalizeDiaryChecklist(item.checklist, item.startDate);

  if (checklist.length === 0) {
    const isDue = isDiaryItemDueOnDate(item.startDate, selectedDate, item.intervalDays);

    return {
      completedCount: 0,
      dueCount: isDue ? 1 : 0,
      hasChecklist: false,
      isDue,
      totalCount: 0
    };
  }

  const dueItems = checklist.filter((checklistItem) => isDiaryChecklistItemDueOnDate(checklistItem, selectedDate));
  const completedCount = dueItems.filter((checklistItem) =>
    isDiaryChecklistItemCompletedOnDate(checklistItem, selectedDate)
  ).length;

  return {
    completedCount,
    dueCount: dueItems.length,
    hasChecklist: true,
    isDue: dueItems.length > 0,
    totalCount: checklist.length
  };
}

export function isDiaryChecklistItemDueOnDate(item: DiaryChecklistItem, selectedDate: string | Date) {
  return isDiaryItemDueOnDate(item.startDate, selectedDate, item.intervalDays);
}

export function isDiaryChecklistItemCompletedOnDate(item: DiaryChecklistItem, selectedDate: string | Date) {
  const dateKey = toDateKey(selectedDate);
  return item.completedDates.includes(dateKey);
}

export function toggleDiaryChecklistCompletion(
  items: DiaryChecklistItem[],
  checklistItemId: string,
  selectedDate: string | Date,
  checked: boolean
) {
  const dateKey = toDateKey(selectedDate);

  return items.map((item) => {
    if (item.id !== checklistItemId) {
      return item;
    }

    const completedDates = new Set(item.completedDates);

    if (checked) {
      completedDates.add(dateKey);
    } else {
      completedDates.delete(dateKey);
    }

    return {
      ...item,
      completedDates: [...completedDates].sort()
    };
  });
}

function sanitizeIntervalDays(value: unknown) {
  const numberValue = typeof value === "number" ? value : typeof value === "string" ? Number.parseInt(value, 10) : 1;

  if (!Number.isFinite(numberValue)) {
    return 1;
  }

  return Math.min(365, Math.max(1, Math.trunc(numberValue)));
}

function normalizeCompletedDates(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.filter((entry): entry is string => typeof entry === "string" && datePattern.test(entry)))].sort();
}

function normalizeDateKey(value: string | Date | undefined) {
  if (!value) {
    return null;
  }

  const dateKey = toDateKey(value);
  return datePattern.test(dateKey) ? dateKey : null;
}

function toDateKey(value: string | Date) {
  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  return [
    value.getFullYear(),
    String(value.getMonth() + 1).padStart(2, "0"),
    String(value.getDate()).padStart(2, "0")
  ].join("-");
}

export function isDiaryChecklistCompleteForReward(items: DiaryChecklistItem[], selectedDate: string | Date) {
  const normalized = normalizeDiaryChecklist(items, selectedDate);
  const dueItems = normalized.filter((item) => isDiaryChecklistItemDueOnDate(item, selectedDate));

  return dueItems.length > 0 && dueItems.every((item) => isDiaryChecklistItemCompletedOnDate(item, selectedDate));
}

export function normalizeDiaryRewardCoinType(value: unknown, hasProject: boolean): DiaryRewardCoinType {
  if (value === "GLOBAL") {
    return "GLOBAL";
  }

  return hasProject ? "PROJECT" : "GLOBAL";
}

export function normalizeDiaryRewardClaimedDates(value: unknown) {
  return normalizeCompletedDates(value);
}

export function hasDiaryRewardBeenClaimed(value: unknown, selectedDate: string | Date) {
  return normalizeDiaryRewardClaimedDates(value).includes(toDateKey(selectedDate));
}

export function markDiaryRewardClaimed(value: unknown, selectedDate: string | Date) {
  return [...new Set([...normalizeDiaryRewardClaimedDates(value), toDateKey(selectedDate)])].sort();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
