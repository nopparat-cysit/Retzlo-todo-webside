"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  Palette,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2
} from "lucide-react";

import {
  DEFAULT_PRIORITIES,
  MAX_BOARD_PRIORITIES,
  MIN_BOARD_PRIORITIES,
  PRIORITY_COLOR_OPTIONS,
  type PriorityColorConfig,
  getPriorityColorConfig
} from "@/lib/kanban/priority";
import type { CustomPriority } from "@/types/kanban";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface BoardPrioritiesTabProps {
  priorities: CustomPriority[];
  onChange: (priorities: CustomPriority[]) => void;
  canManage?: boolean;
}

export function BoardPrioritiesTab({
  priorities,
  onChange,
  canManage = true
}: BoardPrioritiesTabProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const isAtMax = priorities.length >= MAX_BOARD_PRIORITIES;
  const isAtMin = priorities.length <= MIN_BOARD_PRIORITIES;

  const handleAddPriority = () => {
    if (isAtMax || !canManage) return;

    const availableColors = Object.keys(PRIORITY_COLOR_OPTIONS);
    const usedColors = new Set(priorities.map((p) => p.color));
    const nextColor =
      availableColors.find((c) => !usedColors.has(c)) ||
      availableColors[priorities.length % availableColors.length];

    const nextLevel = priorities.length + 1;
    const newPriority: CustomPriority = {
      id: `priority_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      label: `Priority ${nextLevel}`,
      color: nextColor,
      level: nextLevel
    };

    const nextList = [...priorities, newPriority].map((p, idx) => ({
      ...p,
      level: idx + 1
    }));

    onChange(nextList);
    setEditingId(newPriority.id);
  };

  const handleUpdateLabel = (id: string, label: string) => {
    const nextList = priorities.map((p) =>
      p.id === id ? { ...p, label: label.slice(0, 30) } : p
    );
    onChange(nextList);
  };

  const handleUpdateColor = (id: string, color: string) => {
    const nextList = priorities.map((p) => (p.id === id ? { ...p, color } : p));
    onChange(nextList);
  };

  const handleDeletePriority = (id: string) => {
    if (isAtMin || !canManage) return;

    const filtered = priorities.filter((p) => p.id !== id);
    const reindexed = filtered.map((p, idx) => ({
      ...p,
      level: idx + 1
    }));
    onChange(reindexed);
    if (editingId === id) setEditingId(null);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0 || !canManage) return;
    const next = [...priorities];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;

    const reindexed = next.map((p, idx) => ({
      ...p,
      level: idx + 1
    }));
    onChange(reindexed);
  };

  const handleMoveDown = (index: number) => {
    if (index >= priorities.length - 1 || !canManage) return;
    const next = [...priorities];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;

    const reindexed = next.map((p, idx) => ({
      ...p,
      level: idx + 1
    }));
    onChange(reindexed);
  };

  const handleResetToDefault = () => {
    if (!canManage) return;
    onChange(DEFAULT_PRIORITIES);
    setEditingId(null);
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Top Banner & Limits Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-stone-200/80 bg-stone-50/60 p-3 dark:border-white/10 dark:bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg border border-dusk-lavender/30 bg-dusk-lavender/10 text-dusk-lavender">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
              Custom Priority Levels (ระดับความสำคัญ)
            </h4>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              ปรับแต่งชื่อ ลำดับ และสีประจำระดับความสำคัญในบอร์ดนี้ได้สูงสุด 10 ระดับ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold border",
              isAtMax
                ? "border-amber-400/40 bg-amber-500/15 text-amber-700 dark:text-amber-300"
                : "border-indigo-400/30 bg-indigo-500/10 text-indigo-700 dark:text-dusk-lavender"
            )}
          >
            {priorities.length} / {MAX_BOARD_PRIORITIES} ระดับ
          </span>
          <button
            type="button"
            onClick={handleResetToDefault}
            disabled={!canManage}
            title="รีเซ็ตกลับเป็นค่าเริ่มต้น (High, Medium, Low)"
            className="flex items-center gap-1 rounded-lg border border-stone-200/80 bg-white px-2 py-1 text-[11px] font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300 dark:hover:bg-white/[0.08] cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden sm:inline">รีเซ็ต</span>
          </button>
        </div>
      </div>

      {/* Priority Levels List */}
      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
        {priorities.map((priority, index) => {
          const colorConfig = getPriorityColorConfig(priority.color);
          const isHighest = index === 0;
          const isLowest = index === priorities.length - 1;

          return (
            <div
              key={priority.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-stone-200/80 bg-white p-2.5 shadow-2xs transition-all hover:border-indigo-300/60 dark:border-white/10 dark:bg-stone-900/60 dark:hover:border-white/20"
            >
              {/* Left: Urgency Order & Name Input */}
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                {/* Level Order Indicator */}
                <div
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-lg font-mono text-[10px] font-bold border",
                    index === 0
                      ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
                      : "border-stone-200 bg-stone-100 text-stone-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-stone-300"
                  )}
                  title={`ระดับความสำคัญที่ ${index + 1} (${index === 0 ? "สูงสุด" : index === priorities.length - 1 ? "ต่ำสุด" : "ปานกลาง"})`}
                >
                  {index + 1}
                </div>

                {/* Priority Label Input */}
                <div className="flex-1 min-w-[140px]">
                  <input
                    type="text"
                    value={priority.label}
                    onChange={(e) => handleUpdateLabel(priority.id, e.target.value)}
                    disabled={!canManage}
                    placeholder="ชื่องาน/ระดับ..."
                    maxLength={30}
                    className="h-7 w-full rounded-lg border border-stone-200/80 bg-white px-2 text-xs font-semibold text-stone-900 shadow-2xs placeholder:text-stone-400 focus:border-indigo-500 focus:outline-none dark:border-white/10 dark:bg-stone-800 dark:text-stone-100 dark:focus:border-dusk-lavender"
                  />
                </div>

                {/* Live Pill Preview */}
                <div className="shrink-0 hidden xs:block">
                  <span
                    className={cn(
                      "inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-bold shadow-2xs",
                      colorConfig.pillClass
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", colorConfig.dotClass)} />
                    <span className="truncate max-w-[80px]">{priority.label || "Priority"}</span>
                  </span>
                </div>
              </div>

              {/* Right: Color Picker, Reorder, Delete */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                {/* Color Swatch Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      disabled={!canManage}
                      className="flex h-7 items-center gap-1.5 rounded-lg border border-stone-200/80 bg-stone-50/70 px-2 text-xs font-medium text-stone-700 hover:border-stone-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300 dark:hover:border-white/20 cursor-pointer"
                      title="เลือกสีระดับความสำคัญ"
                    >
                      <span className={cn("h-3 w-3 rounded-full shrink-0 shadow-2xs", colorConfig.swatchClass)} />
                      <span className="text-[11px] font-semibold">{colorConfig.name}</span>
                      <ChevronDown className="h-3 w-3 opacity-60" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 z-[1300]">
                    <div className="mb-2 px-1 text-[11px] font-bold text-stone-500 dark:text-stone-400">
                      เลือกสีระดับความสำคัญ:
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {Object.values(PRIORITY_COLOR_OPTIONS).map((option) => (
                        <DropdownMenuItem
                          key={option.id}
                          onClick={() => handleUpdateColor(priority.id, option.id)}
                          className={cn(
                            "flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-xs font-medium",
                            priority.color === option.id && "bg-indigo-50 font-bold text-indigo-700 dark:bg-white/10 dark:text-dusk-lavender"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className={cn("h-3 w-3 rounded-full shrink-0 shadow-2xs", option.swatchClass)} />
                            <span>{option.name}</span>
                          </div>
                          {priority.color === option.id && <Check className="h-3.5 w-3.5" />}
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Move Up */}
                <button
                  type="button"
                  onClick={() => handleMoveUp(index)}
                  disabled={isHighest || !canManage}
                  className="grid h-7 w-7 place-items-center rounded-lg border border-stone-200/80 bg-white text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 disabled:opacity-30 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-400 dark:hover:bg-white/[0.08] cursor-pointer"
                  title="เลื่อนขึ้น (เพิ่มระดับความสำคัญ)"
                  aria-label="Move priority up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>

                {/* Move Down */}
                <button
                  type="button"
                  onClick={() => handleMoveDown(index)}
                  disabled={isLowest || !canManage}
                  className="grid h-7 w-7 place-items-center rounded-lg border border-stone-200/80 bg-white text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 disabled:opacity-30 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-400 dark:hover:bg-white/[0.08] cursor-pointer"
                  title="เลื่อนลง (ลดระดับความสำคัญ)"
                  aria-label="Move priority down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>

                {/* Delete Level */}
                <button
                  type="button"
                  onClick={() => handleDeletePriority(priority.id)}
                  disabled={isAtMin || !canManage}
                  className="grid h-7 w-7 place-items-center rounded-lg border border-red-200/80 bg-white text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-30 dark:border-red-500/20 dark:bg-white/[0.04] dark:text-red-400 dark:hover:bg-red-500/15 cursor-pointer"
                  title={isAtMin ? "ต้องมีอย่างน้อย 1 ระดับ" : "ลบระดับความสำคัญนี้"}
                  aria-label="Delete priority"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Priority Button */}
      <div className="pt-1">
        <button
          type="button"
          onClick={handleAddPriority}
          disabled={isAtMax || !canManage}
          className={cn(
            "flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed py-2 text-xs font-bold transition-all cursor-pointer",
            isAtMax
              ? "border-stone-300 text-stone-400 opacity-50 cursor-not-allowed dark:border-white/10"
              : "border-indigo-400/50 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100/60 dark:border-dusk-lavender/40 dark:bg-dusk-lavender/10 dark:text-dusk-lavender dark:hover:bg-dusk-lavender/20"
          )}
        >
          <Plus className="h-4 w-4" />
          <span>
            {isAtMax
              ? `สร้างครบโควตา ${MAX_BOARD_PRIORITIES} ระดับแล้ว`
              : `+ เพิ่มระดับความสำคัญใหม่ (${priorities.length}/${MAX_BOARD_PRIORITIES})`}
          </span>
        </button>
      </div>

      {/* Live Preview Section */}
      <div className="rounded-xl border border-stone-200/80 bg-stone-50/60 p-3 dark:border-white/10 dark:bg-white/[0.02]">
        <div className="text-[11px] font-bold text-stone-600 dark:text-stone-300 mb-2 flex items-center gap-1.5">
          <Palette className="h-3.5 w-3.5 text-dusk-amber" />
          <span>ตัวอย่างการแสดงผลบนบอร์ดและตาราง Spreadsheet:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {priorities.map((p, idx) => {
            const config = getPriorityColorConfig(p.color);
            return (
              <div
                key={p.id}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold shadow-2xs",
                  config.pillClass
                )}
              >
                <span className="font-mono text-[9px] opacity-70">#{idx + 1}</span>
                <span>{p.label || "Priority"}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
