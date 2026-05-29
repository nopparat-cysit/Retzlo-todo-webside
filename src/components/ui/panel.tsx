import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("lofi-panel rounded-lg", className)} {...props} />;
}

export function PageShell({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <main className={cn("mx-auto min-h-screen w-full max-w-7xl px-4 py-6 sm:px-6", className)} {...props} />;
}
