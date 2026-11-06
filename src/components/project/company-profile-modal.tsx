"use client";

import { useState } from "react";
import { Building2, Copy, Check, X } from "lucide-react";
import { AppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export interface CompanyProfileModalProps {
  projectName: string;
  description: string | null;
}

export function CompanyProfileModal({
  projectName,
  description
}: CompanyProfileModalProps) {
  const [isCompanyProfileOpen, setIsCompanyProfileOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  if (!description) {
    return <p className="sidebar-expanded-only mt-1 text-xs text-stone-500">No description yet.</p>;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(description);
      setCopied(true);
      toast({ message: "คัดลอกข้อมูลบริษัทเรียบร้อย", type: "success" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ message: "ไม่สามารถคัดลอกได้", type: "error" });
    }
  };

  const renderFormattedDescription = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} className="h-2" />;
      }

      // Format markdown bold key-value pairs like **ชื่อบริษัท:** ค่า หรือ **หัวข้อ**
      const boldMatch = trimmed.match(/^\*\*(.+?)\*\*:?\s*(.*)$/);
      if (boldMatch) {
        const label = boldMatch[1].replace(/:$/, "").trim();
        return (
          <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-1 py-1 border-b border-stone-200/50 dark:border-white/[0.04] last:border-none">
            <span className="font-semibold text-dusk-amber text-xs min-w-[140px] shrink-0">{label}</span>
            <span className="text-stone-700 dark:text-stone-300 text-xs break-words">{boldMatch[2]}</span>
          </div>
        );
      }

      const colonIndex = trimmed.indexOf(":");
      if (colonIndex > 0 && colonIndex < 35 && !trimmed.startsWith("http")) {
        const label = trimmed.slice(0, colonIndex).trim();
        const value = trimmed.slice(colonIndex + 1).trim();
        return (
          <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-1 py-1 border-b border-stone-200/50 dark:border-white/[0.04] last:border-none">
            <span className="font-semibold text-stone-600 dark:text-stone-400 text-xs min-w-[140px] shrink-0">{label}</span>
            <span className="text-stone-800 dark:text-stone-200 text-xs break-words">{value}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed py-0.5">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="sidebar-expanded-only mt-1">
      <p className="line-clamp-2 text-xs leading-relaxed text-stone-400 break-words">
        {description}
      </p>

      <button
        type="button"
        onClick={() => setIsCompanyProfileOpen(true)}
        className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-dusk-amber hover:text-amber-300 hover:underline transition-colors cursor-pointer"
      >
        <Building2 className="h-3 w-3" />
        <span>แสดงเพิ่มเติม / Profile</span>
      </button>

      {isCompanyProfileOpen && (
        <AppModal
          open={isCompanyProfileOpen}
          onClose={() => setIsCompanyProfileOpen(false)}
          labelledBy="company-profile-modal-title"
          contentClassName="w-full max-w-xl overflow-hidden rounded-2xl"
        >
          <div className="flex max-h-[calc(100dvh-3rem)] flex-col rounded-2xl border border-stone-200/80 bg-white dark:border-white/10 dark:bg-ink-950 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-stone-200/80 dark:border-white/10 p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-dusk-amber/30 bg-dusk-amber/10 text-dusk-amber shadow-xs">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3
                    id="company-profile-modal-title"
                    className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100"
                  >
                    Company Profile / ข้อมูลบริษัท
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                    {projectName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCompanyProfileOpen(false)}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-white/10 dark:hover:text-stone-200 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 sm:p-5 scrollbar-soft">
              <div className="flex items-center justify-between pb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                  รายละเอียด &amp; ข้อมูลบริษัท
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/[0.08] transition cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">คัดลอกแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>คัดลอกข้อมูล</span>
                    </>
                  )}
                </button>
              </div>

              <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                {renderFormattedDescription(description)}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end border-t border-stone-200/80 dark:border-white/10 p-3.5 sm:p-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsCompanyProfileOpen(false)}
                className="h-9 px-4 text-xs font-semibold"
              >
                ปิดหน้าต่าง
              </Button>
            </div>
          </div>
        </AppModal>
      )}
    </div>
  );
}
