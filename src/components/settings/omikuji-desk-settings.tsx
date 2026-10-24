"use client";

import React, { useState, useRef, ChangeEvent, DragEvent } from "react";
import {
  Sparkles,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Languages,
  Calendar,
  ToggleLeft,
  ToggleRight,
  FileSpreadsheet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useToast } from "@/components/ui/toast";
import { SettingsSection, SettingsRow } from "@/components/settings/settings-section";
import {
  useOmikujiSettings,
  saveCustomOmikujiFortunes,
  resetOmikujiSettings
} from "@/lib/omikuji/omikuji-settings";
import { validateOmikujiCsv, CsvValidationResult } from "@/lib/omikuji/omikuji-data";
import { OmikujiLanguageMode, OmikujiDrawMode, OmikujiFortuneItem } from "@/types/omikuji";
import { cn } from "@/lib/utils";

export function OmikujiDeskSettings() {
  const { settings, mounted, update, reset } = useOmikujiSettings();
  const { showToast } = useToast();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationResult, setValidationResult] = useState<CsvValidationResult | null>(null);
  const [pendingFile, setPendingFile] = useState<{ name: string; content: string } | null>(null);

  // Modals
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [applyCsvModalOpen, setApplyCsvModalOpen] = useState(false);

  if (!mounted) {
    return (
      <div className="rounded-xl border border-theme-border bg-theme-panel p-6 shadow-sm">
        <div className="skeleton-base h-8 w-64 rounded-md mb-4" />
        <div className="skeleton-base h-24 w-full rounded-md" />
      </div>
    );
  }

  const handleToggle = () => {
    const next = !settings.enabled;
    update({ enabled: next });
    showToast({
      title: next ? "เปิดใช้งาน Omikuji เรียบร้อย" : "ปิดใช้งาน Omikuji เรียบร้อย",
      description: next
        ? "ปุ่มเซียมซีจะปรากฏบน Header และแถบเครื่องมือ"
        : "ซ่อนปุ่มเซียมซีหน้าบ้านทั้งหมดแล้ว",
      variant: "success"
    });
  };

  const handleLanguageChange = (lang: OmikujiLanguageMode) => {
    update({ languageMode: lang });
    showToast({
      title: "เปลี่ยนภาษาการแสดงผลแล้ว",
      description: `ตั้งค่าภาษาเป็น: ${lang === "auto" ? "ตามระบบ (Auto)" : lang === "th" ? "ภาษาไทย (TH)" : "English (EN)"}`,
      variant: "success"
    });
  };

  const handleDrawModeChange = (mode: OmikujiDrawMode) => {
    update({ drawMode: mode });
    showToast({
      title: "เปลี่ยนโหมดการเสี่ยงทายแล้ว",
      description: mode === "daily" ? "จำกัดวันละ 1 ใบ (Daily Draw)" : "สุ่มได้ไม่จำกัดครั้ง (Unlimited)",
      variant: "success"
    });
  };

  const handleFileProcess = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      showToast({
        title: "ไฟล์ไม่ถูกต้อง",
        description: "กรุณาอัปโหลดไฟล์นามสกุล .csv เท่านั้น",
        variant: "error"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;

      const result = validateOmikujiCsv(content);
      setValidationResult(result);
      if (result.valid) {
        setPendingFile({ name: file.name, content });
        showToast({
          title: "ตรวจสอบไฟล์ CSV สำเร็จ",
          description: `พบชุดข้อมูลเซียมซีทั้งหมด ${result.count} ใบ`,
          variant: "success"
        });
      } else {
        setPendingFile(null);
        showToast({
          title: "ไฟล์ CSV ไม่ตรงตามรูปแบบ",
          description: result.errors[0] || "กรุณาตรวจสอบโครงสร้างหัวตาราง CSV",
          variant: "error"
        });
      }
    };
    reader.readAsText(file);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const applyUploadedDataset = () => {
    if (!pendingFile || !validationResult?.fortunes) return;

    saveCustomOmikujiFortunes(pendingFile.name, validationResult.fortunes);
    setApplyCsvModalOpen(false);
    setPendingFile(null);
    setValidationResult(null);

    showToast({
      title: "ปรับใช้ชุดข้อมูล CSV สำเร็จ",
      description: `นำเข้า ${validationResult.count} ใบเซียมซีเรียบร้อยแล้ว`,
      variant: "success"
    });
  };

  const handleResetDefaults = () => {
    reset();
    setResetModalOpen(false);
    setValidationResult(null);
    setPendingFile(null);

    showToast({
      title: "รีเซ็ตการตั้งค่าเป็นค่าเริ่มต้นแล้ว",
      description: "กลับสู่ชุดข้อมูล 100 ใบมาตรฐานของวัดอาซากุสะ (Asakusa Kannon)",
      variant: "success"
    });
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/omikuji/retzlo_omikuji_100_five_categories.csv";
    link.download = "retzlo_omikuji_template_100.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      title: "ดาวน์โหลด Template แล้ว",
      description: "ไฟล์ตัวอย่างพร้อมใช้งาน retzlo_omikuji_template_100.csv",
      variant: "success"
    });
  };

  return (
    <div className="space-y-6">
      <SettingsSection
        title={
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Creative Fortune & Omikuji Desk</span>
          </div>
        }
        description="ระบบบริหารจัดการเซียมซีสไตล์ญี่ปุ่น Asakusa Kannon 100 หมายเลข พร้อมคำทำนาย 5 มิติ (งาน เงิน รัก สุขภาพ การเติบโต)"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setResetModalOpen(true)}
            className="text-xs text-theme-muted hover:text-theme-foreground"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            รีเซ็ตค่าเริ่มต้น
          </Button>
        }
      >
        {/* Toggle Switch */}
        <SettingsRow
          label="เปิด/ปิดการแสดงผลหน้าบ้าน (Feature Toggle)"
          description="เมื่อปิดใช้งาน ปุ่มไอคอนเซียมซีจะถูกซ่อนออกจาก Header และ Studio ทั้งหมดทันที"
        >
          <button
            type="button"
            onClick={handleToggle}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all border",
              settings.enabled
                ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "bg-theme-muted/10 text-theme-muted border-theme-border"
            )}
          >
            {settings.enabled ? (
              <>
                <ToggleRight className="h-5 w-5 text-emerald-500" />
                <span>เปิดใช้งาน (Active)</span>
              </>
            ) : (
              <>
                <ToggleLeft className="h-5 w-5 text-theme-muted" />
                <span>ปิดใช้งาน (Disabled)</span>
              </>
            )}
          </button>
        </SettingsRow>

        {/* Language Selection */}
        <SettingsRow
          label="ภาษาการแสดงผลคำทำนาย (Editorial Language)"
          description="เลือกว่าจะให้คำทำนาย 5 ด้านแสดงเป็นภาษาไทย หรือถอดความเรียบเรียงภาษาอังกฤษ"
        >
          <div className="flex items-center gap-1.5 rounded-lg border border-theme-border bg-theme-paper p-1">
            <button
              type="button"
              onClick={() => handleLanguageChange("auto")}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                settings.languageMode === "auto"
                  ? "bg-theme-primary text-theme-primary-foreground shadow-xs"
                  : "text-theme-muted hover:text-theme-foreground"
              )}
            >
              Auto (ตามระบบ)
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange("th")}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                settings.languageMode === "th"
                  ? "bg-theme-primary text-theme-primary-foreground shadow-xs"
                  : "text-theme-muted hover:text-theme-foreground"
              )}
            >
              🇹🇭 ภาษาไทย
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange("en")}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                settings.languageMode === "en"
                  ? "bg-theme-primary text-theme-primary-foreground shadow-xs"
                  : "text-theme-muted hover:text-theme-foreground"
              )}
            >
              🇬🇧 English
            </button>
          </div>
        </SettingsRow>

        {/* Draw Frequency Mode */}
        <SettingsRow
          label="โหมดรอบการเสี่ยงทาย (Draw Frequency Mode)"
          description="วันละ 1 ใบเพื่อสร้างจังหวะชีวิตอย่างสงบ (Daily) หรือเปิดให้สุ่มได้ตลอดเวลา (Unlimited)"
        >
          <div className="flex items-center gap-1.5 rounded-lg border border-theme-border bg-theme-paper p-1">
            <button
              type="button"
              onClick={() => handleDrawModeChange("daily")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors",
                settings.drawMode === "daily"
                  ? "bg-theme-primary text-theme-primary-foreground shadow-xs"
                  : "text-theme-muted hover:text-theme-foreground"
              )}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Daily Draw (วันละ 1 ใบ)</span>
            </button>
            <button
              type="button"
              onClick={() => handleDrawModeChange("unlimited")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors",
                settings.drawMode === "unlimited"
                  ? "bg-theme-primary text-theme-primary-foreground shadow-xs"
                  : "text-theme-muted hover:text-theme-foreground"
              )}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Unlimited (สุ่มอิสระ)</span>
            </button>
          </div>
        </SettingsRow>
      </SettingsSection>

      {/* CSV Dataset Manager */}
      <SettingsSection
        title={
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-indigo-500" />
            <span>กล่องอัปโหลด CSV ประจำปีใหม่ (Annual Omikuji CSV Desk)</span>
          </div>
        }
        description="อัปเดตหรือเปลี่ยนชุดข้อมูลคำทำนายใหม่สำหรับเทศกาลปีใหม่ หรือธีมพิเศษขององค์กร"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            className="text-xs"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            ดาวน์โหลด Template CSV
          </Button>
        }
      >
        {/* Active Dataset Status */}
        <SettingsRow
          label="สถานะชุดข้อมูลปัจจุบัน (Active Dataset)"
          description="ชุดข้อมูลที่กำลังใช้อยู่สำหรับการสุ่มใบเซียมซี"
        >
          <div className="flex items-center gap-2">
            {settings.customCsvName ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{settings.customCsvName} ({settings.customFortunesCount || 100} ใบ)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Asakusa Kannon 100 Cards (ชุดมาตรฐาน 2 ภาษา)</span>
              </span>
            )}
          </div>
        </SettingsRow>

        {/* Drag & Drop Upload Zone */}
        <div className="p-4">
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all",
              isDragging
                ? "border-theme-primary bg-theme-primary/5"
                : "border-theme-border bg-theme-paper/40 hover:border-theme-primary/40 hover:bg-theme-paper"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={onFileChange}
              className="hidden"
            />

            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-theme-panel shadow-sm">
              <UploadCloud className="h-6 w-6 text-theme-muted" />
            </div>

            <p className="text-sm font-semibold text-theme-foreground">
              ลากและวางไฟล์ CSV ประจำปีใหม่ที่นี่ หรือคลิกเพื่อเลือกไฟล์
            </p>
            <p className="mt-1 text-xs text-theme-muted max-w-md">
              รองรับไฟล์ .csv ที่มี 12 คอลัมน์ (id, number, rank_jp, rank_romaji, rank_th, title_th, central_theme_th, career, finance, love, health, growth)
            </p>

            <div className="mt-4 flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs"
              >
                เลือกไฟล์ CSV จากเครื่อง
              </Button>
            </div>
          </div>

          {/* Validation Summary Callout */}
          {validationResult && (
            <div
              className={cn(
                "mt-4 rounded-xl border p-4 transition-all text-sm",
                validationResult.valid
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                  : "border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-300"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  {validationResult.valid ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
                  )}
                  <div>
                    <h4 className="font-semibold">
                      {validationResult.valid
                        ? `ตรวจสอบความถูกต้องสำเร็จ: พบข้อมูล ${validationResult.count} ใบ`
                        : "ตรวจพบข้อผิดพลาดในไฟล์ CSV"}
                    </h4>
                    {validationResult.valid ? (
                      <p className="mt-1 text-xs opacity-90">
                        ไฟล์ {pendingFile?.name} มีโครงสร้างครบถ้วน พร้อมให้นำไปใช้งานแทนชุดข้อมูลเดิม
                      </p>
                    ) : (
                      <ul className="mt-2 list-disc list-inside space-y-1 text-xs opacity-90">
                        {validationResult.errors.slice(0, 5).map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                        {validationResult.errors.length > 5 && (
                          <li>และอีก {validationResult.errors.length - 5} ข้อผิดพลาด...</li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>

                {validationResult.valid && pendingFile && (
                  <Button
                    size="sm"
                    onClick={() => setApplyCsvModalOpen(true)}
                    className="shrink-0 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    ปรับใช้ชุดข้อมูลนี้ทันที
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </SettingsSection>

      {/* Confirm Modal: Apply Uploaded CSV */}
      <ConfirmModal
        open={applyCsvModalOpen}
        title="ยืนยันการเปลี่ยนชุดข้อมูลเซียมซี"
        message={`คุณต้องการปรับใช้ชุดข้อมูลจากไฟล์ "${pendingFile?.name}" จำนวน ${validationResult?.count} ใบเซียมซีใช่หรือไม่? ระบบจะใช้ชุดข้อมูลนี้ในการเสี่ยงทายแทนชุดข้อมูลเดิม`}
        confirmLabel="ยืนยันการปรับใช้ข้อมูล"
        cancelLabel="ยกเลิก"
        onConfirm={applyUploadedDataset}
        onClose={() => setApplyCsvModalOpen(false)}
      />

      {/* Confirm Modal: Reset to Defaults */}
      <ConfirmModal
        open={resetModalOpen}
        title="ยืนยันการรีเซ็ตการตั้งค่า"
        message="คุณต้องการรีเซ็ตการตั้งค่าทั้งหมดกลับสู่ค่าเริ่มต้น และใช้ชุดข้อมูล 100 ใบของวัดอาซากุสะ (Asakusa Kannon) ใช่หรือไม่?"
        confirmLabel="รีเซ็ตเป็นค่าเริ่มต้น"
        cancelLabel="ยกเลิก"
        variant="danger"
        onConfirm={handleResetDefaults}
        onClose={() => setResetModalOpen(false)}
      />
    </div>
  );
}
