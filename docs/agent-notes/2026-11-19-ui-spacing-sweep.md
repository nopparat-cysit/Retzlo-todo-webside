# UI Spacing, Touch Targets, and Alignment Standardization

- **Date:** 2026-11-19
- **Objective:** Standardize spacing, padding, margins, touch targets, and alignment anomalies across all surfaces and flows of the Retzlo platform.

## Files Modified
- `tailwind.config.ts`: Added `"7.5": "1.875rem"` to extended spacing to officially support 30px spacing tokens.
- `src/components/ui/command-palette.tsx`: Replaced non-existent `max-h-84` with `max-h-80` and standardized sidebar trigger padding/gap.
- `src/components/ui/toast.tsx`: Expanded dismiss button touch target to `h-6 w-6`.
- `src/components/ui/confirm-modal.tsx`: Standardized close button to `grid h-8 w-8 place-items-center` and added consistent `mt-6` top margin on actions footer.
- `src/components/ui/app-modal.tsx`: Replaced `border-white/10` with semantic token `border-theme-border` in `AppModalFooter`.
- `src/components/ui/help-button.tsx`: Standardized topbar trigger button to `h-9 w-9 rounded-xl`.
- `src/components/project/project-shell.tsx`: Resolved topbar ghost double-gap by aligning outer wrapper breakpoint to `hidden 2xl:inline-flex` and standardized toggle triggers to `h-9 w-9 rounded-xl`.
- `src/components/project/project-topbar-tools.tsx`: Standardized topbar trigger buttons to `h-9 w-9 rounded-xl`.
- `src/components/project/focus-mode-toggle.tsx`: Standardized trigger button to `h-9 w-9 rounded-xl`.
- `src/components/notifications/notifications-popover.tsx`: Standardized trigger button to `h-9 w-9 rounded-xl`.
- `src/components/ai/ai-chat-trigger.tsx`: Standardized trigger button to `h-9 w-9 rounded-xl`.
- `src/components/project/projects-dashboard.tsx`: Standardized Back button to `h-9`, toolbar toggle container to `h-9.5`, and updated `CreateProjectModal` to structured header, body, and footer dividers matching `EditProjectModal`.
- `src/components/project/project-boards-manager.tsx`: Standardized action buttons to `h-8 w-8` and row delete hit target to `grid h-7 w-7 place-items-center`.
- `src/components/kanban/board-list-view.tsx`: Standardized Title column across header, body data rows, and quick-add row to `min-w-[280px] px-3 gap-2`.
- `src/components/kanban/board-attributes-tab.tsx`: Replaced non-standard `scale-102` with arbitrary utility `scale-[1.02]`.
- `src/components/kanban/board.tsx`: Standardized segmented statistics pills horizontal padding to uniform `px-2.5 py-1`.
- `src/components/kanban/column.tsx`: Reduced mobile card list bottom padding from `pb-8 sm:pb-3` to `pb-2.5 sm:pb-3` to eliminate redundant dead space above the quick-add footer.
- `src/components/kanban/card.tsx`: Added Paperclip attachment count indicator to Comfortable View metadata footer cluster.
- `src/components/kanban/card-modal.tsx`: Expanded mobile quick-edit status and priority buttons from `h-5 w-5` (20px) to accessible `h-7 w-7` with `touch-manipulation`.
- `src/components/kanban/board-settings/general-tab.tsx`: Expanded search clear button hit target to `grid h-6 w-6 place-items-center`.
- `src/components/kanban/project-calendar.tsx`: Expanded search clear button to `grid h-6 w-6 place-items-center` and input right padding to `pr-8`.
- `src/components/profile/change-password-form.tsx`: Expanded eye toggle button to `grid h-7 w-7 place-items-center rounded-md`.
- `src/components/settings/omikuji-desk-settings.tsx`: Added `flex-wrap` to button group containers.
- `src/components/notes/notes-panel.tsx`: Increased note title wrapper right padding to `pr-12` to prevent collision with favorite star, and resized sticker image to `size={34}` inside 36px inner container.
- `src/components/notes/folder-modal.tsx`: Made folder icon grid responsive (`grid-cols-4 sm:grid-cols-8`) to prevent overflow on viewports <= 375px.
- `src/components/diary/diary-checklist.tsx`: Added explicit `grid h-6 w-6 place-items-center` bounding box to step expand chevron.
- `src/components/diary/diary-list-panel.tsx`: Replaced non-standard `h-7.5` with `h-8`.
- `src/components/omikuji/omikuji-modal.tsx`: Increased header right padding to `pr-10 sm:pr-12` to prevent control collision with close button, and removed empty flex placeholder in footer when drawMode is not unlimited.
- `src/components/project/rewards-store.tsx`: Added `flex-wrap justify-end` to RewardCard action row and standardized modal close buttons to `grid h-9 w-9 place-items-center rounded-lg`.
- `src/components/auth/reset-password-form.tsx`: Added explicit labels and field spacing wrappers to inputs.
- `src/components/auth/auth-scene.tsx`: Replaced cramped `max-w-[280px]` with `max-w-xs sm:max-w-sm`.
- `src/components/auth/accept-invitation.tsx`: Increased top separation on action button row to `pt-3`.
- `src/app/(marketing)/page.tsx`: Centered mobile hamburger trigger, aligned mobile drawer Sign In button, added `min-w-0 flex-1 truncate` to testimonial author headers, and made Section 7 CTA secondary button responsive (`w-full sm:w-auto`).
- `src/app/(marketing)/hero-board-preview.tsx`: Added `w-5 shrink-0` to ghost assignee placeholder.
- `src/components/help/help-center-client.tsx`: Added `gap-2` to TOC header and `min-w-0 flex-1` / `shrink-0` to shortcuts table.
- `src/components/help/docs-primitives.tsx`: Standardized anchor copy button to `inline-flex h-6 w-6 shrink-0 items-center justify-center` to eliminate hover jitter.
- `src/components/ai/ai-chat-widget.tsx`: Increased user message bubble vertical padding to `px-4 py-2.5` and changed card metadata bullet separators to prevent isolated line wraps.
- `src/components/ai/ai-breakdown-modal.tsx`: Adjusted "Best" recommendation badge padding and text size.

## Database Changes
- None.

## Verification
- `npm run lint`: Passed with 0 errors.
- `npx prisma validate`: Passed (schema is valid).
- `npx vitest run`: Passed with 123/123 test files and 757/757 tests passing.
- `npm run build`: Passed cleanly, generating all 43 static and dynamic routes.

## Deployment Notes
- All changes are backwards-compatible styling and layout refinements with zero breaking changes or database migrations.
