# Work Note: System Structure, Security Boundary, Schema & Design Token Hardening

- Date: 2026-11-23
- Objective: Audit and harden system structure, API security boundaries, transactional integrity, Prisma schema hygiene, PDPA/CCA Section 26 audit logging coverage, UI toast feedback, and global CSS / design token consistency.

## Files Created, Modified, Deleted, or Moved

### Created
- `docs/agent-notes/2026-11-23-system-structure-security-and-token-hardening.md`

### Moved
- `retzlo-backlog-checklist.html` -> `docs/archive/retzlo-backlog-checklist.html`
- `todo-current-module-architecture.html` -> `docs/archive/todo-current-module-architecture.html`
- `todo-current-module-architecture.png` -> `docs/archive/todo-current-module-architecture.png`
- `migrate-db.js` -> `scripts/migrate-db.js`
- `prisma/add-card-note-colors.sql` -> `scripts/add-card-note-colors.sql`

### Deleted
- `src/components/ui/page-shell.tsx` (unused duplicate of `PageShell`)
- `src/components/ui/label.tsx` (unused component)
- `src/components/ui/sticker-surface.tsx` (unused component)

### Modified
- `next.config.mjs`: Set `eslint.ignoreDuringBuilds: false` and `typescript.ignoreBuildErrors: false`; added `Strict-Transport-Security` header.
- `.gitignore`: Added `tsconfig.tsbuildinfo`.
- `prisma/schema.prisma`: Removed 7 unused Finance models (`FinanceTransaction`, `FinanceCategory`, `FinanceAccount`, `Subscription`, `RecurringIncome`, `FinanceLedger`, `FinanceBudget`) and their relation fields on `User`.
- `src/lib/ai/engine.ts`: Removed `NEXT_PUBLIC_AI_API_KEY`, `NEXT_PUBLIC_DEEPSEEK_API_KEY`, and the hardcoded base64 fallback key.
- `src/app/api/ai/chat/route.ts`, `src/app/api/ai/breakdown/route.ts`, `src/app/api/ai/summary/route.ts`, `src/app/api/ai/create-cards/route.ts`: Restricted client message `role` to `user | assistant`, enforced HTTP/HTTPS attachment URLs, blocked unauthenticated `x-ai-model` overrides on the public tier, filtered private boards via `canAccessBoard` in summary generation, and added `createAuditLog()` with CCA Section 26 network fields.
- `src/app/api/cards/[cardId]/comments/route.ts` & `src/app/api/cards/[cardId]/comments/[commentId]/route.ts`: Enforced HTTP/HTTPS attachment URLs, `canAccessBoard` verification, project-scoped R2 key validation (`projects/${projectId}/`) before calling `deleteFromR2`, and `createAuditLog()`.
- `src/app/api/cards/route.ts`, `src/app/api/cards/reorder/route.ts`, `src/app/api/cards/[cardId]/archive/route.ts`, `src/app/api/cards/[cardId]/restore/route.ts`, `src/app/api/cards/[cardId]/coffee/route.ts`, `src/app/api/cards/[cardId]/attachments/route.ts`, `src/app/api/cards/[cardId]/attachments/[attachmentId]/route.ts`: Restricted `rewardCoins` and custom `privateCoins` balances to project `OWNER` or `ADMIN`, validated `assigneeIds` against project membership, wrapped card deletion and position re-indexing in `prisma.$transaction`, enforced `canAccessBoard`, blocked XSS file upload types, and added `createAuditLog()`.
- `src/lib/diary/validation.ts`, `src/app/api/hub/diary/route.ts`, `src/app/api/projects/[id]/diary-items/route.ts`, `src/app/api/diary-items/[diaryItemId]/route.ts`: Capped `rewardCoins` at 1,000, forced `rewardCoins: 0` on personal (`projectId: null`) diary creation, and added PDPA-compliant `createAuditLog()` (omitting raw `description` text).
- `src/app/api/hub/notes/route.ts`, `src/app/api/projects/[id]/notes/route.ts`, `src/app/api/notes/[noteId]/route.ts`, `src/app/api/projects/[id]/note-folders/route.ts`, `src/app/api/note-folders/[folderId]/route.ts`: Filtered private boards in `GET /api/hub/notes`, validated `boardId` and `folderId` belong to the target `projectId`, and added PDPA-compliant `createAuditLog()` (omitting raw `content` text).
- `src/app/api/admin/rewards/route.ts`, `src/app/api/rewards/route.ts`, `src/app/api/rewards/[rewardId]/route.ts`, `src/app/api/rewards/redeem/route.ts`: Added `status === "PENDING"` check and quantity refund on admin rejection; added atomic conditional coin and stock decrements (`gte`) inside `prisma.$transaction`; completed CCA Section 26 fields on all `createAuditLog()` calls.
- `src/app/api/admin/ai/route.ts`, `src/app/api/admin/audit-logs/route.ts`, `src/app/api/admin/projects/route.ts`, `src/app/api/admin/users/route.ts`: Added `Number.isNaN` pagination guards and CCA Section 26 `createAuditLog()` entries.
- `src/app/api/auth/accept-invitation/route.ts`, `src/app/api/auth/forgot-password/route.ts`, `src/app/api/auth/verify-reset-otp/route.ts`, `src/app/api/auth/reset-password/route.ts`, `src/app/api/profile/route.ts`, `src/app/api/profile/avatar/route.ts`, `src/app/api/profile/password/route.ts`, `src/app/api/upload/route.ts`: Enforced authenticated user and email ownership on `DELETE /api/auth/accept-invitation`, blocked executable/XSS file uploads, and added zero-PII `createAuditLog()` instrumentation.
- `src/app/api/projects/route.ts`, `src/app/api/projects/[id]/route.ts`, `src/app/api/projects/[id]/boards/route.ts`, `src/app/api/projects/[id]/cover/route.ts`, `src/app/api/projects/[id]/invite/route.ts`, `src/app/api/projects/[id]/members/route.ts`, `src/app/api/projects/[id]/settings/route.ts`, `src/app/api/boards/[boardId]/route.ts`, `src/app/api/boards/[boardId]/activities/route.ts`, `src/app/api/boards/[boardId]/archived/route.ts`, `src/app/api/columns/route.ts`, `src/app/api/columns/[columnId]/route.ts`, `src/app/api/columns/reorder/route.ts`: Validated `memberUserIds` against project membership, enforced `canAccessBoard`, prioritized `NEXTAUTH_URL` over `Origin` header on invitation links, added `Number.isNaN` guard on activities limit, and added `createAuditLog()`.
- `src/lib/zen-garden/zen-state.ts` & `src/app/api/zen-garden/route.ts`: Added `moisture` and `plantedAt` typing on `GardenPlot`, fixed Prisma JSON input casts, and added CCA Section 26 network fields to all `createAuditLog()` calls.
- `src/lib/admin-auth.ts`: Blocked suspended admin accounts (`user.status === "SUSPENDED"`).
- `src/lib/audit/audit-logger.ts`: Added diary/reflection and API key patterns to `SENSITIVE_KEY_PATTERNS` and tightened `auth` key matching so `authorId` is preserved.
- `src/lib/r2.ts`, `src/components/hub/diary-hub-panel.tsx`, `src/components/hub/notes-hub-panel.tsx`, `src/components/profile/avatar-upload.tsx`, `src/components/auth/reset-password-form.tsx`, `src/components/project/zen-garden/zen-sanctuary-modal.tsx`, `src/lib/chunk-recovery.test.ts`, `src/lib/omikuji/omikuji-settings.test.ts`: Resolved all 17 strict TypeScript errors and added `useToast()` feedback on CUD operations.
- `src/app/globals.css`, `tailwind.config.ts`, `src/components/ui/input.tsx`, `src/components/ui/panel.tsx`, `docs/theme-system.md`: Added `--border-strong` CSS custom property and `theme.border-strong` Tailwind token, cleaned mojibake comment headers in `globals.css`, migrated `Input` picker button to semantic tokens, removed unused `PageShell` export from `panel.tsx`, and updated the theme change log.
- Responsive UX/UI Hardening Sweep (Units A, B & C across 50+ UI files):
  - Fixed `< lg` scroll traps in `src/components/project/projects-dashboard.tsx`, `src/app/(dashboard)/project/[id]/rewards/page.tsx`, `src/components/project/project-quick-hub.tsx`, `src/components/notes/notes-panel.tsx`, `src/components/notes/board-notes-rail.tsx`, `src/components/diary/diary-list-panel.tsx`, `src/components/hub/diary-hub-panel.tsx`, `src/components/diary/diary-checklist.tsx`, and `src/components/hub/fab-hub.tsx`.
  - Resolved floating button overlaps between `ProjectQuickHub`, `ProjectMobileBottomNav`, `FabHub`, and `AiChatWidget`.
  - Added viewport height/width clamping (`100dvh`, `max-w-[calc(100vw-1.5rem)]`, `collisionPadding={12}`) to all shared popovers, dropdowns, selects, date/time pickers, and modals (`app-modal.tsx`, `confirm-modal.tsx`, `command-palette.tsx`, `board-settings-modal.tsx`, `create-board-modal.tsx`, `ai-breakdown-modal.tsx`, `ai-project-summary-modal.tsx`, `rewards-store.tsx`, `project-calendar.tsx`).
  - Added mobile View Mode switcher and backdrop to `help-center-client.tsx`, enabled mobile selected-day task list across Calendar Week and 3-Days views (`viewMode !== "list"`), prevented SSR 335px column width overflow on `< sm` via `max-sm:!w-full`, hid `.auth-studio-overlay` on `< 768px`, and added `min-w-[...]` horizontal scroll guards to all Admin Portal tables.

## Database & Schema Changes

- Removed unused models `FinanceTransaction`, `FinanceCategory`, `FinanceAccount`, `Subscription`, `RecurringIncome`, `FinanceLedger`, and `FinanceBudget` from `prisma/schema.prisma`.

## Verification Commands & Results

- `npx prisma validate`: Passed (`The schema at prisma\schema.prisma is valid`).
- `npx tsc --noEmit`: Passed (0 errors).
- `npm run lint`: Passed (0 errors).
- `npx vitest run`: Passed (124 test files, 760 tests passed).
- `npm run build`: Passed (43/43 routes generated with strict TypeScript and ESLint checks enabled).

## Known Follow-ups

- None.
