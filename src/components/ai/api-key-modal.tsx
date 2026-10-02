"use client";

import { useState, useEffect } from "react";
import { KeyRound, Sparkles, X, Check, Trash2, Eye, EyeOff, Cpu, ShieldCheck } from "lucide-react";

import { AppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  getClientAiKey,
  setClientAiKey,
  getClientAiModel,
  setClientAiModel
} from "@/lib/ai/client-key";
import { cn } from "@/lib/utils";

export interface ApiKeyModalProps {
  open: boolean;
  onClose: () => void;
  onSaved?: (savedKey: string) => void;
  reason?: string;
}

const MODEL_PRESETS = [
  {
    id: "deepseek-v4-pro",
    label: "DeepSeek-V4 Pro",
    badge: "แนะนำ",
    subtitle: "โมเดลเรือธง V4 Pro • แม่นยำสูง ฉลาดรอบด้าน แตกขั้นตอนละเอียด"
  },
  {
    id: "deepseek-flash",
    label: "DeepSeek Flash",
    badge: "ความเร็วสูง",
    subtitle: "โมเดล V4.1-Flash • ประมวลผลรวดเร็วทันใจ ประหยัดต้นทุน"
  },
  {
    id: "custom",
    label: "กำหนดโมเดลเอง (Custom)",
    badge: "ยืดหยุ่น",
    subtitle: "ระบุชื่อโมเดลตามต้องการ เช่น gpt-4o, claude-3-7-sonnet"
  }
];

export function ApiKeyModal({
  open,
  onClose,
  onSaved,
  reason
}: ApiKeyModalProps) {
  const { toast } = useToast();
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [modelMode, setModelMode] = useState<string>("deepseek-v4-pro");
  const [customModelName, setCustomModelName] = useState("");

  useEffect(() => {
    if (open) {
      setKey(getClientAiKey());
      const savedModel = getClientAiModel();
      if (!savedModel || savedModel === "deepseek-v4-pro") {
        setModelMode("deepseek-v4-pro");
      } else if (savedModel === "deepseek-flash") {
        setModelMode("deepseek-flash");
      } else if (savedModel === "deepseek-chat") {
        // Automatically migrate legacy deepseek-chat to deepseek-v4-pro
        setModelMode("deepseek-v4-pro");
      } else {
        setModelMode("custom");
        setCustomModelName(savedModel);
      }
    }
  }, [open]);

  const handleSave = () => {
    const trimmedKey = key.trim();
    if (trimmedKey) {
      setClientAiKey(trimmedKey);
    }

    const effectiveModel =
      modelMode === "custom"
        ? customModelName.trim() || "deepseek-v4-pro"
        : modelMode;

    setClientAiModel(effectiveModel);

    toast({
      message: `บันทึกการตั้งค่า AI สำเร็จ (โมเดล: ${effectiveModel}) ✨`,
      type: "success"
    });
    onSaved?.(trimmedKey);
    onClose();
  };

  const handleClear = () => {
    setClientAiKey("");
    setClientAiModel("");
    setKey("");
    setModelMode("deepseek-v4-pro");
    setCustomModelName("");
    toast({
      message: "รีเซ็ตการตั้งค่า AI กลับเป็นค่าเริ่มต้น (V4 Pro) แล้ว",
      type: "success"
    });
  };

  return (
    <AppModal open={open} onClose={onClose} contentClassName="max-w-md">
      <div className="space-y-4 p-5 sm:p-6 text-stone-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-dusk-lavender/15 text-dusk-lavender border border-dusk-lavender/30">
              <Cpu className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100 flex items-center gap-1.5">
                ตั้งค่า AI Engine & Model
                <Sparkles className="h-3.5 w-3.5 text-dusk-amber" />
              </h3>
              <p className="text-xs text-stone-400">
                เลือกโมเดล AI และจัดการ API Key สำหรับ Checklist & Summary
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-stone-400 hover:bg-white/10 hover:text-stone-200 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {reason && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
            {reason}
          </div>
        )}

        {/* Model Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-dusk-lavender" />
            <span>โมเดล AI ที่ต้องการใช้งาน (AI Model)</span>
          </label>

          <div className="space-y-2">
            {MODEL_PRESETS.map((preset) => {
              const isSelected = modelMode === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setModelMode(preset.id)}
                  className={cn(
                    "w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-0.5",
                    isSelected
                      ? "border-dusk-lavender bg-dusk-lavender/15 shadow-xs shadow-dusk-lavender/20"
                      : "border-stone-800 bg-stone-900/50 hover:border-stone-700 hover:bg-stone-900/80"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn("text-xs font-semibold", isSelected ? "text-dusk-lavender" : "text-stone-200")}>
                      {preset.label}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.2 rounded-full font-medium",
                        isSelected
                          ? "bg-dusk-lavender/30 text-dusk-lavender border border-dusk-lavender/40"
                          : "bg-stone-800 text-stone-400"
                      )}
                    >
                      {preset.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    {preset.subtitle}
                  </p>
                </button>
              );
            })}
          </div>

          {modelMode === "custom" && (
            <div className="pt-1.5">
              <Input
                value={customModelName}
                onChange={(e) => setCustomModelName(e.target.value)}
                placeholder="เช่น gpt-4o, claude-3-7-sonnet หรือ deepseek-reasoner"
                className="font-mono text-xs bg-stone-900/80 border-stone-700 placeholder:text-stone-500"
              />
            </div>
          )}
        </div>

        {/* API Key Input */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-dusk-amber" />
              <span>AI API Key (Optional)</span>
            </label>
            <span className="text-[10px] text-stone-400">เว้นว่างไว้จะใช้คีย์ของเซิร์ฟเวอร์</span>
          </div>

          <div className="relative">
            <Input
              type={showKey ? "text" : "password"}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-... (เว้นว่างไว้หากใช้คีย์ส่วนกลางของระบบ)"
              className="pr-10 font-mono text-xs bg-stone-900/80 border-stone-700"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 cursor-pointer"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Security & System Info */}
        <div className="rounded-lg bg-stone-900/50 border border-stone-800 p-3 space-y-1.5 text-[11px] text-stone-400">
          <p className="font-semibold text-stone-300 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>คำแนะนำการทำงาน:</span>
          </p>
          <p>• ค่าเริ่มต้นของระบบจะใช้โมเดล <strong className="text-dusk-lavender">DeepSeek-V4 Pro</strong> ซึ่งมีความฉลาดและคุณภาพสูงสุด</p>
          <p>• หากไม่ระบุ API Key ระบบจะใช้คีย์ส่วนกลางของเซิร์ฟเวอร์โดยอัตโนมัติ ผู้ใช้คนอื่นไม่ต้องใส่คีย์เอง</p>
        </div>

        <div className="flex items-center justify-between pt-2">
          {key || modelMode !== "deepseek-v4-pro" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="border-theme-danger-border text-theme-danger hover:bg-theme-danger-surface hover:text-theme-danger text-xs"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              รีเซ็ตค่าเริ่มต้น
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-stone-400 hover:text-stone-200 text-xs"
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              className="bg-dusk-lavender hover:bg-dusk-lavender/90 text-stone-950 font-semibold text-xs shadow-xs cursor-pointer"
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              บันทึกและใช้งาน
            </Button>
          </div>
        </div>
      </div>
    </AppModal>
  );
}
