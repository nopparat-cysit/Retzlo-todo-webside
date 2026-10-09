# Work Note: AI Chat Panel Professional Redesign

- **Date**: 2026-10-09
- **Objective**: The AI chat panel looked too playful/childish. Redesign it into a clean, professional assistant panel in line with the retro lofi indigo direction.

## Files
- Modified: `src/components/ai/ai-chat-widget.tsx`: full visual redesign plus TH/EN copy.
- Created: `src/components/ai/ai-message-content.tsx`: safe Markdown subset renderer (no `innerHTML`).
- Created: `src/components/ai/ai-message-content.test.ts`: parser tests and styling guardrails.
- Modified: `src/lib/i18n/language-context.tsx`: exposes `isEn`.
- Modified: `docs/theme-system.md`: change-log entry.

## Behavior Changes
- Removed emojis, bouncing dots, the duplicate sparkle and the loud accent user bubble.
- Assistant replies render Markdown (headings, bold, code, lists) instead of raw `**`/`-`.
- New empty state with headline and icon-led prompt rows. The welcome message is now UI-only and is not sent to the API.
- Error replies are flagged `isError`, styled with danger tokens and excluded from the API payload.
- The draft-card proposal panel uses semantic tokens instead of hardcoded `stone-*`.
- Composer auto-grows (max 160px), ignores Enter during IME composition, and has a solid send button.
- Copy now handles clipboard failure with an error toast.
- **Shared fix**: `useLanguage().isEn` was missing from the context, so `DatePicker`, `TimePicker`, `DateTimePicker`, `HelpButton`, `NotificationsPopover`, `ProjectMembersView` and `DraftRecoveryModal` always showed Thai. These components now follow the selected language.

## Database
- None.

## Verification
- `npx vitest run`: 91 files passed (477 passed, 3 skipped).
- `npx tsc --noEmit`: 1 pre-existing error remains, unrelated to this work: `board-attributes-tab.tsx:984` `cfg.dot` is missing from the status config type. Earlier `isEn` errors are resolved.
- `npm run lint`: no warnings or errors. `npx prisma validate`: schema valid. `npm run build`: compiled successfully.

## Follow-ups
- Restyle `AiBreakdownModal` and `AiProjectSummaryModal` to match.
- Fix `cfg.dot` in `board-attributes-tab.tsx`: the status dot currently gets no color class.
- `next.config` has `typescript.ignoreBuildErrors: true`, which hid the `isEn` bug. Consider adding `tsc --noEmit` to CI.
