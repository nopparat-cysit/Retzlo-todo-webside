# AI Chat Theme Fix

- Date: 2026-10-01
- Objective: Make the AI Chat widget follow the selected Light or Dark theme.
- Files modified: `src/components/ai/ai-chat-widget.tsx`, `docs/theme-system.md`, this work note.
- Behavior changes: Replaced fixed stone/dusk colors in the launcher, chat window, message bubbles, context/credit banner, prompt chips, controls, typing indicator, and input with semantic theme and status tokens. Chat sending, credits, session storage, and persistence behavior are unchanged.
- Shared design impact: `AiChatWidget` is rendered on non-auth routes. Its surfaces, foregrounds, borders, accents, success indicator, and warning accent now follow the selected theme.
- Database/schema changes: None.
- Visual verification: Local desktop at 1280×720. Light side panel; Dark floating widget and side panel. Checked launcher/window surfaces, welcome/assistant bubble, quick prompts, controls, and composer. Restored theme preference to `system`. Did not send a message to the AI endpoint.
- Verification commands: `npm run lint` passed; `npx tsc --noEmit` passed; `npx prisma validate` passed; `npm run build` passed (Next.js skipped its internal type/lint phases, covered by the standalone commands); `git diff --check` on the widget passed with only the existing LF-to-CRLF notice.
- Known limitation/follow-ups: Local Neon connection was unavailable; the credit request returned HTTP 500, so the project context/credit banner could not be visually reviewed. No AI chat request or database write was made. Inspect mobile sizing and keyboard focus in both themes, then verify the banner when local DB access is available.
