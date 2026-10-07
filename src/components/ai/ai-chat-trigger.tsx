"use client";

import { useAiChat } from "@/components/ai/ai-chat-context";
import { GeminiSparkleIcon } from "@/components/ai/gemini-sparkle-icon";
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
        "relative grid h-8 w-8 shrink-0 place-items-center rounded-full text-indigo-600 dark:text-dusk-lavender transition-all hover:bg-stone-200/60 dark:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-dusk-lavender/50 active:scale-95 cursor-pointer",
        isOpen && "bg-indigo-50 dark:bg-white/[0.08] shadow-[0_0_12px_rgba(192,132,252,0.25)]",
        className
      )}
      aria-label="เปิดแชทผู้ช่วย AI"
      title="เปิดแชทผู้ช่วย AI (Retzlo AI Assistant)"
    >
      <GeminiSparkleIcon
        className={cn(
          "h-4.5 w-4.5 transition-transform duration-200",
          isOpen ? "scale-110 drop-shadow-[0_0_8px_rgba(192,132,252,0.6)]" : "hover:scale-110"
        )}
      />
    </button>
  );
}
