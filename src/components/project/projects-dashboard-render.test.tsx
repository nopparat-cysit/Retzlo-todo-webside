import React from "react";
import { renderToString } from "react-dom/server";
import { describe, it, expect, vi } from "vitest";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/projects",
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
  useSession: () => ({ data: null, status: "unauthenticated" }),
}));

// Mock pusher
vi.mock("pusher-js", () => ({
  default: vi.fn().mockImplementation(() => ({
    subscribe: vi.fn().mockReturnValue({
      bind: vi.fn(),
      unbind: vi.fn(),
    }),
    unsubscribe: vi.fn(),
    disconnect: vi.fn(),
  })),
}));

// Mock toast
vi.mock("@/components/ui/toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock ai-chat-context
vi.mock("@/components/ai/ai-chat-context", () => ({
  useAiChat: () => ({
    isOpen: false,
    viewMode: "sidepanel",
    isSmallScreen: false,
    isFabOpen: false,
    setIsFabOpen: vi.fn(),
  }),
}));

// Mock language
vi.mock("@/lib/i18n/language-context", () => ({
  useLanguage: () => ({ language: "th", setLanguage: vi.fn(), t: (k: string) => k }),
}));

describe("ProjectsDashboard renderToString test", () => {
  it("renders ProjectsDashboard with user data without throwing", async () => {
    const { ProjectsDashboard } = await import("./projects-dashboard");

    const projects = [
      {
        id: "0dd7438e-7dad-4287-a60f-9d97128a3ce1",
        name: "Capital One Real Estate",
        description: null,
        type: "WORK",
        coverImage: null,
        themeColor: "#6366f1",
        sticker: "",
        isOwner: false,
        counts: { boards: 4, members: 1, notes: 0 },
        boardsList: [
          {
            id: "a4ee9ef3-6dd9-461d-b813-b48634bda0cf",
            name: "Task For Me",
            isPrivate: false,
            columnCount: 3,
            totalCards: 11,
            doneCards: 6,
            columnsPreview: [
              { id: "31e51168-65f4-4daf-b2e1-d6167f66b448", name: "Backlog", cardCount: 2 },
              { id: "4958caf2-8be5-4b92-8a46-7fe131b9e93b", name: "In Progress", cardCount: 3 },
              { id: "31a8ad14-0eb9-4cc4-9f0d-0dfabf15691a", name: "Done", cardCount: 6 },
            ],
          },
          {
            id: "187384ca-37d8-4611-a6ea-51d5142b64c1",
            name: "Todo List",
            isPrivate: false,
            columnCount: 3,
            totalCards: 21,
            doneCards: 8,
            columnsPreview: [
              { id: "821942c8-9937-43e7-a3c8-c30c5dc8d96c", name: "Backlog", cardCount: 5 },
              { id: "0dd1a2f3-7bfd-40fd-bc99-074479f0c87f", name: "In Progress", cardCount: 8 },
              { id: "56188d7e-0516-4154-ba33-b6f5cd2f5370", name: "Done", cardCount: 8 },
            ],
          },
          {
            id: "9dd18ceb-0e46-4236-90fb-0b7067abbba7",
            name: "Me",
            isPrivate: false,
            columnCount: 5,
            totalCards: 1,
            doneCards: 0,
            columnsPreview: [
              { id: "dfead837-bd37-459a-aaf1-306b43d1b54c", name: "Inbox", cardCount: 1 },
              { id: "e8618404-13ba-4e39-9ef4-5dab494d4d06", name: "Next Up", cardCount: 0 },
              { id: "64780bee-e6b3-4c30-8c98-3458f3ce716a", name: "In Progress", cardCount: 0 },
              { id: "345c03c5-8a84-4150-89d3-1d72eadf8885", name: "Waiting", cardCount: 0 },
              { id: "5dd87987-4ccc-40a4-85a9-17ba65e912f6", name: "Done", cardCount: 0 },
            ],
          },
          {
            id: "34495f33-6a15-4a2a-883c-9ee7d01f22b1",
            name: "It's me",
            isPrivate: false,
            columnCount: 5,
            totalCards: 0,
            doneCards: 0,
            columnsPreview: [
              { id: "b99253b5-8a04-4b6c-b292-3b617b9d2560", name: "Inbox", cardCount: 0 },
              { id: "a28ed6ca-eb98-401a-bc8a-79ae314ef927", name: "Next Up", cardCount: 0 },
              { id: "dda06144-68e3-418b-b23c-c76aba394500", name: "In Progress", cardCount: 0 },
              { id: "86f89283-d44d-4d94-a6f5-9ddc242e9510", name: "Waiting", cardCount: 0 },
              { id: "017fbc16-fe70-4f7f-9d7f-53bf9bcee1c8", name: "Done", cardCount: 0 },
            ],
          },
        ],
        board: {
          id: "a4ee9ef3-6dd9-461d-b813-b48634bda0cf",
          columns: [
            {
              id: "31e51168-65f4-4daf-b2e1-d6167f66b448",
              name: "Backlog",
              cards: [
                { id: "c1", title: "Task 1", status: "TODO" as const },
                { id: "c2", title: "Task 2", status: "TODO" as const },
              ],
            },
          ],
        },
      },
    ];

    const calendarCards = [
      {
        id: "c1",
        title: "Test Card",
        status: "TODO" as const,
        dueDate: new Date().toISOString(),
        dueDateAllDay: true,
        project: { id: "0dd7438e-7dad-4287-a60f-9d97128a3ce1", name: "Capital One Real Estate" },
      },
    ];

    const calendarDiaries = [
      {
        id: "e979bdc2-96e7-459e-95bc-db05e32a2185",
        title: "รายงานหมึกเครื่องปริ้น",
        description: "ทำรายงานหมึกเครื่องปรึ้น แจ้งซ้อมต่างๆ",
        color: "DEFAULT",
        intervalDays: 1,
        repeatUnit: "DAY" as const,
        startDate: "2026-10-27T00:00:00.000Z",
        checklist: [],
        rewardCoins: 0,
        rewardCoinType: "PROJECT" as const,
        rewardClaimedDates: [],
        isStarred: false,
        isHidden: false,
        dueTime: null,
        projectId: null,
        project: null,
      },
    ];

    const userProfile = {
      name: "Nopparat",
      avatar: null,
      status: "ONLINE",
      email: "nopparat.cysit@gmail.com",
      isAdmin: false,
    };

    const html = renderToString(
      React.createElement(ProjectsDashboard, {
        projects,
        calendarCards,
        calendarDiaries,
        userProfile,
      })
    );

    expect(html).toContain("Capital One Real Estate");
    expect(html).toContain("Workspaces");
  }, 30000);
});
