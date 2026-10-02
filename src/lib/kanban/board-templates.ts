import type { CardStatus } from "@/types/kanban";
import type { ColumnIconId, ColumnThemeId } from "@/lib/kanban/column-settings";

export interface BoardTemplateColumn {
  name: string;
  defaultCardStatus: CardStatus;
  color: ColumnThemeId;
  icon: ColumnIconId;
}

export interface BoardTemplate {
  id: string;
  name: string;
  description: string;
  columns: readonly BoardTemplateColumn[];
}

export const BOARD_TEMPLATES = [
  {
    id: "standard",
    name: "Standard board",
    description: "A familiar starting point for any project.",
    columns: [
      { name: "Backlog", defaultCardStatus: "TODO", color: "default", icon: "kanban" },
      { name: "In Progress", defaultCardStatus: "DOING", color: "lavender", icon: "sparkles" },
      { name: "Done", defaultCardStatus: "DONE", color: "amber", icon: "check" }
    ]
  },
  {
    id: "scrum",
    name: "Scrum",
    description: "Separate product backlog, sprint work, review and done.",
    columns: [
      { name: "Product Backlog", defaultCardStatus: "TODO", color: "default", icon: "list" },
      { name: "Sprint Backlog", defaultCardStatus: "TODO", color: "lavender", icon: "target" },
      { name: "In Progress", defaultCardStatus: "DOING", color: "cyan", icon: "rocket" },
      { name: "Review", defaultCardStatus: "WAITING", color: "amber", icon: "clock" },
      { name: "Done", defaultCardStatus: "DONE", color: "mint", icon: "check" }
    ]
  },
  {
    id: "software",
    name: "Software development",
    description: "Track implementation, code review, testing and release.",
    columns: [
      { name: "Backlog", defaultCardStatus: "TODO", color: "default", icon: "inbox" },
      { name: "In Progress", defaultCardStatus: "DOING", color: "lavender", icon: "code" },
      { name: "Code Review", defaultCardStatus: "WAITING", color: "cyan", icon: "shield" },
      { name: "Testing", defaultCardStatus: "WAITING", color: "amber", icon: "bug" },
      { name: "Done", defaultCardStatus: "DONE", color: "mint", icon: "check" }
    ]
  },
  {
    id: "marketing",
    name: "Marketing",
    description: "Move campaigns from ideas through review to publishing.",
    columns: [
      { name: "Ideas", defaultCardStatus: "TODO", color: "default", icon: "sparkles" },
      { name: "Planned", defaultCardStatus: "TODO", color: "lavender", icon: "calendar" },
      { name: "In Progress", defaultCardStatus: "DOING", color: "cyan", icon: "rocket" },
      { name: "Review", defaultCardStatus: "WAITING", color: "amber", icon: "shield" },
      { name: "Published", defaultCardStatus: "DONE", color: "mint", icon: "check" }
    ]
  },
  {
    id: "personal",
    name: "Personal",
    description: "A lightweight flow for everyday tasks and plans.",
    columns: [
      { name: "Inbox", defaultCardStatus: "TODO", color: "default", icon: "inbox" },
      { name: "Next Up", defaultCardStatus: "TODO", color: "lavender", icon: "target" },
      { name: "In Progress", defaultCardStatus: "DOING", color: "cyan", icon: "sparkles" },
      { name: "Waiting", defaultCardStatus: "WAITING", color: "amber", icon: "clock" },
      { name: "Done", defaultCardStatus: "DONE", color: "mint", icon: "check" }
    ]
  }
] as const satisfies readonly BoardTemplate[];

export type BoardTemplateId = (typeof BOARD_TEMPLATES)[number]["id"];

export const BOARD_TEMPLATE_IDS = BOARD_TEMPLATES.map((template) => template.id) as [
  BoardTemplateId,
  ...BoardTemplateId[]
];

export const DEFAULT_BOARD_TEMPLATE_ID: BoardTemplateId = "standard";

export function getBoardTemplate(id: BoardTemplateId) {
  return BOARD_TEMPLATES.find((template) => template.id === id) ?? BOARD_TEMPLATES[0];
}
