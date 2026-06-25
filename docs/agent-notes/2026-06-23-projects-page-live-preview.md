# 2026-06-23 Projects page live UI preview

## Objective

Create a static preview for the Projects page direction based on the current `ProjectsDashboard` UI.

## Files created

- `docs/previews/projects-page-live-ui-preview.svg`

## Behavior changes

- None. This is a static preview asset only.
- The preview keeps stickers outside project cards so the cards remain focused on project content and actions.
- Moved the `Recent rhythm` and `Cozy status` preview blocks into a right-side support column instead of placing them below the project cards.

## Database/schema changes

- None.

## Verification

- Confirmed the SVG file exists.
- Checked the preview contains key real UI labels (`Workspaces`, `Choose your board`, project cards, calendar context).
- Confirmed sticker groups are placed around the page surface rather than inside project cards.
- Confirmed the `RECENT RHYTHM` and `COZY STATUS` labels are present in the right-side support column.
- Re-ran `npm run lint`; passed with no ESLint warnings or errors.
- Re-ran `npx prisma validate`; passed.
- Re-ran `npm run build`; still blocked before Next.js build during `prisma generate` with `EPERM` while renaming `node_modules\\.prisma\\client\\query_engine-windows.dll.node.tmp*` to `query_engine-windows.dll.node`.

## Follow-ups

- If approved, apply the preview direction to the real Projects page components.
