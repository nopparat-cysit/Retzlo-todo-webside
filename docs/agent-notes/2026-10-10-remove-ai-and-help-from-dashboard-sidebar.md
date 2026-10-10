# Work Note: Remove AI Chat Trigger and Help Button from Dashboard Sidebar

**Date:** 2026-10-10  
**Objective:** Remove `<AiChatTrigger />` and `<HelpButton />` from the Workspaces Dashboard sidebar toolbar per user request, keeping only LanguageSwitcher, Notifications, and UserProfilePopover.

## Context & User Request
The user requested "เอา ai and ? ออก" with a screenshot targeting the quick actions toolbar in the Workspaces dashboard sidebar.
Previously, the toolbar included LanguageSwitcher, Notifications, AI Sparkle, User Profile, and Help '?' buttons.
By removing the AI chat trigger and the Help '?' button from the workspace dashboard sidebar:
- The sidebar toolbar is decluttered and clean.
- Users can still access the Help & System Guide from the UserProfilePopover menu (`/help`).
- In project views (`/project/[id]/...`), the dedicated topbar continues to provide the full tool suite.

## Changes Made
- Modified `src/components/project/projects-dashboard.tsx`:
  - Removed `AiChatTrigger` and `HelpButton` imports.
  - Removed `<AiChatTrigger />` and `<HelpButton />` from the quick actions toolbar in `<aside>`.
- Modified `src/components/help/help-center.test.ts`:
  - Updated the test contract to verify that `ProjectsDashboard` renders a clean toolbar with `UserProfilePopover` and does not render `<AiChatTrigger />` or `<HelpButton />`.
  - Maintained the test asserting `ProjectShell` continues to render `AiChatTrigger` and `HelpButton`.

## Files Modified
- `src/components/project/projects-dashboard.tsx`
- `src/components/help/help-center.test.ts`
- `docs/agent-notes/2026-10-10-remove-ai-and-help-from-dashboard-sidebar.md`

## Database / Schema Changes
- None.

## Verification Commands & Results
- `npx vitest run src/components/help/help-center.test.ts`: Passed (5/5 tests).
- `npx vitest run`: Passed (91/91 test suites, 477 passed, 3 skipped).
- `npm run lint`: Passed (0 errors, 0 warnings).
- `npx prisma validate`: Passed (schema is valid).
- `npm run build`: Production build verified.

## Follow-ups / Blockers
- None.
