# Work Note: 2026-10-22 — Sanitize and Redact Public In-App Guide

## Objective
Sanitize and redact the public in-app guide (`/help` and `/docs`) as well as the System Information modal (`HelpButton`), eliminating disclosures of administrative URLs, honeypot decoy telemetry, administrative-only modules, internal developer rules/filenames, and vendor infrastructure details, transforming them into a 100% end-user focused guide.

## Files Created / Modified
- `src/components/help/data/topics-th.ts`: Removed `super-admin-portal` and `audit-logging-hub` articles; replaced internal technical vendor strings (Pusher, Neon, Prisma, DeepSeek, Cloudinary, Argon2, NextAuth, Next.js, AGENTS.md, ConfirmModal) with clean user-centric workflow descriptions.
- `src/components/help/data/topics-en.ts`: Removed administrative topics; sanitized all technical specs and concept text into user-focused summaries.
- `src/components/help/hub-diagram.tsx`: Redesigned `RetzloHubDiagram` from a database/vendor architecture map into the **Retzlo Workspace Workflow Ecosystem Map**, focusing on planning modules, central workspace sync, and productivity surfaces.
- `src/components/help/sandboxes.tsx`: Sanitized simulated AI replies and sample Kanban tasks, eliminating references to NextAuth, Bcrypt, Argon2, and Pusher integrations.
- `src/components/help/help-center-client.tsx`: Replaced sidebar footer reference from `system-guide.md` to `Retzlo User Guide`; replaced pipeline demo with **4-Step Workflow Journey**; renamed "Technical Specifications" to "Feature Quick Facts & Summary"; aligned RBAC matrix ID to `roles-and-security`.
- `src/components/help/docs-primitives.tsx`: Updated default sandbox status from internal memory state to interactive preview label; updated ledger heading to feature summary.
- `src/components/help/data/reference.ts`: Replaced administrative audit log entry in RBAC matrix with board activity history; cleaned up FAQ questions and answers.
- `src/components/help/data/categories.ts`: Updated category theme and eyebrow text to user manual terminology.
- `src/components/ui/help-button.tsx`: Replaced raw tech stack listings (Next.js, Tailwind, Neon, Prisma, Pusher) in the About modal with 4 core platform capabilities.
- `src/components/help/help-center.test.ts`: Added automated regression test asserting zero leakage of administrative URLs (`/admin-vault-9f8e`), honeypot telemetry, admin topics, vendor tech stacks, or internal repo filenames.
- `docs/system-guide.md`: Updated section 2.12 and appended dated changelog entry for public guide sanitization.

## Important Behavior Changes
- Users accessing `/help` or `/docs` now experience a cohesive, professional SaaS user manual without exposure to sensitive infrastructure or admin routes.
- The secret admin portal URL (`/admin-vault-9f8e`) and honeypot decoy details are completely unreferenced in public UI components.
- The System Information modal in `HelpButton` presents user benefits and platform capabilities instead of raw engineering dependencies.

## Database / Schema Changes
- None.

## Verification Commands Run & Results
- `npx vitest run src/components/help/help-center.test.ts`: Passed (6 of 6 tests passed, including automated anti-leak assertion).
- `npx prisma validate`: Passed (The schema at `prisma/schema.prisma` is valid).
- `npm run lint`: Passed (No ESLint warnings or errors).
- `npm run build`: Passed (Compiled successfully, static and dynamic routes generated).

## Known Follow-ups, Blockers, or Deployment Notes
- None.
