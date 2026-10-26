# Work Note: Card Attributes Responsive 2-Column Split & Spotlight Card Modal Preview

**Date**: 2026-10-26  
**Objective**: Redesign the Project Settings Card Attributes view (`/project/[id]/settings?tab=attributes`) into a high-tier responsive 2-column layout (Left: Management Controls Desk, Right: Interactive Spotlight Card Modal Preview), expand workspace container to `max-w-[1600px]`, and implement skeleton-dimmed inactive sections with vibrant active attribute spotlight and top/bottom subtle fade gradient masks.

## Files Created & Modified

- `src/components/kanban/spotlight-card-modal-preview.tsx` (Created):
  - Built an authentic interactive simulation of the Card Details Modal (`CardModal`).
  - Added top and bottom subtle fade gradient overlays (`pointer-events-none absolute inset-x-0 h-6 sm:h-8 bg-gradient-to-b/t`) for an editorial spotlight aesthetic.
  - Implemented skeleton states for inactive sections (`animate-pulse`, muted labels, placeholder shapes, interactive switch-tab triggers).
  - Implemented vibrant spotlight state for the active attribute (`Status`, `Priority`, or `Story Points`).
  - For `Story Points`, replicates the exact button layout (`-`, `1`, `3`, `5`, `8`, `16`, `21`, `50`) with live score selection and active description underneath.
- `src/components/kanban/board-attributes-tab.tsx` (Modified):
  - Refactored layout to a 2-column responsive grid (`grid grid-cols-1 xl:grid-cols-12 gap-6`).
  - Left column (`xl:col-span-7`): Form controls, preset workflow template chips, inline add inputs, and active attribute item list.
  - Right column (`xl:col-span-5 xl:sticky xl:top-3`): `SpotlightCardModalPreview` accompanied by contextual supplementary previews (e.g. scale chips, Kanban card badges, column tracks).
  - Integrated `onPreviewTemplateChange` and `hideDefaultPreview` with `BoardPrioritiesTab`.
- `src/components/kanban/board-priorities-tab.tsx` (Modified):
  - Added `onPreviewTemplateChange` and `hideDefaultPreview` props to support embedding inside the unified 2-column workspace.
- `src/components/project/project-settings-client.tsx` (Modified):
  - Expanded container width from `max-w-6xl` to `max-w-[1600px]` with generous horizontal padding when `activeTab === "attributes"`.
  - Allowed `<main>` detail pane to expand without `max-w-3xl` restriction when on `attributes`.
- `src/components/kanban/board-settings-attributes.test.ts` (Modified):
  - Added integration unit tests verifying `SpotlightCardModalPreview`, 2-column grid structure, top/bottom fade gradients, and skeleton spotlight states.
- `src/components/project/project-settings-client.test.ts` (Modified):
  - Added test verifying container expansion when `activeTab === "attributes"`.

## Important Behavior Changes

- **Expanded Workspace**: The Card Attributes settings view now fully utilizes wide desktop screens instead of being constrained to a narrow central column with vast empty right-hand space.
- **Left/Right Separation**: Management and editing actions are grouped on the left, while real-time visual card modal previews are displayed on the right.
- **Spotlight & Skeletons**: When editing Story Points, other modal sections (Status, Priority, Assignees) are rendered as muted skeleton placeholders, highlighting Story Points in full vibrant interactive colors with its real score and description. Clicking skeleton headers seamlessly switches to their respective editing tab.

## Database & Schema Changes

- None.

## Verification Commands & Results

```bash
npx vitest run src/components/kanban/ src/components/project/
# Result: 19 test files passed, 128/128 tests passed

npm run lint
# Result: Passed with 0 warnings, 0 errors

npx prisma validate
# Result: The schema at prisma/schema.prisma is valid

npm run build
# Result: Compiled successfully; 43/43 pages generated
```

## Known Follow-ups & Blockers

- None.
