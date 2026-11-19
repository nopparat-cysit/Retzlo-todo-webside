"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isChunkLoadError, triggerChunkReload } from "@/lib/chunk-recovery";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [clearing, setClearing] = useState(false);
  const isChunk = isChunkLoadError(error);

  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  const handleReload = () => {
    triggerChunkReload(true);
  };

  const handleClearCacheAndReload = async () => {
    try {
      setClearing(true);
      if (typeof window !== "undefined" && "caches" in window) {
        try {
          const keys = await window.caches.keys();
          await Promise.all(keys.map((k) => window.caches.delete(k)));
        } catch {}
      }
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("retzlo") || key.startsWith("retrod"))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      sessionStorage.clear();
    } catch {
      // ignore storage access errors
    } finally {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("_r", String(Date.now()));
        window.location.replace(url.toString());
      } catch {
        window.location.reload();
      }
    }
  };

  if (isChunk) {
    return (
      <div className="flex min-h-[70vh] w-full flex-col items-center justify-center p-6 text-center">
        <div className="lofi-panel mx-auto max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl border border-theme-primary/40 bg-theme-primary/15 text-theme-primary">
            <RefreshCw className="h-6 w-6" />
          </div>

          <h2 className="text-lg font-bold text-stone-100">
            A new version of Retzlo is available / มีการอัปเดตเวอร์ชันใหม่
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-stone-300">
            Please reload the page to load the latest version / กรุณารีโหลดหน้าเว็บเพื่อใช้งานเวอร์ชันล่าสุด
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-stone-400">
            A newer release was published. Reloading will sync your browser with the updated files.
          </p>

          {error?.message ? (
            <div className="mt-3 rounded-xl border border-white/10 bg-ink-950/80 p-3 text-left font-mono text-[11px] text-stone-300 break-all max-h-36 overflow-y-auto">
              <div className="font-bold text-theme-primary mb-1">{error.name || "Error"}:</div>
              <div>{error.message}</div>
              {error.digest ? (
                <div className="mt-1 text-[10px] text-stone-500">Digest: {error.digest}</div>
              ) : null}
            </div>
          ) : error?.digest ? (
            <p className="mt-2 font-mono text-[10px] text-stone-500">
              Error Digest: {error.digest}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              type="button"
              onClick={handleReload}
              className="flex items-center gap-2 text-xs font-semibold"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reload page / รีโหลดหน้าเว็บ
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={handleClearCacheAndReload}
              disabled={clearing}
              className="text-xs"
            >
              {clearing ? "Clearing..." : "Clear cache & reload / ล้างแคชแล้วรีโหลด"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center p-6 text-center">
      <div className="lofi-panel mx-auto max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl border border-dusk-rose/40 bg-dusk-rose/15 text-dusk-rose">
          <AlertTriangle className="h-6 w-6" />
        </div>

        <h2 className="text-lg font-bold text-stone-100">Something went wrong</h2>
        <p className="mt-2 text-xs leading-relaxed text-stone-400">
          An unexpected error occurred while loading this page. You can try again or return to the home page.
        </p>

        {error?.message ? (
          <div className="mt-3 rounded-xl border border-dusk-rose/30 bg-ink-950/80 p-3 text-left font-mono text-[11px] text-stone-200 break-all max-h-48 overflow-y-auto">
            <div className="font-bold text-dusk-rose mb-1">{error.name || "Error"}:</div>
            <div className="text-stone-300">{error.message}</div>
            {error.digest ? (
              <p className="mt-1 text-[10px] text-stone-400">Digest: {error.digest}</p>
            ) : null}
            {error.stack && (
              <details className="mt-2 text-[10px] text-stone-400">
                <summary className="cursor-pointer text-stone-500 hover:text-stone-300">Stack trace</summary>
                <pre className="mt-1 whitespace-pre-wrap text-[9px] text-stone-400 overflow-x-auto">{error.stack}</pre>
              </details>
            )}
          </div>
        ) : error?.digest ? (
          <p className="mt-2 font-mono text-[10px] text-stone-500">
            Error Digest: {error.digest}
          </p>
        ) : null}

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
            <Home className="h-3.5 w-3.5" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
