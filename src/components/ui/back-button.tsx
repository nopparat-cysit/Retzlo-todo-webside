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
    // If referrer was an auth page or external, avoid bouncing back to login
    const isFromAuth =
      typeof document !== "undefined" &&
      (document.referrer.includes("/login") ||
        document.referrer.includes("/register") ||
        document.referrer.includes("/reset-password") ||
        document.referrer.includes("/forgot-password") ||
        document.referrer.includes("/accept-invitation"));

    if (typeof window !== "undefined" && window.history.length > 2 && !isFromAuth) {
      // From board root, user expects going back to projects list
      if (pathname?.match(/^\/project\/[^/]+\/board$/)) {
        router.push("/projects");
        return;
      }
      router.back();
      return;
    }

    // Safe fallback based on current path
    if (pathname?.startsWith("/project/")) {
      router.push("/projects");
    } else if (pathname?.startsWith("/finance/") || pathname === "/finance") {
      router.push("/select-module");
    } else if (pathname === "/projects") {
      router.push("/select-module");
    } else if (pathname === "/profile") {
      router.push("/projects");
    } else if (pathname === "/hub" || pathname === "/vital" || pathname === "/office") {
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
