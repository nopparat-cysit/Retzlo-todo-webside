"use client";

import Image from "next/image";

import { retroStickerOptions } from "@/lib/stickers/retro-stickers";
import { cn } from "@/lib/utils";

const STICKER_IMAGE_VERSION = "20260621-clean";

interface RetroStickerImageProps {
  alt?: string;
  className?: string;
  size?: number;
  src: string;
}

export function RetroStickerImage({ alt = "Retro sticker", className, size = 40, src }: RetroStickerImageProps) {
  return (
    <Image
      alt={alt}
      className={cn("h-full w-full object-contain", className)}
      height={size}
      src={`${src}?v=${STICKER_IMAGE_VERSION}`}
      width={size}
    />
  );
}

interface RetroStickerPickerProps {
  className?: string;
  description?: string;
  label?: string;
  onChange: (nextValue: string[]) => void;
  value: string[];
}

export function RetroStickerPicker({
  className,
  description = "Stamp your card to reflect the mood:",
  label = "Retro Stickers",
  onChange,
  value
}: RetroStickerPickerProps) {
  const selected = new Set(value);

  function toggleSticker(src: string) {
    onChange(selected.has(src) ? value.filter((item) => item !== src) : [...value, src]);
  }

  return (
    <section className={cn("rounded-md border border-white/10 bg-white/[0.035] p-3", className)}>
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-stone-200">
        <span className="text-xs font-bold uppercase tracking-wider text-dusk-lavender">{label}</span>
        <span className="rounded-full border border-white/10 bg-ink-950/35 px-2 py-0.5 text-[10px] font-semibold text-stone-400">
          {retroStickerOptions.length}
        </span>
      </div>
      {description ? <p className="mb-2.5 text-xs text-stone-500">{description}</p> : null}

      <div className="grid max-h-60 grid-cols-5 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-6">
        {retroStickerOptions.map((sticker) => {
          const active = selected.has(sticker.src);

          return (
            <button
              key={sticker.id}
              aria-pressed={active}
              className={cn(
                "inline-grid h-12 w-12 place-items-center overflow-visible rounded-lg border bg-ink-950/30 p-1.5 transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dusk-lavender/55",
                active
                  ? "border-dusk-lavender bg-dusk-lavender/15 ring-2 ring-dusk-lavender/25"
                  : "border-white/5 hover:border-white/10 hover:bg-white/[0.06]"
              )}
              onClick={() => toggleSticker(sticker.src)}
              title={sticker.label}
              type="button"
            >
              <RetroStickerImage alt={sticker.label} size={44} src={sticker.src} />
            </button>
          );
        })}
      </div>
    </section>
  );
}
