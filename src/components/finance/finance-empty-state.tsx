"use client";

import { LucideIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface FinanceEmptyStateProps {
  icon?: LucideIcon;
  stickerSrc?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function FinanceEmptyState({
  icon: Icon,
  stickerSrc,
  title,
  description,
  actionLabel,
  onAction
}: FinanceEmptyStateProps) {
  return (
    <div className="lofi-panel flex flex-col items-center justify-center rounded-2xl border-dashed border-white/10 bg-white/[0.015] py-12 px-6 text-center select-none">
      {stickerSrc ? (
        <Image
          alt=""
          aria-hidden="true"
          className="mx-auto h-16 w-16 object-contain drop-shadow-[0_10px_14px_rgba(8,8,23,0.3)] transition-transform duration-300 hover:scale-105 hover:rotate-3 cursor-default"
          height={80}
          src={stickerSrc}
          width={80}
        />
      ) : Icon ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-dusk-lavender/25 bg-dusk-lavender/10 text-dusk-lavender shadow-[0_0_15px_rgba(169,162,255,0.08)]">
          <Icon className="h-6 w-6" />
        </div>
      ) : null}
      
      <h3 className="mt-4 text-base font-semibold text-stone-200">{title}</h3>
      <p className="mt-1.5 max-w-sm text-xs leading-normal text-stone-500">{description}</p>
      
      {actionLabel && onAction && (
        <Button
          type="button"
          onClick={onAction}
          className="mt-5 active:scale-[0.98] transition-transform"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

