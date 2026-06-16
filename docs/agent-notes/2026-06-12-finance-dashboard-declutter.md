# Personal Finance Dashboard Declutter & Polish

Date: 2026-06-12

## Objective

Redesign the Personal Finance dashboard to make it clean, tidy, elegant, and nostalgic retro-lofi. Simplify card clutter, merge redundant information, and organize widgets into a neat two-column layout.

## Files Changed

- `src/components/finance/finance-dashboard.tsx`
  - Combined `FinanceSummaryCards` (4 cards) and `MiniDashboardCard` (4 cards) into a single horizontal `<OverviewPanel>` displaying Balance, Income, Expenses, and Budget.
  - Integrated the monthly budget progress gauge directly inside the Budget metric block of the overview panel.
  - Removed the redundant accounts card panel from the bottom of the dashboard.
  - Added a compact `<MonthlyBillsSummary>` widget in the sidebar (right column) to show the total monthly recurring bills (money out), active bill count, and next due bill details.
  - Restructured the dashboard layout into a two-column grid (`lg:grid-cols-[1.4fr_1fr]`).
- `src/components/finance/finance-summary-cards.tsx` [DELETED]
  - Deleted this file as its metrics have been consolidated into the dashboard overview panel.

## Behavior Changes

- **Clean Visual Density**: The top section is now a unified lofi-panel showing key metrics instead of a wall of 8 SaaS-like cards.
- **Embedded Budget Gauge**: The monthly budget bar is neatly integrated inside the budget metric section and displays only when a budget is set, otherwise showing a clean "Set Limit" trigger.
- **Monthly Bills Widget**: Replaced the redundant accounts preview with a dedicated, clean billing summary card that displays the total monthly cost of recurring bills and warns about the next upcoming bill.

## Verification

- `npm run lint`: Passed with zero warnings or errors.
- `npm run build`: Passed successfully.
