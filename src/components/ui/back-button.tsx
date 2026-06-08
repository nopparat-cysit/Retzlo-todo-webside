"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

export function BackButton({ className, label = "Back" }: { className?: string; label?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => router.back()}
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.055] text-stone-300 transition hover:border-dusk-lavender/45 hover:bg-white/10 hover:text-dusk-lavender",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4" />
    </button>
  );
}
