# Board Reward-style preview

- Date: 2026-06-23
- Objective: Create a visual preview for applying the compact Reward-style sticker layout to the Board page.
- Created: `docs/previews/board-reward-style-preview.svg`.
- Behavior changes: None. This is a static preview only and does not modify app code.
- Design direction:
  - Keep the full Board experience in one viewport.
  - Use a compact single-row board header with title/copy on the left, filters/actions below-left, stats on the upper-right, and one sticker on the far right.
  - Keep columns inside the remaining height and let columns scroll internally when needed.
  - Keep sticker use restrained so the Board stays usable, not decorative-heavy.
- Shared design-system impact: None. No shared component or token was changed.
- Database/schema changes: None.
- Verification:
  - Preview file created and reviewed as a static SVG artifact.

