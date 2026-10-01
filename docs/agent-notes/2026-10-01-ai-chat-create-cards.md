# AI Chat Card Creation

- Date: 2026-10-01
- Objective: Let AI Chat prepare task cards for the active project board and require explicit confirmation before writing them.
- Files created: `src/lib/ai/chat-actions.ts`, `src/app/api/ai/create-cards/route.ts`, this work note.
- Files modified: `src/components/ai/ai-chat-widget.tsx`, `src/app/api/ai/chat/route.ts`, `src/lib/ai/prompts.ts`, `docs/theme-system.md`.
- Behavior changes: AI may return a validated draft of up to 10 new cards with title, description, priority, due date, and column. The chat displays the exact board and card details; `ConfirmModal` is required before a single transaction creates them. Cancel leaves the database untouched. Success/error Toasts report the outcome. Existing board clients receive card-created Pusher events.
- Authorization and validation: Chat context is limited to the active accessible board; private boards require board access. The create endpoint rechecks project membership, board membership/access, board/project relationship, column ownership, payload lengths, date formats, and batch size. AI output alone never writes to the database.
- Shared design impact: The AI Chat widget is global on non-auth routes. The proposed-card preview follows the existing AI Chat palette and shared `ConfirmModal`; it adds no theme tokens.
- Database/schema changes: None.
- Verification: `npm run lint` passed; `npx tsc --noEmit` passed; `npx prisma validate` passed; `npm run build` passed. Next.js skipped internal type and lint phases; standalone commands passed separately.
- Known limitation: Local Neon was unreachable, and the credit request returned HTTP 500 during local preview. The AI response/proposal/confirmation flow could not be exercised end-to-end; no AI chat request or database write was made. Run a live confirmation flow when the database is available. Tests were not added or run.
- Scope note: The pending AI Chat semantic-theme restyle remains outside this feature commit; the confirmed-card UI uses the committed widget's existing palette.
