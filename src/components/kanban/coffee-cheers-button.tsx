"use client";

import { useEffect, useState, useTransition } from "react";
import { Coffee } from "lucide-react";
import {
  canUserCheerCard,
  extractCardCoffeeCheers,
  type CheerDenialReason
} from "@/lib/kanban/coffee-cheers";
import { playCoffeePopSound } from "@/lib/sound";
import { useToast } from "@/components/ui/toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface CoffeeCheersButtonProps {
  cardId: string;
  cardTitle: string;
  cardStatus: string;
  privateCoins: unknown;
  currentUserId?: string | null;
  compact?: boolean;
  onCheerSuccess?: (updatedCheers: unknown) => void;
}

export function CoffeeCheersButton({
  cardId,
  cardTitle,
  cardStatus,
  privateCoins,
  currentUserId,
  compact = false,
  onCheerSuccess
}: CoffeeCheersButtonProps) {
  const { toast } = useToast();
  const [, startTransition] = useTransition();

  const { count: initialCount } = extractCardCoffeeCheers(privateCoins);
  const initialCheck = canUserCheerCard({
    cardStatus,
    privateCoins,
    currentUserId
  });

  const [count, setCount] = useState<number>(initialCount);
  const [hasCheered, setHasCheered] = useState<boolean>(
    initialCheck.reason === "ALREADY_CHEERED"
  );
  const [steamActive, setSteamActive] = useState<boolean>(false);
  const [isCheering, setIsCheering] = useState<boolean>(false);

  // Synchronize state if props update from Pusher or board state
  useEffect(() => {
    const freshData = extractCardCoffeeCheers(privateCoins);
    const freshCheck = canUserCheerCard({
      cardStatus,
      privateCoins,
      currentUserId
    });
    setCount(freshData.count);
    setHasCheered(freshCheck.reason === "ALREADY_CHEERED");
  }, [privateCoins, cardStatus, currentUserId]);

  // Requirement: exclusively rendered on DONE status cards
  if (cardStatus !== "DONE") {
    return null;
  }

  const check = canUserCheerCard({
    cardStatus,
    privateCoins,
    currentUserId
  });

  const isSelf = check.reason === "SELF_CHEER_FORBIDDEN";
  const canCheer = check.canCheer && !hasCheered && !isSelf;

  const getTooltipText = (reason?: CheerDenialReason): string => {
    if (isSelf) {
      return "🎉 คุณปิดงานนี้สำเร็จ! เพื่อนร่วมทีมสามารถเลี้ยงกาแฟให้กำลังใจคุณได้ (Anti-Cheat: ไม่สามารถเลี้ยงตัวเองได้)";
    }
    if (hasCheered || reason === "ALREADY_CHEERED") {
      return "☕ คุณได้เลี้ยงกาแฟให้งานนี้แล้ว ขอบคุณที่ร่วมส่งกำลังใจให้เพื่อน!";
    }
    if (canCheer) {
      return `☕ เลี้ยงกาแฟเพื่อนร่วมทีมเพื่อฉลองการปิดงาน "${cardTitle}" (คลิกเพื่อให้กำลังใจ)`;
    }
    return "เลี้ยงกาแฟเมื่อปิดงานสำเร็จ ☕";
  };

  const handleCheer = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!canCheer || isCheering) return;

    // 1. Procedural sound & steam animation
    playCoffeePopSound();
    setSteamActive(true);
    setTimeout(() => setSteamActive(false), 1200);

    // 2. Optimistic UI update
    setCount((prev) => prev + 1);
    setHasCheered(true);
    setIsCheering(true);

    try {
      const res = await fetch(`/api/cards/${cardId}/coffee`, {
        method: "POST"
      });
      const data = await res.json();

      if (!res.ok) {
        // Rollback on failure
        setCount((prev) => Math.max(0, prev - 1));
        setHasCheered(false);
        toast({
          message: data.error || "ไม่สามารถเลี้ยงกาแฟได้ กรุณาลองใหม่อีกครั้ง",
          type: "error"
        });
      } else {
        toast({
          message: `☕ เลี้ยงกาแฟสำเร็จ! ส่งกำลังใจให้เพื่อนสำหรับการปิดงาน "${cardTitle}" แล้ว 🎉`,
          type: "success"
        });
        startTransition(() => {
          onCheerSuccess?.(data.cheers);
        });
      }
    } catch {
      setCount((prev) => Math.max(0, prev - 1));
      setHasCheered(false);
      toast({
        message: "เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง",
        type: "error"
      });
    } finally {
      setIsCheering(false);
    }
  };

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="relative inline-flex items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <style jsx>{`
              @keyframes coffeeSteamUp {
                0% {
                  opacity: 0;
                  transform: translateY(0px) scale(0.6) rotate(0deg);
                }
                35% {
                  opacity: 0.95;
                }
                100% {
                  opacity: 0;
                  transform: translateY(-24px) scale(1.25) rotate(12deg);
                }
              }
              .animate-coffee-steam {
                animation: coffeeSteamUp 1.1s cubic-bezier(0.2, 0.8, 0.3, 1) forwards;
              }
            `}</style>

            {/* Micro-interaction: Steam Particles (~ ♨ ~) */}
            {steamActive && (
              <div
                className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-1 select-none z-30"
                aria-hidden="true"
              >
                <span className="text-[12px] font-bold text-amber-500 animate-coffee-steam delay-75">
                  ~
                </span>
                <span className="text-[14px] font-bold text-amber-600 animate-coffee-steam">
                  ♨
                </span>
                <span className="text-[12px] font-bold text-amber-500 animate-coffee-steam delay-150">
                  ~
                </span>
              </div>
            )}

            <button
              type="button"
              disabled={!canCheer || isCheering}
              onClick={handleCheer}
              aria-label={getTooltipText(check.reason)}
              className={cn(
                "group relative inline-flex items-center select-none font-medium transition-all duration-200 outline-none",
                compact
                  ? "gap-1 rounded-md px-1.5 py-0.5 text-[10px]"
                  : "gap-1.5 rounded-full px-2 py-0.5 text-xs",
                // Can cheer (active interactive button)
                canCheer &&
                  "cursor-pointer border border-amber-300 bg-amber-50 text-amber-900 shadow-xs hover:border-amber-400 hover:bg-amber-100 hover:scale-105 active:scale-95 dark:border-amber-700/60 dark:bg-amber-950/50 dark:text-amber-200 dark:hover:bg-amber-900/60",
                // Already cheered by current user
                hasCheered &&
                  "cursor-default border border-amber-500/40 bg-amber-500/15 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/20 dark:text-amber-300 shadow-xs font-semibold",
                // Self-task (assignee cannot self-farm)
                isSelf &&
                  "cursor-default border border-amber-400/30 bg-amber-50/70 text-amber-800/80 dark:border-amber-600/25 dark:bg-amber-950/30 dark:text-amber-300/80 opacity-90",
                // Other non-cheerable state
                !canCheer && !isSelf && !hasCheered &&
                  "cursor-default border border-stone-200 bg-stone-100 text-stone-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-400"
              )}
            >
              <span
                className={cn(
                  "inline-block transition-transform duration-200",
                  canCheer && "group-hover:rotate-12 group-hover:scale-110",
                  steamActive && "scale-125 rotate-6 text-amber-600"
                )}
              >
                ☕
              </span>

              {count > 0 ? (
                <span
                  className={cn(
                    "font-bold font-mono",
                    compact ? "text-[10px]" : "text-xs",
                    hasCheered
                      ? "text-amber-700 dark:text-amber-300"
                      : "text-amber-900 dark:text-amber-200"
                  )}
                >
                  {count}
                </span>
              ) : !compact && canCheer ? (
                <span className="text-[11px] font-medium text-amber-800 dark:text-amber-300">
                  เลี้ยงกาแฟ
                </span>
              ) : null}
            </button>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          className="max-w-[240px] text-center border-amber-200 bg-amber-50/95 text-[11px] font-medium text-amber-950 shadow-md dark:border-amber-700/50 dark:bg-ink-950/98 dark:text-amber-200"
        >
          <div className="flex items-center gap-1.5 justify-center">
            <Coffee className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <span className="leading-snug">{getTooltipText(check.reason)}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
