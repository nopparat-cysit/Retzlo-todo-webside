"use client";

import { Bot, Sparkles } from "lucide-react";

import { useAiChat } from "@/components/ai/ai-chat-context";
import { cn } from "@/lib/utils";

interface AiChatTriggerProps {
  className?: string;
}

export function AiChatTrigger({ className }: AiChatTriggerProps) {
  const { isOpen, toggleAiChat } = useAiChat();

  return (
    <button
      type="button"
      onClick={toggleAiChat}
      className={cn(
        "relative grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-dusk-lavender/50 cursor-pointer",
        isOpen
          ? "border-dusk-lavender/50 bg-dusk-lavender/15 text-dusk-lavender shadow-[0_0_12px_rgba(168,143,212,0.25)]"
          : "border-white/10 bg-white/[0.045] text-stone-400 hover:border-dusk-lavender/45 hover:text-dusk-lavender hover:bg-white/[0.07]",
        className
      )}
      aria-label="เปิดแชทผู้ช่วย AI"
      title="เปิดแชทผู้ช่วย AI (DeepSeek)"
    >
      <Bot className="h-4 w-4" />
      <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 ring-1 ring-ink-950" />
      </span>
    </button>
  );
}
