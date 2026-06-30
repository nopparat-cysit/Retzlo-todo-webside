"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface BackButtonProps {
  className?: string;
  label?: string;
}

export function BackButton({ className, label = "Back" }: BackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    // Prefer real browser history (this prevents loop issues)
    if (typeof window !== "undefined" && window.history.length > 2) {
      router.back();
      return;
    }

    // Safe fallback based on current path
    if (pathname?.startsWith("/project/")) {
      router.push("/projects");
    } else if (pathname?.startsWith("/finance/") || pathname === "/finance") {
      router.push("/select-module");
    } else if (
      pathname === "/forgot-password" ||
      pathname === "/reset-password" ||
      pathname === "/accept-invitation" ||
      pathname === "/register"
    ) {
      router.push("/login");
    } else {
      router.push("/projects");
    }
  };

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={handleBack}
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.055] text-stone-300 transition hover:border-dusk-lavender/45 hover:bg-white/10 hover:text-dusk-lavender",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4" />
    </button>
  );
}
