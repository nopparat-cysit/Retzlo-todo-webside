"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center p-6 text-center">
      <div className="lofi-panel mx-auto max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl border border-dusk-rose/40 bg-dusk-rose/15 text-dusk-rose">
          <AlertTriangle className="h-6 w-6" />
        </div>

        <h2 className="text-lg font-bold text-stone-100">Unable to load dashboard</h2>
        <p className="mt-2 text-xs leading-relaxed text-stone-400">
          An error occurred while loading project data. You can try refreshing the data or go back to your workspaces.
        </p>

        {process.env.NODE_ENV !== "production" && error.message ? (
          <div className="mt-3 rounded-xl border border-dusk-rose/30 bg-ink-950/80 p-3 text-left font-mono text-[11px] text-stone-200 break-all max-h-48 overflow-y-auto">
            <div className="font-bold text-dusk-rose mb-1">{error.name || "Error"}:</div>
            <div className="text-stone-300">{error.message}</div>
            {error.stack && (
              <details className="mt-2 text-[10px] text-stone-400">
                <summary className="cursor-pointer text-stone-500 hover:text-stone-300">Stack trace</summary>
                <pre className="mt-1 whitespace-pre-wrap text-[9px] text-stone-400 overflow-x-auto">{error.stack}</pre>
              </details>
            )}
          </div>
        ) : null}

        {error.digest && (
          <p className="mt-2 font-mono text-[10px] text-stone-500">
            Error Digest: {error.digest}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            onClick={() => reset()}
            className="flex items-center gap-2 text-xs font-semibold"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Try again
          </Button>

          <Link
            href="/"
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-theme-border bg-theme-paper px-4 text-xs font-medium text-theme-muted transition hover:border-theme-accent hover:bg-theme-paper-strong hover:text-theme-foreground"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Workspaces
          </Link>
        </div>
      </div>
    </div>
  );
}
