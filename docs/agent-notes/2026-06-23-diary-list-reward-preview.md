# Diary List Reward-style preview

- Date: 2026-06-23
- Objective: Create a visual preview for applying the compact Reward-style sticker layout to the Diary List page.
- Created: `docs/previews/diary-list-reward-style-preview.svg`.
- Behavior changes: None. This is a static preview only and does not modify app code.
- Design direction:
  - Treat Diary List as a daily ritual workspace focused on today's checklist first.
  - Keep the page in one viewport with internal scrolling only inside list/checklist areas when needed.
  - Use a compact header with filters below-left, summary metrics on the right, and one diary-themed sticker at the far right.
  - Split the main area into pinned diary lists, today's checklist, and a right-side queue for upcoming/hidden/FAB context.
  - Keep muted upcoming tasks visible but lower priority so due-today items stay dominant.
- Shared design-system impact: None. No shared component or token was changed.
- Database/schema changes: None.
- Verification:
  - Preview file created and reviewed as a static SVG artifact.

