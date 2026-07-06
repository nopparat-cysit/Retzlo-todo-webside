import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageShellProps {
  children: ReactNode;
  className?: string;
}

export function PageShell({ children, className }: PageShellProps) {
  return (
    <main className={cn("soft-grid-bg min-h-screen w-full overflow-x-hidden p-3 sm:p-4 lg:p-5", className)}>
      {children}
    </main>
  );
}
