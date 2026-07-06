"use client";

import { LucideIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";

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
  const visual = stickerSrc ? (
    <Image
      alt=""
      aria-hidden="true"
      className="mx-auto h-16 w-16 cursor-default object-contain drop-shadow-[0_10px_14px_rgba(8,8,23,0.3)] transition-transform duration-300 hover:scale-105 hover:rotate-3"
      height={80}
      src={stickerSrc}
      width={80}
    />
  ) : undefined;

  const icon = Icon ? <Icon className="h-5 w-5" /> : undefined;
  const action = actionLabel && onAction ? (
    <Button type="button" onClick={onAction}>
      {actionLabel}
    </Button>
  ) : null;

  return (
    <EmptyState
      className="lofi-panel select-none border-dashed border-white/10 bg-white/[0.015] px-6 py-12"
      icon={icon}
      visual={visual}
      title={title}
      message={description}
      action={action}
    />
  );
}

