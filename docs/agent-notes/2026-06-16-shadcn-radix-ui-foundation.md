# 2026-06-16 Shadcn Radix UI Foundation

## Objective

Install and establish a shadcn-style UI foundation using Radix UI, Tailwind CSS, lucide-react, and the existing custom sticker icon direction.

## Files Created

- `components.json`
- `src/components/ui/badge.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/dropdown-menu.tsx`
- `src/components/ui/label.tsx`
- `src/components/ui/popover.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/separator.tsx`
- `src/components/ui/sticker-surface.tsx`
- `src/components/ui/tabs.tsx`
- `src/components/ui/tooltip.tsx`

## Files Modified

- `package.json`
- `package-lock.json`
- `src/lib/utils.ts`
- `src/components/ui/button.tsx`
- `src/components/ui/input.tsx`
- `src/components/finance/category-form.tsx`

## Behavior Changes

- Added Radix primitives for dialogs, dropdowns, popovers, selects, tabs, tooltips, labels, and separators.
- Added shadcn-style variant support through `class-variance-authority` and class conflict merging through `tailwind-merge`.
- Updated the shared button and input controls to a more restrained Modern Soft Retro product style.
- Added reusable sticker icon surfaces/buttons so custom sticker icons can be used consistently across modules.
- Updated the finance category form to use the new Radix select, label, and sticker button components.

## Database / Schema Changes

- None.

## Verification

- `npx prisma validate`: passed.
- `npm run lint`: passed with no ESLint warnings or errors.
- `npm run build`: passed; Next.js generated 46 app routes.

## Notes

- `npm install` reported 14 audit findings and an engine warning for `eslint-visitor-keys@5.0.1` with the current Node version. No audit fix was run because it may introduce broader dependency changes.
