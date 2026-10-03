"use client";

import Link from "next/link";
import { HelpCircle } from "lucide-react";

import { cn } from "@/lib/utils";

interface HelpButtonProps {
  className?: string;
  href?: string;
}

export function HelpButton({ className, href = "/help" }: HelpButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "relative grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.045] text-stone-400 transition hover:border-dusk-lavender/45 hover:text-dusk-lavender hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-dusk-lavender/50",
        className
      )}
      aria-label="ข้อมูลระบบและความช่วยเหลือ"
      title="ข้อมูลระบบ & คู่มือการใช้งาน (Help & Guides)"
    >
      <HelpCircle className="h-4 w-4" />
    </Link>
  );
}
