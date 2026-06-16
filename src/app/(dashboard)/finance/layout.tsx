import { Suspense } from "react";
import { FinanceShell } from "@/components/finance/finance-shell";

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <main className="soft-grid-bg min-h-screen w-full overflow-x-hidden px-4 py-4 sm:px-5 lg:px-6 flex items-center justify-center">
        <p className="text-stone-400">Loading Finance Workspace...</p>
      </main>
    }>
      <FinanceShell>{children}</FinanceShell>
    </Suspense>
  );
}
