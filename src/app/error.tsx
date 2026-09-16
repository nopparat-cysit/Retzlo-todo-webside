"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center p-6 text-center">
      <div className="lofi-panel mx-auto max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl border border-dusk-rose/40 bg-dusk-rose/15 text-dusk-rose">
          <AlertTriangle className="h-6 w-6" />
        </div>

        <h2 className="text-lg font-bold text-stone-100">เกิดข้อผิดพลาดในการโหลดหน้าเว็บ</h2>
        <p className="mt-2 text-xs leading-relaxed text-stone-400">
          ระบบพบข้อผิดพลาดที่ไม่คาดคิด คุณสามารถลองโหลดใหม่อีกครั้ง หรือกลับไปยังหน้าหลัก
        </p>

        {error.message && (
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
        )}

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
            ลองใหม่อีกครั้ง
          </Button>

          <Link
            href="/"
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-xs font-medium text-stone-300 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
          >
            <Home className="h-3.5 w-3.5" />
            หน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );
}
