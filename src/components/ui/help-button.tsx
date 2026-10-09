"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Bot,
  Compass,
  ExternalLink,
  HelpCircle,
  Info,
  Mail,
  Shield,
  Sparkles,
  X,
  Zap,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppModal } from "@/components/ui/app-modal";
import { useAiChat } from "@/components/ai/ai-chat-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

interface HelpButtonProps {
  className?: string;
  href?: string;
}

export function HelpButton({ className }: HelpButtonProps) {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const { openAiChat } = useAiChat();
  const { isEn } = useLanguage();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "relative grid h-8 w-8 shrink-0 place-items-center rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 dark:text-stone-400 dark:hover:text-stone-100 dark:hover:bg-white/10 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-dusk-lavender/50 active:scale-95 cursor-pointer",
              className
            )}
            aria-label="System Info, Help, and Contact"
            title="Help & About Retzlo"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" sideOffset={8} className="w-64 p-1.5">
          <DropdownMenuLabel className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
            Help & System Guide
          </DropdownMenuLabel>

          {/* 1. System Guide & Documentation (/help) */}
          <DropdownMenuItem asChild>
            <Link
              href="/help"
              className="flex items-start gap-2.5 px-2.5 py-2 rounded-xl transition cursor-pointer"
            >
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-dusk-lavender/15 dark:text-dusk-lavender mt-0.5">
                <BookOpen className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                  Help & System Guide
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 leading-tight">
                  Explore features, board, AI & shortcuts
                </span>
              </div>
            </Link>
          </DropdownMenuItem>

          {/* 2. System Information (About Modal) */}
          <DropdownMenuItem
            onClick={() => setIsAboutOpen(true)}
            className="flex items-start gap-2.5 px-2.5 py-2 rounded-xl transition cursor-pointer"
          >
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-teal-50 text-teal-600 dark:bg-dusk-cyan/15 dark:text-dusk-cyan mt-0.5">
              <Info className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                System Information
              </span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 leading-tight">
                About Retzlo v2.4 & architecture
              </span>
            </div>
          </DropdownMenuItem>

          {/* 3. Contact & Support (/contact) */}
          <DropdownMenuItem asChild>
            <Link
              href="/contact"
              className="flex items-start gap-2.5 px-2.5 py-2 rounded-xl transition cursor-pointer"
            >
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-600 dark:bg-dusk-amber/15 dark:text-dusk-amber mt-0.5">
                <Mail className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                  Contact & Support
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 leading-tight">
                  Send inquiry with quick templates
                </span>
              </div>
            </Link>
          </DropdownMenuItem>

          {/* 4. Ask AI Assistant */}
          <DropdownMenuItem
            onClick={openAiChat}
            className="flex items-start gap-2.5 px-2.5 py-2 rounded-xl transition cursor-pointer"
          >
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-purple-50 text-purple-600 dark:bg-dusk-lavender/20 dark:text-dusk-lavender mt-0.5">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <span>Ask AI Assistant</span>
                <Sparkles className="h-3 w-3 text-amber-500 dark:text-dusk-amber" />
              </span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 leading-tight">
                Instant answers from built-in AI
              </span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1.5" />

          {/* Footer Links: Privacy & Terms */}
          <div className="flex items-center justify-between px-2.5 py-1 text-[11px] text-stone-500 dark:text-stone-400">
            <Link
              href="/privacy"
              className="hover:text-indigo-600 hover:underline dark:hover:text-dusk-lavender"
            >
              Privacy
            </Link>
            <span>•</span>
            <Link
              href="/terms"
              className="hover:text-indigo-600 hover:underline dark:hover:text-dusk-lavender"
            >
              Terms
            </Link>
            <span>•</span>
            <span className="font-mono text-[10px] text-stone-400">v2.4</span>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ── Website Details (About) Modal ── */}
      <AppModal
        open={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        labelledBy="website-details-title"
        contentClassName="lofi-panel w-full max-w-lg rounded-2xl p-6"
      >
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-stone-200/80 pb-3.5 dark:border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-dusk-lavender/30 dark:bg-dusk-lavender/10 dark:text-dusk-lavender shadow-sm">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2
                    id="website-details-title"
                    className="text-base font-bold text-stone-900 dark:text-stone-100"
                  >
                    Retzlo System Information
                  </h2>
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-dusk-lavender/15 dark:text-dusk-lavender">
                    v2.4 Production
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Modular Life and Work Management Platform
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAboutOpen(false)}
              className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-white/10 dark:hover:text-stone-200 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            <strong>Retzlo</strong> is a modular life and work management platform designed with retro lofi indigo aesthetics. Built for both professional project collaboration and everyday routine habit tracking.
          </p>

          {/* System Specs & Architecture */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl border border-stone-200/80 bg-stone-50/60 p-3 dark:border-white/[0.08] dark:bg-white/[0.02]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                System Architecture
              </span>
              <p className="font-semibold text-stone-800 dark:text-stone-200 mt-0.5">
                Next.js 14 App Router
              </p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                TypeScript & Tailwind CSS
              </p>
            </div>

            <div className="rounded-xl border border-stone-200/80 bg-stone-50/60 p-3 dark:border-white/[0.08] dark:bg-white/[0.02]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Built-in Intelligence
              </span>
              <p className="font-semibold text-indigo-600 dark:text-dusk-lavender mt-0.5">
                Retzlo AI Assistant
              </p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Multi-turn & Context Aware
              </p>
            </div>

            <div className="rounded-xl border border-stone-200/80 bg-stone-50/60 p-3 dark:border-white/[0.08] dark:bg-white/[0.02]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Database & Cloud
              </span>
              <p className="font-semibold text-stone-800 dark:text-stone-200 mt-0.5">
                PostgreSQL on Neon
              </p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Prisma ORM & Connection Pooling
              </p>
            </div>

            <div className="rounded-xl border border-stone-200/80 bg-stone-50/60 p-3 dark:border-white/[0.08] dark:bg-white/[0.02]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Real-time Connectivity
              </span>
              <p className="font-semibold text-stone-800 dark:text-stone-200 mt-0.5">
                Pusher WebSocket
              </p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Optimistic UI Updates
              </p>
            </div>
          </div>

          {/* Core Modules Highlights */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Core Modules
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] text-stone-700 dark:text-stone-300">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                <span>Kanban Board & Table View</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                <span>Calendar & Due Dates</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span>Notes & Habit Diary Hub</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                <span>Coffee Cheers & Rewards Store</span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-200/80 pt-3.5 dark:border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Link
                href="/help"
                onClick={() => setIsAboutOpen(false)}
                className="text-xs font-semibold text-indigo-600 hover:underline dark:text-dusk-lavender"
              >
                Open System Guide (/help)
              </Link>
              <span className="text-stone-300 dark:text-stone-600">•</span>
              <Link
                href="/contact"
                onClick={() => setIsAboutOpen(false)}
                className="text-xs font-semibold text-indigo-600 hover:underline dark:text-dusk-lavender"
              >
                Contact Support (/contact)
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setIsAboutOpen(false)}
              className="rounded-xl border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 dark:border-white/[0.08] dark:bg-white/5 dark:text-stone-300 dark:hover:bg-white/10 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </AppModal>
    </>
  );
}
