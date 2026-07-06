import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ToolbarProps {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function Toolbar({ title, description, actions, children, className }: ToolbarProps) {
  return (
    <div className={cn("flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      {(title || description) ? (
        <div className="min-w-0">
          {title ? <h2 className="truncate text-xl font-semibold text-stone-100">{title}</h2> : null}
          {description ? <p className="mt-1 text-sm leading-6 text-stone-400">{description}</p> : null}
        </div>
      ) : null}
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        {children}
        {actions}
      </div>
    </div>
  );
}
