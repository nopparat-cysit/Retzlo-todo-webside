# 2026-10-03 Topbar AI Chat Placement & In-App Help Center Guide

## Date & Short Objective
- **Date:** 2026-10-03
- **Objective:** Move the AI chat launcher from the bottom-left floating corner to a dedicated topbar icon button (`🤖`) to the left of the user profile avatar. Add a help icon button (`?`) to the right of the profile avatar navigating to a new comprehensive Help & System Guide page (`/help`). Create `docs/system-guide.md` and define an agent maintenance rule in `AGENTS.md` to keep the knowledge base up-to-date with all system features.

## Files Created, Modified, Deleted, or Moved
- **Created:**
  - `src/components/ai/ai-chat-context.tsx`: Global AI chat context provider providing `isOpen`, `openAiChat`, `closeAiChat`, `toggleAiChat`.
  - `src/components/ai/ai-chat-trigger.tsx`: Topbar icon button for launching/toggling the AI assistant.
  - `src/components/ui/help-button.tsx`: Topbar icon button (`?`) for navigating to the Help & System Guide page (`/help`).
  - `src/app/(dashboard)/help/page.tsx`: Protected `/help` route under `(dashboard)` route group.
  - `src/components/help/help-center-client.tsx`: Interactive Help Center & Knowledge Base client component with search and categories.
  - `src/components/help/help-center.test.ts`: Vitest test suite covering topbar trigger placements, `/help` page, and doc contracts.
  - `docs/system-guide.md`: Comprehensive system documentation and architecture guide.
  - `docs/agent-notes/2026-10-03-topbar-ai-chat-help-guide-page.md`: This work session note.
- **Modified:**
  - `src/app/layout.tsx`: Wrapped application with `<AiChatProvider>`.
  - `src/components/ai/ai-chat-widget.tsx`: Replaced local `isOpen` state with `useAiChat()`, and removed old bottom-left floating launcher button.
  - `src/components/project/project-shell.tsx`: Mounted `<AiChatTrigger />` before `<UserProfilePopover />` and `<HelpButton />` after it.
  - `src/components/project/projects-dashboard.tsx`: Mounted `<AiChatTrigger />` before `<UserProfilePopover />` and `<HelpButton />` after it.
  - `src/components/project/user-profile-popover.tsx`: Added direct link to "Help & System Guide" (`/help`) in dropdown menu.
  - `AGENTS.md`: Added rule requiring maintainers and agents to update `docs/system-guide.md` and `/help` when system capabilities change.
  - `docs/theme-system.md`: Appended dated entry for 2026-10-03 to the change log.

## Important Behavior Changes
- **Header Icon Layout:**
  - The topbar right-hand tools cluster is now ordered:
    `[ 🔔 Notifications ]  [ 🤖 AI Chat ]  [ 👤 User Avatar ]  [ ❓ Help & Guides ]`
  - Clicking the `🤖` button toggles the AI Chat assistant drawer / floating window seamlessly.
  - Clicking the `❓` button navigates to `/help`, displaying the comprehensive knowledge base.
- **In-App Help Center (`/help`):**
  - Features real-time search and 9 category filters (AI, Kanban & Spreadsheet, Gamification & Rewards, Calendar & Dates, Notes & Diary, Shortcuts, Security, FAQ).
  - Includes a direct "ถาม AI Assistant" button to open the AI assistant from within the help page.
- **Knowledge Base Maintenance Rule:**
  - Added strict protocol in `AGENTS.md` and `docs/system-guide.md` ensuring documentation stays synchronized whenever features are modified or created.

## Database / Schema Changes
- None.

## Verification Commands Run & Results
- `npx vitest run src/components/help/help-center.test.ts`: Passed (5/5 tests).
- `npx tsc --noEmit`: Passed (0 errors).
- `npm run lint`: Passed (0 warnings or errors).
- `npx prisma validate`: Passed (Prisma schema is valid).
- `npm run build`: Running in background (`task-24433`).

## Known Follow-ups, Blockers, or Deployment Notes
- All changes follow semantic theme tokens and Retro Lofi Indigo design specifications.
