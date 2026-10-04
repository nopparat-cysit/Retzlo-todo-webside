"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock,
  Compass,
  CornerDownRight,
  FileText,
  FolderKanban,
  HelpCircle,
  Mail,
  MessageSquare,
  Send,
  Sparkles,
  Zap,
} from "lucide-react";

import { BackButton } from "@/components/ui/back-button";
import { useAiChat } from "@/components/ai/ai-chat-context";
import { useToast } from "@/components/ui/toast";
import { CONTACT_TEMPLATES, type ContactTemplate } from "@/lib/contact-templates";
import { cn } from "@/lib/utils";

interface ContactPageClientProps {
  initialUser?: {
    name?: string | null;
    email?: string | null;
  } | null;
}

export function ContactPageClient({ initialUser }: ContactPageClientProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("bug-report");
  const [name, setName] = useState(initialUser?.name || "");
  const [email, setEmail] = useState(initialUser?.email || "");

  const initialTemplate = CONTACT_TEMPLATES.find((t) => t.id === "bug-report") || CONTACT_TEMPLATES[0];
  const [subject, setSubject] = useState(initialTemplate.defaultSubject);
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">(initialTemplate.defaultPriority);
  const [message, setMessage] = useState(initialTemplate.templateBody);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedTicket, setSubmittedTicket] = useState<{ ticketId: string; message: string } | null>(null);

  const { openAiChat } = useAiChat();
  const { toast } = useToast();

  const currentTemplate = CONTACT_TEMPLATES.find((t) => t.id === selectedTemplateId) || CONTACT_TEMPLATES[0];

  const handleSelectTemplate = (template: ContactTemplate) => {
    setSelectedTemplateId(template.id);
    setSubject(template.defaultSubject);
    setPriority(template.defaultPriority);
    setMessage(template.templateBody);
    setErrorMessage(null);
    toast({
      message: `เลือกเทมเพลต "${template.shortName}" พร้อมใช้งานแล้ว`,
      type: "info",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("กรุณาระบุชื่อของคุณ");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("กรุณาระบุอีเมลที่ถูกต้องสำหรับติดต่อกลับ");
      return;
    }

    if (!subject.trim()) {
      setErrorMessage("กรุณาระบุหัวข้อเรื่อง");
      return;
    }

    if (!message.trim()) {
      setErrorMessage("กรุณากรอกข้อความหรือรายละเอียดที่ต้องการติดต่อ");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
          templateId: selectedTemplateId,
          priority,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการส่งข้อความ");
      }

      setSubmittedTicket({
        ticketId: data.ticketId,
        message: data.message,
      });

      toast({
        message: `ส่งข้อความสำเร็จ! รหัสติดตาม: ${data.ticketId}`,
        type: "success",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
      setErrorMessage(msg);
      toast({ message: msg, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmittedTicket(null);
    setSelectedTemplateId("bug-report");
    setSubject(initialTemplate.defaultSubject);
    setPriority(initialTemplate.defaultPriority);
    setMessage(initialTemplate.templateBody);
  };

  return (
    <main className="soft-grid-bg min-h-screen w-full px-4 py-6 sm:px-6 sm:py-8 text-stone-900 dark:text-stone-100">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-stone-200/80 pb-4 dark:border-white/10">
          <div className="flex items-center gap-3">
            <BackButton />
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-amber-200 bg-amber-50 text-amber-600 dark:border-dusk-amber/30 dark:bg-dusk-amber/10 dark:text-dusk-amber shadow-sm">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.25em] text-indigo-600 dark:text-dusk-amber font-bold">
                  Support & Helpdesk
                </span>
                <span className="rounded-full bg-stone-100 dark:bg-white/10 px-2 py-0.5 text-[9px] font-semibold text-stone-600 dark:text-stone-300">
                  Ticket System
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
                ติดต่อเรา & ส่งข้อเสนอแนะ
              </h1>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openAiChat}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-dusk-lavender/40 dark:bg-dusk-lavender/15 dark:text-dusk-lavender dark:hover:bg-dusk-lavender dark:hover:text-ink-950 transition cursor-pointer shadow-sm"
              title="ถาม AI Assistant สำหรับคำตอบด่วน"
            >
              <Bot className="h-4 w-4" />
              <span>ถาม AI Assistant</span>
              <Sparkles className="h-3 w-3 text-amber-500 dark:text-dusk-amber" />
            </button>
            <Link
              href="/help"
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200/90 bg-white px-3.5 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300 dark:hover:bg-white/[0.08] transition shadow-sm"
            >
              <FileText className="h-4 w-4 text-stone-500 dark:text-stone-400" />
              <span>คู่มือระบบ (/help)</span>
            </Link>
          </div>
        </div>

        {/* ── Main Layout: 2 Columns ── */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* ── Left Column (2 Cols): Contact Form ── */}
          <div className="lg:col-span-2 space-y-6">
            {submittedTicket ? (
              /* Success Confirmation Card */
              <div className="lofi-panel rounded-2xl border border-emerald-300/80 bg-white/95 p-6 sm:p-8 text-center space-y-5 dark:border-emerald-500/30 dark:bg-ink-950/70 shadow-sm">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 shadow-sm">
                  <CheckCircle2 className="h-8 w-8" />
                </div>

                <div className="space-y-2 max-w-md mx-auto">
                  <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                    ส่งข้อความติดต่อเรียบร้อยแล้ว
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                    {submittedTicket.message}
                  </p>
                </div>

                {/* Ticket ID Box */}
                <div className="mx-auto max-w-xs rounded-xl border border-stone-200 bg-stone-50/80 p-3.5 dark:border-white/10 dark:bg-white/[0.03]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    รหัสติดตามเรื่อง (Ticket ID)
                  </span>
                  <p className="font-mono text-base font-bold text-indigo-600 dark:text-dusk-lavender mt-0.5 select-all">
                    {submittedTicket.ticketId}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:bg-white/10 transition cursor-pointer"
                  >
                    ส่งข้อความเรื่องอื่นเพิ่มเติม
                  </button>
                  <Link
                    href="/projects"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 dark:bg-dusk-lavender dark:text-ink-950 dark:hover:bg-dusk-lavender/90 transition shadow-sm"
                  >
                    <FolderKanban className="h-3.5 w-3.5" />
                    <span>กลับไปยัง Workspace</span>
                  </Link>
                </div>
              </div>
            ) : (
              /* Contact Form */
              <form
                onSubmit={handleSubmit}
                className="lofi-panel rounded-2xl border border-stone-200/80 bg-white/95 p-5 sm:p-7 dark:border-white/10 dark:bg-ink-950/60 shadow-sm space-y-5"
              >
                {/* ── Template Select Section ── */}
                <div className="space-y-2.5 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-dusk-lavender/20 dark:bg-dusk-lavender/5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="template-select"
                      className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-dusk-lavender" />
                      <span>เลือกเทมเพลตข้อความด่วน (Template Select)</span>
                    </label>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400">
                      ช่วยเติมโครงร่างข้อความอัตโนมัติ
                    </span>
                  </div>

                  {/* Dropdown Select */}
                  <select
                    id="template-select"
                    value={selectedTemplateId}
                    onChange={(e) => {
                      const t = CONTACT_TEMPLATES.find((tpl) => tpl.id === e.target.value);
                      if (t) handleSelectTemplate(t);
                    }}
                    className="w-full h-10 rounded-xl border border-stone-200/90 bg-white px-3 text-xs font-semibold text-stone-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-ink-950 dark:text-stone-100 cursor-pointer"
                  >
                    {CONTACT_TEMPLATES.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        {tpl.label}
                      </option>
                    ))}
                  </select>

                  {/* Quick Pill Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {CONTACT_TEMPLATES.map((tpl) => {
                      const isSelected = selectedTemplateId === tpl.id;
                      return (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => handleSelectTemplate(tpl)}
                          className={cn(
                            "rounded-lg px-2.5 py-1 text-[11px] font-medium transition cursor-pointer border",
                            isSelected
                              ? "border-indigo-500 bg-indigo-600 text-white dark:border-dusk-lavender dark:bg-dusk-lavender dark:text-ink-950 font-semibold shadow-xs"
                              : "border-stone-200 bg-white/80 text-stone-600 hover:bg-white hover:text-stone-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-400 dark:hover:bg-white/[0.08]"
                          )}
                        >
                          {tpl.shortName}
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    {currentTemplate.description}
                  </p>
                </div>

                {/* Sender Information (Name & Email) */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      ชื่อผู้ติดต่อ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="เช่น สมชาย ใจดี"
                      className="h-10 w-full rounded-xl border border-stone-200/90 bg-stone-50/70 px-3.5 text-xs text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-dusk-lavender"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      อีเมลสำหรับติดต่อกลับ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="h-10 w-full rounded-xl border border-stone-200/90 bg-stone-50/70 px-3.5 text-xs text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-dusk-lavender"
                    />
                  </div>
                </div>

                {/* Subject & Priority */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      หัวข้อเรื่อง <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="ระบุหัวข้อเรื่องที่ต้องการติดต่อ"
                      className="h-10 w-full rounded-xl border border-stone-200/90 bg-stone-50/70 px-3.5 text-xs text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-dusk-lavender"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      ระดับความเร่งด่วน
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="h-10 w-full rounded-xl border border-stone-200/90 bg-stone-50/70 px-3 text-xs text-stone-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-100 cursor-pointer"
                    >
                      <option value="low">ต่ำ (Low)</option>
                      <option value="medium">ปกติ (Normal)</option>
                      <option value="high">สูง (High)</option>
                      <option value="urgent">เร่งด่วนมาก (Urgent)</option>
                    </select>
                  </div>
                </div>

                {/* Message Content Textarea */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      รายละเอียดข้อความ <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400">
                      {message.length} ตัวอักษร
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="กรอกรายละเอียดที่ต้องการติดต่อ..."
                    className="w-full rounded-xl border border-stone-200/90 bg-stone-50/70 p-3.5 font-mono text-xs text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-dusk-lavender"
                  />
                  <p className="text-[10px] text-stone-500 dark:text-stone-400">
                    💡 ข้อความร่างตามเทมเพลตช่วยให้ทีมงานเข้าใจปัญหาได้รวดเร็วขึ้น คุณสามารถปรับแก้ข้อความได้ตามสะดวก
                  </p>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-200/80 dark:border-white/10">
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">
                    🔒 ข้อมูลของคุณได้รับการคุ้มครองตามนโยบายความเป็นส่วนตัว
                  </span>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 dark:bg-dusk-lavender dark:text-ink-950 dark:hover:bg-dusk-lavender/90 transition disabled:opacity-60 cursor-pointer shadow-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        <span>กำลังส่งข้อมูล...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>ส่งข้อความติดต่อ</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ── Right Column (1 Col): Support Info & Direct Channels ── */}
          <div className="space-y-5">
            {/* Direct Channels Card */}
            <div className="lofi-panel rounded-2xl border border-stone-200/80 bg-white/95 p-5 dark:border-white/10 dark:bg-ink-950/60 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                ช่องทางติดต่อโดยตรง
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 rounded-xl border border-stone-100 bg-stone-50/70 p-3 dark:border-white/5 dark:bg-white/[0.02]">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-dusk-lavender/15 dark:text-dusk-lavender">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-stone-900 dark:text-stone-100">อีเมลสนับสนุน</span>
                    <p className="font-mono text-[11px] text-stone-500 dark:text-stone-400 select-all">
                      support@retzlo.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-stone-100 bg-stone-50/70 p-3 dark:border-white/5 dark:bg-white/[0.02]">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-600 dark:bg-dusk-amber/15 dark:text-dusk-amber">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-stone-900 dark:text-stone-100">เวลาทำการทีมงาน</span>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      จันทร์ - ศุกร์: 09:00 - 18:00 น.
                    </p>
                    <p className="text-[10px] text-stone-400 dark:text-stone-500">
                      (ระบบรับเรื่องตลอด 24 ชั่วโมง)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Instant AI Assistant Card */}
            <div className="lofi-panel rounded-2xl border border-indigo-200 bg-indigo-50/60 p-5 dark:border-dusk-lavender/30 dark:bg-dusk-lavender/10 shadow-sm space-y-3">
              <div className="flex items-center gap-2 font-bold text-xs text-indigo-700 dark:text-dusk-lavender">
                <Bot className="h-4 w-4" />
                <span>ต้องการคำตอบทันที?</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                ผู้ช่วย <strong>Retzlo AI</strong> สามารถตอบคำถามเกี่ยวกับระบบ วิธีใช้งานบอร์ด และคีย์ลัดได้ทันทีโดยไม่ต้องรออีเมล
              </p>
              <button
                type="button"
                onClick={openAiChat}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 dark:bg-dusk-lavender dark:text-ink-950 dark:hover:bg-dusk-lavender/90 transition cursor-pointer shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-300 dark:text-ink-950" />
                <span>เปิดคุยกับ AI Assistant</span>
              </button>
            </div>

            {/* Knowledge Base Fast Link */}
            <div className="rounded-2xl border border-stone-200/80 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.02] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-stone-900 dark:text-stone-100">
                <span className="flex items-center gap-1.5">
                  <Compass className="h-4 w-4 text-indigo-600 dark:text-dusk-lavender" />
                  <span>คลังความรู้ระบบ</span>
                </span>
                <Link
                  href="/help"
                  className="text-[11px] text-indigo-600 hover:underline dark:text-dusk-lavender"
                >
                  เปิดคู่มือ →
                </Link>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                อ่านวิธีใช้งานตารางสเปรดชีต, การแตกงานด้วย AI Breakdown, หรือการส่งกาแฟ Cheers ในหน้าคู่มือ
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
