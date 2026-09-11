"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  Coffee,
  Heart,
  Laptop,
  Moon,
  RotateCcw,
  Shuffle,
  Smile,
  Sparkles,
  User,
  X,
} from "lucide-react";

import { AppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  ACCESSORIES,
  DEFAULT_AVATAR_CONFIG,
  HAIR_COLORS,
  HAIRSTYLES,
  OUTFIT_COLORS,
  OUTFITS,
  PETS,
  SKIN_TONES,
  drawAvatar,
  getRandomAvatarConfig,
  type AvatarAnimation,
  type AvatarConfig,
  type AvatarDirection,
} from "@/lib/office/avatar-catalog";

interface AvatarCustomizerModalProps {
  open: boolean;
  onClose: () => void;
  initialConfig?: AvatarConfig;
  onSave?: (config: AvatarConfig) => void;
}

type CategoryTab = "hair" | "outfit" | "accessories" | "pets" | "colors";

export function AvatarCustomizerModal({
  open,
  onClose,
  initialConfig,
  onSave,
}: AvatarCustomizerModalProps) {
  const { toast } = useToast();
  const [config, setConfig] = useState<AvatarConfig>(() => initialConfig ?? DEFAULT_AVATAR_CONFIG);
  const [activeTab, setActiveTab] = useState<CategoryTab>("hair");
  const [previewAnimation, setPreviewAnimation] = useState<AvatarAnimation>("idle");
  const [previewDirection, setPreviewDirection] = useState<AvatarDirection>("down");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  // Sync initialConfig if opened with different config
  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
  }, [initialConfig, open]);

  // Live Canvas Preview Animation Loop
  useEffect(() => {
    if (!open) return;

    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      frameRef.current++;
      const frame = frameRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background preview podium
      ctx.fillStyle = "#0c0a1b";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Radial soft spotlight
      const grad = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2 + 10,
        10,
        canvas.width / 2,
        canvas.height / 2 + 10,
        110
      );
      grad.addColorStop(0, "rgba(169, 162, 255, 0.22)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Lofi podium floor circle
      ctx.fillStyle = "#1b1733";
      ctx.beginPath();
      ctx.ellipse(canvas.width / 2, canvas.height - 40, 75, 24, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#a9a2ff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Render Avatar with 3.8x scale
      drawAvatar(
        ctx,
        canvas.width / 2 - 58,
        canvas.height / 2 - 82,
        config,
        previewAnimation,
        previewDirection,
        frame,
        3.6
      );

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [open, config, previewAnimation, previewDirection]);

  function handleRandomize() {
    const random = getRandomAvatarConfig(config.name ?? "Player");
    setConfig(random);
    setPreviewAnimation("cheer");
    toast({ message: "สุ่มชุดใหม่เรียบร้อย! 🎲✨", type: "info" });
  }

  function handleReset() {
    setConfig(initialConfig ?? DEFAULT_AVATAR_CONFIG);
    toast({ message: "คืนค่าชุดตั้งต้นเรียบร้อย", type: "info" });
  }

  function handleSave() {
    try {
      window.localStorage.setItem("retrod:avatar-config", JSON.stringify(config));
    } catch {}

    if (onSave) {
      onSave(config);
    }

    toast({ message: "บันทึกตัวละครสำเร็จ พร้อมใช้งานใน Virtual Office! ✨", type: "success" });
    onClose();
  }

  return (
    <AppModal open={open} onClose={onClose} labelledBy="avatar-customizer-title" contentClassName="max-w-4xl">
      <div className="lofi-panel flex max-h-[88vh] w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#090817] text-stone-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg border border-dusk-lavender/30 bg-dusk-lavender/15 text-dusk-lavender">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h2 id="avatar-customizer-title" className="text-lg font-bold text-white">
                Avatar Closet • ตู้แต่งตัวตัวละคร
              </h2>
              <p className="text-xs text-stone-400">
                ปรับแต่งสไตล์ตัวละคร 2D Pixel Art ประจำตัวของคุณใน Office
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-stone-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid flex-1 gap-6 overflow-y-auto p-6 md:grid-cols-[280px_1fr]">
          {/* Left: Live 4x Preview Canvas */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative overflow-hidden rounded-2xl border-2 border-white/10 bg-black/60 shadow-xl">
              <canvas
                ref={canvasRef}
                width={260}
                height={280}
                className="cursor-pointer"
                style={{ imageRendering: "pixelated" }}
                onClick={() => {
                  setPreviewAnimation((prev) => (prev === "cheer" ? "idle" : "cheer"));
                }}
              />
              <div className="absolute right-2 top-2 rounded-full border border-white/10 bg-black/60 px-2 py-0.5 text-[9px] uppercase tracking-wider text-dusk-amber">
                LIVE 4X
              </div>
            </div>

            {/* Direction Selector */}
            <div className="w-full">
              <div className="mb-1.5 text-center text-[10px] uppercase tracking-widest text-stone-400">
                หมุนมุมมอง (Direction)
              </div>
              <div className="grid grid-cols-4 gap-1 rounded-lg border border-white/10 bg-black/30 p-1 text-xs">
                {(
                  [
                    { dir: "down", label: "หน้า" },
                    { dir: "up", label: "หลัง" },
                    { dir: "left", label: "ซ้าย" },
                    { dir: "right", label: "ขวา" },
                  ] as const
                ).map(({ dir, label }) => (
                  <button
                    key={dir}
                    type="button"
                    onClick={() => setPreviewDirection(dir)}
                    className={cn(
                      "rounded py-1 font-semibold transition",
                      previewDirection === dir
                        ? "bg-dusk-lavender text-ink-950 shadow"
                        : "text-stone-400 hover:text-white"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Animation Test Controls */}
            <div className="w-full">
              <div className="mb-1.5 text-center text-[10px] uppercase tracking-widest text-stone-400">
                ทดสอบท่าทาง (Animations)
              </div>
              <div className="grid grid-cols-4 gap-1 text-[11px]">
                {[
                  { id: "idle", label: "ยืนนิ่ง", icon: Smile },
                  { id: "walk", label: "เดิน", icon: User },
                  { id: "work", label: "ทำงาน", icon: Laptop },
                  { id: "coffee", label: "จิบกาแฟ", icon: Coffee },
                  { id: "wave", label: "โบกมือ", icon: Sparkles },
                  { id: "cheer", label: "ดีใจ", icon: Heart },
                  { id: "sleep", label: "งีบหลับ", icon: Moon },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPreviewAnimation(id as AvatarAnimation)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 rounded-lg border p-1.5 transition",
                      previewAnimation === id
                        ? "border-dusk-amber/60 bg-dusk-amber/15 text-dusk-amber font-semibold"
                        : "border-white/5 bg-white/[0.03] text-stone-400 hover:border-white/15 hover:text-white"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="text-[10px]">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Customization Tabs & Grids */}
          <div className="flex flex-col">
            {/* Category Navigation Tabs */}
            <div className="flex flex-wrap gap-1.5 border-b border-white/10 pb-3">
              {[
                { id: "hair", label: "💇 ทรงผม" },
                { id: "outfit", label: "👕 เสื้อผ้า" },
                { id: "accessories", label: "👓 พร็อพเสริม" },
                { id: "pets", label: "🐾 สัตว์เลี้ยง" },
                { id: "colors", label: "🎨 สีผิว & อื่นๆ" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as CategoryTab)}
                  className={cn(
                    "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition",
                    activeTab === tab.id
                      ? "border border-dusk-lavender/35 bg-dusk-lavender/15 text-dusk-lavender"
                      : "border border-transparent text-stone-400 hover:bg-white/[0.04] hover:text-white"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="flex-1 py-4">
              {/* Tab 1: Hairstyles (10 items) + Hair Colors (10 items) */}
              {activeTab === "hair" && (
                <div className="space-y-5">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs text-stone-400">
                      <span>เลือกแบบทรงผม (10 แบบ)</span>
                      <span className="font-mono text-dusk-amber">
                        {HAIRSTYLES.find((h) => h.id === config.hairstyleId)?.nameTh}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                      {HAIRSTYLES.map((hair) => (
                        <button
                          key={hair.id}
                          type="button"
                          onClick={() => setConfig({ ...config, hairstyleId: hair.id })}
                          className={cn(
                            "flex flex-col items-center gap-1 rounded-xl border p-2.5 text-center transition",
                            config.hairstyleId === hair.id
                              ? "border-dusk-lavender bg-dusk-lavender/20 text-white shadow-lg shadow-dusk-lavender/15"
                              : "border-white/10 bg-white/[0.03] text-stone-300 hover:border-white/20 hover:bg-white/[0.06]"
                          )}
                        >
                          <span className="text-xl">{hair.icon}</span>
                          <span className="text-xs font-semibold">{hair.nameTh}</span>
                          <span className="text-[9px] text-stone-500">{hair.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hair Color Palette */}
                  <div>
                    <div className="mb-2 text-xs text-stone-400">สีผม (10 สี)</div>
                    <div className="flex flex-wrap gap-2">
                      {HAIR_COLORS.map((color) => (
                        <button
                          key={color.id}
                          type="button"
                          title={color.name}
                          onClick={() => setConfig({ ...config, hairColorId: color.id })}
                          className={cn(
                            "relative h-8 w-8 rounded-full border-2 transition hover:scale-110",
                            config.hairColorId === color.id
                              ? "border-white shadow-md shadow-white/20"
                              : "border-transparent"
                          )}
                          style={{ backgroundColor: color.value }}
                        >
                          {config.hairColorId === color.id && (
                            <Check className="mx-auto h-4 w-4 text-white drop-shadow-md" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Outfits (10 items) + Outfit Colors (10 items) */}
              {activeTab === "outfit" && (
                <div className="space-y-5">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs text-stone-400">
                      <span>เลือกแบบชุดเสื้อผ้า (10 แบบ)</span>
                      <span className="font-mono text-dusk-amber">
                        {OUTFITS.find((o) => o.id === config.outfitId)?.nameTh}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                      {OUTFITS.map((outfit) => (
                        <button
                          key={outfit.id}
                          type="button"
                          onClick={() => setConfig({ ...config, outfitId: outfit.id })}
                          className={cn(
                            "flex flex-col items-center gap-1 rounded-xl border p-2.5 text-center transition",
                            config.outfitId === outfit.id
                              ? "border-dusk-lavender bg-dusk-lavender/20 text-white shadow-lg shadow-dusk-lavender/15"
                              : "border-white/10 bg-white/[0.03] text-stone-300 hover:border-white/20 hover:bg-white/[0.06]"
                          )}
                        >
                          <span className="text-xl">{outfit.icon}</span>
                          <span className="text-xs font-semibold">{outfit.nameTh}</span>
                          <span className="text-[9px] text-stone-500">{outfit.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Outfit Color Palette */}
                  <div>
                    <div className="mb-2 text-xs text-stone-400">สีชุดเสื้อผ้า (10 สี)</div>
                    <div className="flex flex-wrap gap-2">
                      {OUTFIT_COLORS.map((color) => (
                        <button
                          key={color.id}
                          type="button"
                          title={color.name}
                          onClick={() => setConfig({ ...config, outfitColorId: color.id })}
                          className={cn(
                            "relative h-8 w-8 rounded-full border-2 transition hover:scale-110",
                            config.outfitColorId === color.id
                              ? "border-white shadow-md shadow-white/20"
                              : "border-transparent"
                          )}
                          style={{ backgroundColor: color.value }}
                        >
                          {config.outfitColorId === color.id && (
                            <Check className="mx-auto h-4 w-4 text-white drop-shadow-md" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Accessories (10 items) */}
              {activeTab === "accessories" && (
                <div>
                  <div className="mb-2 flex items-center justify-between text-xs text-stone-400">
                    <span>เลือกเครื่องประดับ & พร็อพ (10 แบบ)</span>
                    <span className="font-mono text-dusk-amber">
                      {ACCESSORIES.find((a) => a.id === config.accessoryId)?.nameTh}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {ACCESSORIES.map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => setConfig({ ...config, accessoryId: acc.id })}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-xl border p-2.5 text-center transition",
                          config.accessoryId === acc.id
                            ? "border-dusk-lavender bg-dusk-lavender/20 text-white shadow-lg shadow-dusk-lavender/15"
                            : "border-white/10 bg-white/[0.03] text-stone-300 hover:border-white/20 hover:bg-white/[0.06]"
                        )}
                      >
                        <span className="text-xl">{acc.icon}</span>
                        <span className="text-xs font-semibold">{acc.nameTh}</span>
                        <span className="text-[9px] text-stone-500">{acc.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Pets (10 items) */}
              {activeTab === "pets" && (
                <div>
                  <div className="mb-2 flex items-center justify-between text-xs text-stone-400">
                    <span>เลือกสัตว์เลี้ยงคู่ใจเดินตาม (10 แบบ)</span>
                    <span className="font-mono text-dusk-amber">
                      {PETS.find((p) => p.id === config.petId)?.nameTh}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {PETS.map((pet) => (
                      <button
                        key={pet.id}
                        type="button"
                        onClick={() => setConfig({ ...config, petId: pet.id })}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-xl border p-2.5 text-center transition",
                          config.petId === pet.id
                            ? "border-dusk-lavender bg-dusk-lavender/20 text-white shadow-lg shadow-dusk-lavender/15"
                            : "border-white/10 bg-white/[0.03] text-stone-300 hover:border-white/20 hover:bg-white/[0.06]"
                        )}
                      >
                        <span className="text-xl">{pet.icon}</span>
                        <span className="text-xs font-semibold">{pet.nameTh}</span>
                        <span className="text-[9px] text-stone-500">{pet.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 5: Skin Tones (10 items) */}
              {activeTab === "colors" && (
                <div className="space-y-6">
                  <div>
                    <div className="mb-2 text-xs text-stone-400">เฉดสีผิว (10 เฉดสี)</div>
                    <div className="flex flex-wrap gap-2.5">
                      {SKIN_TONES.map((tone) => (
                        <button
                          key={tone.id}
                          type="button"
                          title={tone.name}
                          onClick={() => setConfig({ ...config, skinToneId: tone.id })}
                          className={cn(
                            "relative h-9 w-9 rounded-full border-2 transition hover:scale-110",
                            config.skinToneId === tone.id
                              ? "border-white shadow-md shadow-white/30"
                              : "border-transparent"
                          )}
                          style={{ backgroundColor: tone.value }}
                        >
                          {config.skinToneId === tone.id && (
                            <Check className="mx-auto h-4 w-4 text-stone-900 drop-shadow-md" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-stone-400">
                    💡 <b className="text-stone-200">เกร็ดน่ารู้:</b>{" "}
                    ตัวละครและสัตว์เลี้ยงจะถูกบันทึกไว้ในเบราว์เซอร์ของคุณ เมื่อคุณเปิดห้อง Virtual Floor
                    หรือเปิดเพลง Lo-Fi ตัวละครจะออกมาเดินเล่นและทำท่าทางตามที่คุณได้ปรับแต่งไว้
                  </div>
                </div>
              )}
            </div>

            {/* Footer Action Buttons */}
            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleRandomize}
                  className="gap-1.5 text-xs text-dusk-amber hover:bg-dusk-amber/10 hover:text-white"
                >
                  <Shuffle className="h-3.5 w-3.5" /> สุ่มชุด 🎲
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleReset}
                  className="gap-1.5 text-xs text-stone-400 hover:text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> คืนค่า
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" onClick={onClose}>
                  ยกเลิก
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  className="gap-2 bg-dusk-lavender text-ink-950 hover:bg-dusk-amber font-semibold"
                >
                  <Check className="h-4 w-4" /> บันทึกตัวละคร ✅
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppModal>
  );
}
