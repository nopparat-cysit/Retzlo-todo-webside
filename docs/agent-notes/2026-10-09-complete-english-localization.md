# Work Note: Complete English Localization Across Platform

**Date:** 2026-10-09  
**Objective:** Comprehensive localization of the entire application to English per user request ("ทำให้เป็น ENG ทั้งเว็ป เช็คทั้งหมด"), replacing all remaining Thai user-facing strings across Kanban, modals, settings, pickers, notes, diary, notifications, auth, emails, and API endpoints with clean, idiomatic English while maintaining 100% test suite and build stability.

---

## Files Modified / Created

### 1. Kanban, Board & Export Systems
- `src/lib/kanban/priority.ts`
- `src/lib/kanban/status.ts`
- `src/lib/kanban/due-date.ts` & `src/lib/kanban/due-date.test.ts`
- `src/lib/kanban/difficulty.ts`
- `src/lib/kanban/export-board.ts` & `src/lib/kanban/export-board.test.ts`
- `src/components/kanban/board.tsx`
- `src/components/kanban/column.tsx`
- `src/components/kanban/card.tsx`
- `src/components/kanban/card-modal.tsx`
- `src/components/kanban/column-status-picker.tsx`
- `src/components/kanban/coffee-cheers-button.tsx`
- `src/components/kanban/assignee-avatar.tsx`
- `src/components/kanban/assignee-picker.tsx`
- `src/components/kanban/board-sidebar-dropdown.tsx`
- `src/components/kanban/board-template-picker.tsx`
- `src/components/kanban/board-settings-modal.tsx`
- `src/components/kanban/board-settings/general-tab.tsx`
- `src/components/kanban/board-settings/columns-tab.tsx`
- `src/components/kanban/board-settings/columns-tab.test.ts`
- `src/components/kanban/board-priorities-tab.tsx`
- `src/components/kanban/board-attributes-tab.tsx`
- `src/components/kanban/board-settings-attributes.test.ts`
- `src/components/kanban/card-attributes-edit-modal.tsx`
- `src/components/kanban/card-attributes-edit.test.ts`
- `src/components/kanban/board-export-document.tsx`
- `src/components/kanban/board-export-modal.tsx`
- `src/components/kanban/board-export.test.ts`
- `src/components/kanban/board-views-and-sidebar.test.ts`

### 2. UI Pickers & Helpers
- `src/components/ui/time-picker.tsx` (Presets: Morning, Noon, Afternoon, End of Day, Evening; action buttons and tooltips)
- `src/components/ui/time-picker-intuitive.test.ts` (Updated format assertions and Confirm / All Day expectations)
- `src/components/ui/date-picker.test.ts` (Updated format display assertions)
- `src/components/ui/date-time-picker.tsx` (Default placeholder to English)
- `src/components/ui/date-time-field.tsx`
- `src/components/ui/draft-recovery-modal.tsx`
- `src/components/ui/help-button.tsx`

### 3. Notes, Diary & Hub Panels
- `src/components/notes/board-notes-rail.tsx` (Title, Description, Folder, Scopes, Due/End Date)
- `src/components/notes/notes-panel.tsx` (Title, Description, Folder, Scopes, Due/End Date)
- `src/components/notes/note-modals.test.ts` (Updated string expectations)
- `src/components/diary/diary-checklist.tsx` (Start date, due time, recurrence schedule presets & labels)
- `src/components/diary/diary-list-panel.tsx` (Milestone rewards & settings)
- `src/components/hub/diary-hub-panel.tsx` (Milestone rewards & settings)

### 4. Project Settings, Boards Manager & Members
- `src/components/project/invite-form.tsx` (Success toast)
- `src/components/project/project-boards-manager.tsx` (Button titles & actions)
- `src/components/project/project-members-view.tsx` (Headers & invite buttons)
- `src/components/project/settings-form.tsx` (Descriptions & switch labels)
- `src/components/project/project-settings-client.tsx` (Descriptions, toasts, role guides)
- `src/components/project/project-settings-client.test.ts` (Updated "Manage members and invitations" test assertion)

### 5. Auth, Notifications & Email
- `src/lib/mail.ts` (Email subjects, bodies, CTA buttons in invitations)
- `src/app/api/projects/[id]/invite/route.ts` (In-app notifications)
- `src/app/(auth)/accept-invitation/page.tsx` (Loading state)
- `src/components/auth/accept-invitation.tsx` (All dialog states: invalid, expired, declined, accepted, switch account)
- `src/components/auth/auth-navigation.test.ts` (Updated test assertion)
- `src/components/notifications/invitation-confirm-modal.tsx` (Invitation preview & action buttons)
- `src/components/notifications/notifications-popover.tsx` (Notification cards & action links)

### 6. AI, Support & Public Pages
- `src/components/ai/ai-breakdown-modal.tsx`
- `src/components/ai/ai-chat-trigger.tsx`
- `src/components/ai/ai-project-summary-modal.tsx`
- `src/lib/ai/chat-actions.ts`
- `src/lib/ai/credits.ts`
- `src/lib/ai/prompts.ts`
- `src/lib/ai/engine.ts` & `src/lib/ai/engine.test.ts`
- `src/app/api/ai/breakdown/route.ts`
- `src/app/api/ai/chat/route.ts`
- `src/app/api/ai/create-cards/route.ts`
- `src/app/api/ai/summary/route.ts`
- `src/app/api/contact/route.ts`
- `src/components/contact/contact-page-client.tsx`
- `src/lib/contact-templates.ts` & `src/lib/contact-templates.test.ts`
- `src/app/(dashboard)/contact/page.tsx`
- `src/app/(dashboard)/error.tsx` & `src/app/error.tsx`
- `src/app/(marketing)/privacy/page.tsx` & `src/app/(marketing)/terms/page.tsx`
- `src/app/design-system/design-system-preview.tsx`

---

## Important Behavior Changes
- **Default System Language:** All UI elements default to English (`lang="en"`).
- **Time Display:** Formatted cleanly as `HH:mm` (e.g. `14:30`) without the Thai suffix `น.`.
- **Status & Priority:** Standardized on English nomenclature (Todo, In Progress, In Review, Done, Blocked; P0 Urgent, P1 High, P2 Normal, P3 Low, etc.) while preserving database enum values.
- **AI Interactions:** Prompts, response templates, error feedback, and draft cards are in English by default.
- **Toasts & Modals:** Every CRUD operation, confirmation modal, and toast notification provides clear, user-friendly English feedback.

---

## Database / Schema Changes
- None. Schema remains unchanged.

---

## Verification Commands & Results

1. `npx vitest run` (Entire test suite):
   - **Result:** `91 passed (91) / 477 passed | 3 skipped (480)`. All tests passed.
2. `npx prisma validate`:
   - **Result:** `The schema at prisma\schema.prisma is valid 🚀`.
3. `npm run lint`:
   - **Result:** `✔ No ESLint warnings or errors`.
4. `npm run build`:
   - **Result:** Completed with code 0. Compiled successfully and generated all 38 static & dynamic routes.

---

## Known Follow-ups / Blockers
- None. System is ready for production deployment.
