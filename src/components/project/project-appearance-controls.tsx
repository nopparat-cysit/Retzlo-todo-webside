"use client";

import { RetroStickerImage } from "@/components/stickers/retro-sticker-picker";
import { sharedIconOptions } from "@/lib/stickers/shared-icon-options";
import { cardColorOptions, type CardColor } from "@/lib/theme/card-colors";
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
      <section className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Project color</span>
          <span className="text-[10px] uppercase tracking-[0.16em] text-stone-600">{color.toLowerCase()}</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {cardColorOptions.map((option) => (
            <button
              key={option.value}
              aria-label={`Use ${option.label} project color`}
              aria-pressed={color === option.value}
              className={cn(
                "grid h-9 place-items-center rounded-full border transition hover:scale-105",
                color === option.value ? "border-dusk-amber ring-2 ring-dusk-amber/25" : "border-white/10"
              )}
              title={option.label}
              type="button"
              onClick={() => onColorChange(option.value)}
            >
              <span className={cn("h-5 w-5 rounded-full border", option.swatchClass)} />
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Project sticker</span>
          <span className="rounded-full border border-white/10 bg-ink-950/35 px-2 py-0.5 text-[10px] font-semibold text-stone-500">
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
                  "grid h-12 w-12 place-items-center rounded-lg border bg-ink-950/30 p-1.5 transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dusk-lavender/55",
                  active
                    ? "border-dusk-amber bg-dusk-amber/12 ring-2 ring-dusk-amber/20"
                    : "border-white/5 hover:border-white/10 hover:bg-white/[0.06]"
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
