import type { CardSortOption } from "./card-sort";

export interface BoardFilterPreferences {
  assigneeFilter: string;
  isTodayFilterActive: boolean;
  cardSort: CardSortOption;
}

export const DEFAULT_BOARD_FILTERS: BoardFilterPreferences = {
  assigneeFilter: "ALL",
  isTodayFilterActive: false,
  cardSort: "manual"
};

const VALID_SORTS: ReadonlySet<string> = new Set([
  "manual",
  "difficulty_desc",
  "difficulty_asc",
  "priority_desc",
  "priority_asc",
  "due_date"
]);

export function getBoardFilterStorageKey(boardId: string, userId?: string | null): string {
  const safeUser = userId && userId.trim() ? userId.trim() : "anonymous";
  return `retrod:board-filters:${boardId}:${safeUser}`;
}

export function getProjectFilterStorageKey(projectId?: string | null, userId?: string | null): string {
  const safeProject = projectId && projectId.trim() ? projectId.trim() : "default";
  const safeUser = userId && userId.trim() ? userId.trim() : "anonymous";
  return `retrod:project-filters:${safeProject}:${safeUser}`;
}

export function sanitizeFilterPreferences(input?: Partial<BoardFilterPreferences> | null): BoardFilterPreferences {
  if (!input || typeof input !== "object") {
    return { ...DEFAULT_BOARD_FILTERS };
  }

  const assigneeFilter =
    typeof input.assigneeFilter === "string" && input.assigneeFilter.trim()
      ? input.assigneeFilter.trim()
      : "ALL";

  const isTodayFilterActive = Boolean(input.isTodayFilterActive);

  const cardSort =
    typeof input.cardSort === "string" && VALID_SORTS.has(input.cardSort)
      ? (input.cardSort as CardSortOption)
      : "manual";

  return {
    assigneeFilter,
    isTodayFilterActive,
    cardSort
  };
}

export function loadSavedBoardFilters(
  boardId: string,
  projectId?: string | null,
  userId?: string | null
): BoardFilterPreferences | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  try {
    const boardKey = getBoardFilterStorageKey(boardId, userId);
    const rawBoard = window.localStorage.getItem(boardKey);
    if (rawBoard) {
      const parsed = JSON.parse(rawBoard) as Partial<BoardFilterPreferences>;
      return sanitizeFilterPreferences(parsed);
    }

    if (projectId) {
      const projectKey = getProjectFilterStorageKey(projectId, userId);
      const rawProject = window.localStorage.getItem(projectKey);
      if (rawProject) {
        const parsed = JSON.parse(rawProject) as Partial<BoardFilterPreferences>;
        return sanitizeFilterPreferences(parsed);
      }
    }
  } catch {
    // Gracefully handle storage errors
  }

  return null;
}

export function saveBoardFilters(
  boardId: string,
  projectId: string | null | undefined,
  userId: string | null | undefined,
  filters: BoardFilterPreferences
): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    const payload = JSON.stringify(filters);
    window.localStorage.setItem(getBoardFilterStorageKey(boardId, userId), payload);
    if (projectId) {
      window.localStorage.setItem(getProjectFilterStorageKey(projectId, userId), payload);
    }
  } catch {
    // Ignore quota or private browsing errors
  }
}
