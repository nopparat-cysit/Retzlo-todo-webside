export const SETTINGS_TABS = [
  "identity",
  "access",
  "boards",
  "board-general",
  "board-columns",
  "attributes",
  "preferences"
] as const;

export type SettingsTabId = (typeof SETTINGS_TABS)[number];

export const BOARD_SCOPED_TABS: readonly SettingsTabId[] = ["board-general", "board-columns", "attributes"];

/** Older deep links that must keep working after the tabs were consolidated. */
const LEGACY_TAB_ALIASES: Record<string, SettingsTabId> = {
  features: "identity",
  all: "identity",
  board: "board-general",
  columns: "board-columns"
};

export function isSettingsTab(value: string): value is SettingsTabId {
  return (SETTINGS_TABS as readonly string[]).includes(value);
}

export function isBoardScopedTab(tab: SettingsTabId): boolean {
  return BOARD_SCOPED_TABS.includes(tab);
}

export function resolveSettingsTab({
  tab,
  boardId
}: {
  tab?: string | null;
  boardId?: string | null;
}): SettingsTabId {
  if (tab) {
    if (isSettingsTab(tab)) return tab;
    const alias = LEGACY_TAB_ALIASES[tab];
    if (alias) return alias;
  }
  return boardId ? "board-general" : "identity";
}
