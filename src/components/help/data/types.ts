import type { LucideIcon } from "lucide-react";

export interface WorkflowStep {
  step: string;
  title: string;
  desc: string;
}

export interface TechnicalSpec {
  label: string;
  value: string;
}

export interface GuideTopic {
  id: string;
  category: "overview" | "ai" | "kanban" | "gamification" | "calendar" | "notes" | "security" | "shortcuts" | "faq";
  icon: LucideIcon;
  title: string;
  badge?: string;
  badgeColor?: string;
  scopeBadge?: string;
  summary: string;
  readingTime?: string;
  lastUpdated?: string;
  concept?: string;
  highlights: string[];
  workflowSteps?: WorkflowStep[];
  technicalSpecs?: TechnicalSpec[];
  tips?: string;
  codeOrShortcut?: string;
  relatedTopicIds?: string[];
  demoType?: "architecture" | "ai-chat" | "kanban-table" | "priorities" | "timepicker" | "coffee" | "export" | "habits" | "permissions" | "shortcuts";
}

export interface CategoryTheme {
  eyebrowEn: string;
  eyebrowTh: string;
  eyebrowBadge: string;
  iconBox: string;
  headerAura: string;
  summaryCard: string;
  summaryIconBox: string;
  summarySparkleColor: string;
  sectionBadge: string;
  stepBadge: string;
  activeSidebar: string;
  activeSidebarBar: string;
  activeSidebarIcon: string;
}
