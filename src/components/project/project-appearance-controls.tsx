"use client";

import { RetroStickerImage } from "@/components/stickers/retro-sticker-picker";
import { ColorSwatchPicker } from "@/components/ui/color-swatch-picker";
import { sharedIconOptions } from "@/lib/stickers/shared-icon-options";
import type { CardColor } from "@/lib/theme/card-colors";
import { cn } from "@/lib/utils";

export function ProjectAppearanceControls({
  color,
  onColorChange,
  onStickerChange,
  sticker
}: {
  color: CardColor;
  sticker: string;
  onColorChange: (color: CardColor) => void;
  onStickerChange: (sticker: string) => void;
}) {
  return (
    <div className="grid gap-4">
      <section className="rounded-xl border border-stone-200/80 bg-stone-50/50 p-3.5 dark:border-white/10 dark:bg-white/[0.035]">
        <ColorSwatchPicker
          label="Project color"
          value={color}
          onChange={onColorChange}
        />
      </section>

      <section className="rounded-xl border border-stone-200/80 bg-stone-50/50 p-3.5 dark:border-white/10 dark:bg-white/[0.035]">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
            Project sticker
          </span>
          <span className="rounded-full border border-stone-200/80 bg-stone-100/80 px-2.5 py-0.5 text-[11px] font-semibold text-stone-600 dark:border-white/10 dark:bg-ink-950/35 dark:text-stone-400">
            {sharedIconOptions.length}
          </span>
        </div>
        <div className="grid max-h-56 grid-cols-5 gap-2 overflow-y-auto pr-1">
          {sharedIconOptions.map((option) => {
            const active = sticker === option.src;

            return (
              <button
                key={option.id}
                aria-label={`Use ${option.label} project sticker`}
                aria-pressed={active}
                className={cn(
                  "grid h-12 w-12 place-items-center justify-self-center rounded-xl border bg-stone-100/60 p-1.5 transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dusk-lavender/55 dark:bg-ink-950/30",
                  active
                    ? "border-dusk-amber bg-dusk-amber/12 ring-2 ring-dusk-amber/20"
                    : "border-stone-200/80 hover:border-stone-300 hover:bg-stone-200/40 dark:border-white/5 dark:hover:border-white/10 dark:hover:bg-white/[0.06]"
                )}
                title={option.label}
                type="button"
                onClick={() => onStickerChange(option.src)}
              >
                <RetroStickerImage alt={option.label} size={44} src={option.src} />
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
