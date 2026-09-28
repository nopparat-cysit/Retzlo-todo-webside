"use client";

import { useState, useEffect } from "react";
import { KeyRound, Sparkles, X, Check, Trash2, Eye, EyeOff } from "lucide-react";

import { AppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { getClientDeepSeekKey, setClientDeepSeekKey } from "@/lib/ai/client-key";

export interface ApiKeyModalProps {
  open: boolean;
  onClose: () => void;
  onSaved?: (savedKey: string) => void;
  reason?: string;
}

export function ApiKeyModal({
  open,
  onClose,
  onSaved,
  reason
}: ApiKeyModalProps) {
  const { toast } = useToast();
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (open) {
      setKey(getClientDeepSeekKey());
    }
  }, [open]);

  const handleSave = () => {
    const trimmed = key.trim();
    if (!trimmed) {
      toast({
        message: "กรุณาระบุ DeepSeek API Key (ขึ้นต้นด้วย sk-)",
        type: "error"
      });
      return;
    }

    if (!trimmed.startsWith("sk-")) {
      toast({
        message: "DeepSeek API Key มักจะขึ้นต้นด้วย sk- กรุณาตรวจสอบความถูกต้อง",
        type: "error"
      });
    }

    setClientDeepSeekKey(trimmed);
    toast({
      message: "บันทึก DeepSeek API Key ในเบราว์เซอร์สำเร็จ ✨",
      type: "success"
    });
    onSaved?.(trimmed);
    onClose();
  };

  const handleClear = () => {
    setClientDeepSeekKey("");
    setKey("");
    toast({
      message: "ลบ DeepSeek API Key ออกจากเบราว์เซอร์แล้ว",
      type: "success"
    });
  };

  return (
    <AppModal open={open} onClose={onClose} contentClassName="max-w-md">
      <div className="space-y-4 p-5 sm:p-6 text-stone-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-dusk-lavender/15 text-dusk-lavender border border-dusk-lavender/30">
              <KeyRound className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100 flex items-center gap-1.5">
                ตั้งค่า DeepSeek API Key
                <Sparkles className="h-3.5 w-3.5 text-dusk-amber" />
              </h3>
              <p className="text-xs text-stone-400">
                สำหรับฟีเจอร์ AI Auto-Breakdown และ AI Summary
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-stone-400 hover:bg-white/10 hover:text-stone-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {reason && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
            {reason}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-semibold text-stone-300">
            DeepSeek API Key (sk-...)
          </label>
          <div className="relative">
            <Input
              type={showKey ? "text" : "password"}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-..."
              className="pr-10 font-mono text-xs bg-stone-900/80 border-stone-700"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="rounded-lg bg-stone-900/50 border border-stone-800 p-3 space-y-1.5 text-[11px] text-stone-400">
          <p className="font-semibold text-stone-300">🔒 ปลอดภัยและเป็นส่วนตัว:</p>
          <p>• คีย์จะถูกจัดเก็บในเครื่องของคุณ (Local Storage) เท่านั้น และถูกส่งตรงไปยัง DeepSeek API ผ่าน Secure Proxy</p>
          <p>• หากตั้งค่า <code className="text-dusk-amber font-mono">DEEPSEEK_API_KEY</code> ใน Vercel Dashboard แล้ว ระบบจะใช้คีย์ของเซิร์ฟเวอร์โดยอัตโนมัติ</p>
        </div>

        <div className="flex items-center justify-between pt-2">
          {key ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="text-red-400 hover:text-red-300 border-red-500/30 hover:bg-red-500/10 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              ลบคีย์ที่บันทึก
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
              className="bg-dusk-lavender hover:bg-dusk-lavender/90 text-stone-950 font-semibold text-xs shadow-xs"
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
