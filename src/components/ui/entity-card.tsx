import type { ReactNode } from "react";

import { getCardTone } from "@/lib/theme/ui-variants";
import { cn } from "@/lib/utils";

export interface EntityCardProps {
  tone?: string | null;
  title: ReactNode;
  description?: ReactNode;
  media?: ReactNode;
  badges?: ReactNode;
  progress?: ReactNode;
  meta?: ReactNode;
  footer?: ReactNode;
  actions?: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
}

export function EntityCard({
  tone,
  title,
  description,
  media,
  badges,
  progress,
  meta,
  footer,
  actions,
  selected,
  onClick,
  className,
  children
}: EntityCardProps) {
  const toneClasses = getCardTone(tone);
  const content = (
    <>
      {media ? <div className="-mx-1 -mt-1 mb-3 overflow-hidden rounded-lg">{media}</div> : null}
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          {badges ? <div className="mb-2 flex flex-wrap items-center gap-1.5">{badges}</div> : null}
          <h3 className={cn("truncate text-sm font-semibold", toneClasses.text)}>{title}</h3>
          {description ? <div className={cn("mt-1 text-sm leading-6", toneClasses.muted)}>{description}</div> : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {children}
      {progress ? <div className="mt-3">{progress}</div> : null}
      {meta ? <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-stone-500">{meta}</div> : null}
      {footer ? <div className="mt-4 border-t border-white/10 pt-3">{footer}</div> : null}
    </>
  );

  const cardClassName = cn(
    "motion-interactive group relative w-full overflow-hidden rounded-xl border p-4 text-left",
    toneClasses.surface,
    toneClasses.border,
    toneClasses.hover,
    selected && "ring-2 ring-dusk-lavender/45 ring-offset-2 ring-offset-ink-950",
    className
  );

  if (onClick) {
    return (
      <button type="button" className={cardClassName} onClick={onClick}>
        {content}
      </button>
    );
  }

  return <article className={cardClassName}>{content}</article>;
}
