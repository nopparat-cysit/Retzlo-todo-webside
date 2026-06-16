# 2026-06-16 Finance Radix Form Polish

## Objective

Apply the new shadcn-style Radix UI foundation to finance forms and remove broken/mojibake copy from the finance form experience.

## Files Modified

- `src/components/finance/account-form.tsx`
- `src/components/finance/budget-form.tsx`
- `src/components/finance/category-form.tsx`
- `src/components/finance/recurring-income-form.tsx`
- `src/components/finance/subscription-form.tsx`
- `src/components/finance/transaction-form.tsx`

## Behavior Changes

- Finance add/edit forms now use shared Radix-backed dialog, select, label, badge, and button primitives.
- Native select controls in these forms were replaced with portal-based Radix selects to avoid clipped or buried dropdowns.
- Broken Thai mojibake copy in recurring bill, recurring income, and budget forms was replaced with readable English UX copy.
- Empty category/account selects now submit `null` via an internal `none` sentinel instead of relying on empty Radix select values.

## Database / Schema Changes

- None.

## Verification

- `rg "à|â|ðŸ" src/components/finance src/components/ui -g "*.tsx" -g "*.ts"`: no matches.
- `npm run lint`: passed with no ESLint warnings or errors.
- `npm run build`: passed; Next.js generated 46 app routes.
- `npx prisma validate`: passed.

## Notes

- Local browser verification on `localhost:3000` was blocked by another project already serving that port. A separate `3004` dev server attempt did not return a usable local response before timeout, but production build verification passed.
