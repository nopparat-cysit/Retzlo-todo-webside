"use client";

import React, { useState, useEffect } from "react";
import {
  Check,
  Compass,
  Layers,
  Lightbulb,
  ShieldCheck,
  AlertTriangle,
  Link as LinkIcon,
  RotateCcw,
  Sparkles,
  Terminal,
  Activity,
  Disc3,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

/* ── Mixtape / Cassette Logo Mark ── */

export function MixtapeLogoMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      {/* Outer Cassette Body */}
      <rect
        x="1"
        y="1"
        width="46"
        height="30"
        rx="4"
        className="fill-stone-900 stroke-stone-700 dark:fill-stone-950 dark:stroke-white/20"
        strokeWidth="1.5"
      />
      {/* Label Area */}
      <rect
        x="5"
        y="4"
        width="38"
        height="18"
        rx="2"
        className="fill-amber-50 stroke-amber-200/80 dark:fill-white/10 dark:stroke-white/15"
        strokeWidth="1"
      />
      {/* Cassette Center Window */}
      <rect
        x="13"
        y="8"
        width="22"
        height="10"
        rx="2"
        className="fill-stone-950/80 stroke-stone-600 dark:fill-black/60 dark:stroke-white/15"
        strokeWidth="0.75"
      />
      {/* Left Reel Spool */}
      <circle cx="18" cy="13" r="3.2" className="stroke-indigo-400 dark:stroke-dusk-lavender" strokeWidth="1" strokeDasharray="2 1" />
      <circle cx="18" cy="13" r="1.2" className="fill-indigo-300 dark:fill-dusk-lavender" />
      {/* Right Reel Spool */}
      <circle cx="30" cy="13" r="3.2" className="stroke-indigo-400 dark:stroke-dusk-lavender" strokeWidth="1" strokeDasharray="2 1" />
      <circle cx="30" cy="13" r="1.2" className="fill-indigo-300 dark:fill-dusk-lavender" />
      {/* Tape Bridge */}
      <line x1="18" y1="15" x2="30" y2="15" className="stroke-stone-400 dark:stroke-stone-500" strokeWidth="0.8" />
      {/* Bottom Notch Trapeze */}
      <path
        d="M10 31 L14 24 L34 24 L38 31 Z"
        className="fill-stone-800 stroke-stone-700 dark:fill-stone-900 dark:stroke-white/15"
        strokeWidth="1"
      />
      {/* Screw Dots */}
      <circle cx="3.5" cy="3.5" r="0.75" className="fill-stone-500" />
      <circle cx="44.5" cy="3.5" r="0.75" className="fill-stone-500" />
      <circle cx="3.5" cy="28.5" r="0.75" className="fill-stone-500" />
      <circle cx="44.5" cy="28.5" r="0.75" className="fill-stone-500" />
    </svg>
  );
}

/* ── Retro Tape Counter (Monospace Roller Bezel) ── */

export function TapeCounter({
  value,
  label = "TAPE",
  isEn = true,
  className,
}: {
  value: number;
  label?: string;
  isEn?: boolean;
  className?: string;
}) {
  // Format to 3 digits (e.g. 000, 042, 100)
  const clamped = Math.max(0, Math.min(999, Math.round(value)));
  const formatted = String(clamped).padStart(3, "0");

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-stone-900 px-2.5 py-1 text-stone-100 shadow-inner dark:border-white/15 dark:bg-black/80",
        className
      )}
      title={isEn ? `Reading Progress: ${clamped}%` : `ความคืบหน้าการอ่าน: ${clamped}%`}
    >
      <div className="flex items-center gap-1.5">
        <Disc3 className="h-3.5 w-3.5 animate-[spin_8s_linear_infinite] text-indigo-400 dark:text-dusk-lavender" />
        <span className="font-mono text-[10px] font-bold tracking-widest text-stone-400 uppercase">
          {label}
        </span>
      </div>
      <div className="flex items-center gap-0.5 rounded border border-stone-800 bg-stone-950 px-1.5 py-0.5 font-mono text-xs font-black tracking-wider text-amber-400 dark:text-dusk-amber shadow-xs">
        {formatted.split("").map((digit, i) => (
          <span
            key={i}
            className="inline-block w-2.5 text-center transition-all duration-300 select-none"
          >
            {digit}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Cassette-Deck Sandbox Frame ── */

export function DocsSandboxDeck({
  title,
  subtitle,
  badgeText = "LIVE BENCH",
  onReset,
  children,
  techSpecs = "IN-MEMORY REACT STATE • ISOLATED BENCH",
  className,
}: {
  title: string;
  subtitle?: string;
  badgeText?: string;
  onReset?: () => void;
  children: React.ReactNode;
  techSpecs?: string;
  className?: string;
}) {
  const [resetting, setResetting] = useState(false);

  const handleResetClick = () => {
    if (!onReset) return;
    setResetting(true);
    onReset();
    setTimeout(() => setResetting(false), 500);
  };

  return (
    <div
      className={cn(
        "group/deck my-6 overflow-hidden rounded-2xl border border-stone-300/90 bg-white/95 shadow-sm transition-all dark:border-white/15 dark:bg-ink-950/90",
        className
      )}
    >
      {/* Top Deck Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-stone-200 bg-stone-100/90 px-4 py-2.5 dark:border-white/10 dark:bg-stone-900/80">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="font-mono text-[10px] font-bold tracking-wider text-indigo-700 uppercase dark:text-dusk-lavender">
              {badgeText}
            </span>
          </div>

          <span className="text-stone-300 dark:text-white/20">•</span>

          <div className="min-w-0">
            <h4 className="font-mono text-xs font-bold text-stone-900 truncate dark:text-stone-100">
              {title}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {subtitle && (
            <span className="hidden sm:inline-block font-mono text-[10px] text-stone-500 dark:text-stone-400">
              {subtitle}
            </span>
          )}

          {onReset && (
            <button
              type="button"
              onClick={handleResetClick}
              disabled={resetting}
              className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-2 py-1 font-mono text-[11px] font-semibold text-stone-700 hover:bg-stone-50 active:scale-95 transition dark:border-white/15 dark:bg-white/5 dark:text-stone-300 dark:hover:bg-white/10 cursor-pointer"
              title="Reset sandbox state"
            >
              <RotateCcw
                className={cn("h-3 w-3 transition-transform", resetting && "animate-spin")}
              />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Sandbox Stage */}
      <div className="p-4 sm:p-5 bg-gradient-to-b from-transparent to-stone-50/50 dark:to-white/[0.02]">
        {children}
      </div>

      {/* Bottom Technical Spec Strip */}
      <div className="flex items-center justify-between border-t border-stone-200/80 bg-stone-50/80 px-4 py-1.5 font-mono text-[10px] text-stone-500 dark:border-white/5 dark:bg-white/[0.02] dark:text-stone-400">
        <div className="flex items-center gap-2 truncate">
          <Terminal className="h-3 w-3 text-stone-400 shrink-0" />
          <span className="truncate">{techSpecs}</span>
        </div>
        <span className="shrink-0 font-mono text-[9px] text-stone-400">
          SYS::ONLINE
        </span>
      </div>
    </div>
  );
}

/* ── Formal Field Manual Callout ── */

export function DocsCallout({
  type = "info",
  title,
  children,
  className,
}: {
  type?: "info" | "tip" | "warning" | "security" | "architecture";
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const config = {
    info: {
      tag: "SYS_NOTE",
      bar: "bg-indigo-600 dark:bg-dusk-lavender",
      tagBadge: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-dusk-lavender/15 dark:text-dusk-lavender dark:border-dusk-lavender/30",
      icon: Compass,
      iconColor: "text-indigo-600 dark:text-dusk-lavender",
      card: "border-stone-200/90 bg-white/95 dark:border-white/10 dark:bg-ink-950/70",
    },
    tip: {
      tag: "PRO_TIP",
      bar: "bg-amber-500 dark:bg-dusk-amber",
      tagBadge: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-dusk-amber/15 dark:text-dusk-amber dark:border-dusk-amber/30",
      icon: Lightbulb,
      iconColor: "text-amber-600 dark:text-dusk-amber",
      card: "border-stone-200/90 bg-white/95 dark:border-white/10 dark:bg-ink-950/70",
    },
    warning: {
      tag: "CAUTION",
      bar: "bg-rose-500 dark:bg-rose-400",
      tagBadge: "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30",
      icon: AlertTriangle,
      iconColor: "text-rose-600 dark:text-rose-400",
      card: "border-stone-200/90 bg-white/95 dark:border-white/10 dark:bg-ink-950/70",
    },
    security: {
      tag: "SECURITY",
      bar: "bg-emerald-600 dark:bg-emerald-400",
      tagBadge: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
      icon: ShieldCheck,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      card: "border-stone-200/90 bg-white/95 dark:border-white/10 dark:bg-ink-950/70",
    },
    architecture: {
      tag: "ARCH_SPEC",
      bar: "bg-indigo-600 dark:bg-dusk-lavender",
      tagBadge: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-dusk-lavender/15 dark:text-dusk-lavender dark:border-dusk-lavender/30",
      icon: Layers,
      iconColor: "text-indigo-600 dark:text-dusk-lavender",
      card: "border-stone-200/90 bg-white/95 dark:border-white/10 dark:bg-ink-950/70",
    },
  }[type];

  const Icon = config.icon;

  return (
    <div
      className={cn(
        "relative my-4 flex gap-3.5 rounded-xl border p-4 text-xs sm:text-sm shadow-xs transition-all",
        config.card,
        className
      )}
    >
      <div className={cn("w-1 shrink-0 rounded-full", config.bar)} />
      <div className="flex-1 space-y-1.5 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border tracking-wider uppercase",
              config.tagBadge
            )}
          >
            {config.tag}
          </span>
          <Icon className={cn("h-4 w-4 shrink-0", config.iconColor)} />
          {title && (
            <p className="font-bold text-stone-900 dark:text-stone-100">
              {title}
            </p>
          )}
        </div>
        <div className="leading-relaxed text-stone-600 dark:text-stone-300">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── Formal Technical Heading with Track Tag & Anchor Link ── */

export function DocsHeading({
  id,
  title,
  subtitle,
  icon: Icon,
  badgeClass,
  isEn,
  trackNumber,
}: {
  id: string;
  title: string;
  subtitle?: string;
  icon?: typeof Compass;
  badgeClass?: string;
  isEn: boolean;
  trackNumber?: string;
}) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyAnchor = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}${window.location.pathname}#${id}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        message: isEn ? `Copied link to section: ${title}` : `คัดลอกลิงก์ส่วน: ${title}`,
        type: "success",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div id={id} className="group/heading scroll-m-28 flex items-center justify-between gap-3 pt-3">
      <div className="flex items-center gap-2.5">
        {trackNumber && (
          <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-dusk-lavender px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-200/80 dark:bg-dusk-lavender/10 dark:border-dusk-lavender/25">
            {trackNumber}
          </span>
        )}
        {Icon && !trackNumber && (
          <div className={cn("grid h-7 w-7 place-items-center rounded-lg border", badgeClass)}>
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <span>{title}</span>
            <button
              type="button"
              onClick={copyAnchor}
              className="opacity-0 group-hover/heading:opacity-100 transition-opacity p-1 text-stone-400 hover:text-indigo-600 dark:hover:text-dusk-lavender rounded cursor-pointer"
              title={isEn ? "Copy anchor link" : "คัดลอกลิงก์ส่วนนี้"}
              aria-label={isEn ? "Copy anchor link" : "คัดลอกลิงก์ส่วนนี้"}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <LinkIcon className="h-3.5 w-3.5" />}
            </button>
          </h2>
          {subtitle && (
            <p className="text-xs text-stone-500 dark:text-stone-400">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
