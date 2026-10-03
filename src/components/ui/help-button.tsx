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
        "relative grid h-9 w-9 shrink-0 place-items-center rounded-full text-stone-400 transition-all hover:text-stone-100 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-dusk-lavender/50 active:scale-95",
        className
      )}
      aria-label="ข้อมูลระบบและความช่วยเหลือ"
      title="ข้อมูลระบบ & คู่มือการใช้งาน (Help & Guides)"
    >
      <HelpCircle className="h-4.5 w-4.5" />
    </Link>
  );
}
