# 2026-10-04 — Fix Board Export Canvas Capture & Font Fallback Engine

## Objective
Diagnose and resolve the issue where board exports ("export มีปัญหา") produced blank/empty images or failed downloads, specifically in PNG and PDF formats when exporting Kanban boards.

## Root Cause Analysis
1. **SVG `<foreignObject>` Viewport Displacement:**
   The dedicated export staging elements (`#retzlo-export-render-canvas` and `#retzlo-export-render-canvas-quick`) were placed directly with inline styles `position: fixed; left: -99999px;`. When `html-to-image` (`toPng`) cloned the element and embedded it into an SVG `<foreignObject width="100%" height="100%">`, the element retained its computed `left: -99999px`. Inside an SVG canvas of e.g. 1540x900px, rendering at `x = -99999px` placed all board columns completely outside the visible canvas bounds, generating a completely blank/empty white or dark rectangle (and consequently a blank PDF).
2. **Font Embedding & Cross-Origin Network Failures:**
   By default, `html-to-image` attempts to fetch all `@font-face` rules found in document stylesheets. When font fetching encounters network restrictions, CORS boundaries, or offline states, `toPng` threw an uncaught error, rejecting the export promise and causing the toast notification to report failure.
3. **Download Anchor Detached Click on Strict Browsers:**
   In `exportElementToPng`, `link.click()` was called without appending the anchor element to `document.body`, which can fail silently on Firefox.

## Key Changes
- **`src/lib/kanban/export-board.ts`:**
  - Added layout stabilization tick (`await new Promise((r) => setTimeout(r, 80))`) to allow DOM reflow to settle.
  - Measured natural dimensions (`scrollWidth`, `offsetWidth`, `clientWidth`, `scrollHeight`, `offsetHeight`, `clientHeight`).
  - Added root style normalization in `toPng` (`options.style`) to enforce `position: relative`, `left: 0`, `top: 0`, `margin: 0`, `transform: none`, `opacity: 1`, `visibility: visible`.
  - Implemented automatic font embedding try/catch fallback: if font fetching fails, immediately retries with `skipFonts: true` so exports never crash.
  - Appended download link to `document.body` before `.click()` and removed it immediately after.
  - Added validation on `img.width` and `img.height` before jsPDF calculation to prevent NaN / division by zero.
- **`src/components/kanban/board-export-modal.tsx`:**
  - Refactored off-screen staging for both `BoardExportModal` and `BoardExportButton`: separated the off-screen positioning (`left: -99999px; width: max-content; overflow: visible;`) to an outer staging wrapper, while `#retzlo-export-render-canvas` and `#retzlo-export-render-canvas-quick` inside it maintain `position: relative; left: 0; top: 0; width: max-content; display: inline-block;`.
  - Added `modalCanvasRef` and `quickCanvasRef` using `useRef` to directly reference the appropriate staging element without DOM ID collisions.
  - Added theme detection (`isDarkTheme`) for quick export to automatically match user's current theme preference.
- **`src/components/kanban/board-views-and-sidebar.test.ts` & `src/lib/ai/engine.test.ts`:**
  - Updated test expectation in `board-views-and-sidebar.test.ts` to match the enhanced board general settings route query parameter (`settings?tab=board-general&boardId=`).
  - Added `SHOULD_RUN_LIVE` guard in `engine.test.ts` and updated `getAiApiKey` to isolate automated Vitest runs from external API balance exhaustion.
- **Documentation:**
  - Updated `docs/system-guide.md` section 2.6 with Off-screen Staging Wrapper & Font Fallback Engine details.
  - Updated `src/components/help/help-center-client.tsx` export guide highlights.
  - Appended dated entry in `docs/theme-system.md` change log.

## Verification
- `npx vitest run`: Passed 88/88 test files (449 tests passed, 3 skipped).
- `npx prisma validate`: The schema at `prisma/schema.prisma` is valid.
- `npm run lint`: 0 warnings, 0 errors.
- `npm run build`: Production build succeeded across all 38 routes.
