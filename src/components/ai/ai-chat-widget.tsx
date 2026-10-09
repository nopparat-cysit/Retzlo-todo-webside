"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { usePathname } from "next/navigation";
import {
  AlarmClock,
  ArrowUp,
  BarChart3,
  Check,
  CircleAlert,
  Copy,
  FolderKanban,
  ListChecks,
  PanelRight,
  PanelRightClose,
  PenLine,
  RotateCcw,
  X
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useToast } from "@/components/ui/toast";
import { useAiChat } from "@/components/ai/ai-chat-context";
import { AiMessageContent } from "@/components/ai/ai-message-content";
import { getAiAuthHeaders, getClientAiModel } from "@/lib/ai/client-key";
import type { AiCreateCardProposal } from "@/lib/ai/chat-actions";
import { GeminiSparkleIcon } from "@/components/ai/gemini-sparkle-icon";
import { getPriorityMeta } from "@/lib/kanban/priority";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isError?: boolean;
  createProposal?: AiCreateCardProposal;
  proposalStatus?: "created" | "cancelled";
  createdCardCount?: number;
}

interface AiChatResponse {
  reply?: string;
  error?: string;
  remainingCredits?: number;
  createProposal?: AiCreateCardProposal | null;
}

interface CreateCardsResponse {
  error?: string;
  createdCount?: number;
}

interface StarterPrompt {
  icon: ComponentType<{ className?: string }>;
  label: { th: string; en: string };
  prompt: { th: string; en: string };
}

const STARTER_PROMPTS: StarterPrompt[] = [
  {
    icon: BarChart3,
    label: { th: "สรุปความคืบหน้า", en: "Summarize progress" },
    prompt: {
      th: "สรุปสถานะและความคืบหน้าของบอร์ดนี้ให้หน่อย",
      en: "Summarize the status and progress of this board."
    }
  },
  {
    icon: ListChecks,
    label: { th: "งานที่ควรทำต่อ", en: "Plan next steps" },
    prompt: {
      th: "มีงานอะไรที่ควรทำเป็นลำดับถัดไปบ้าง?",
      en: "Which tasks should I work on next?"
    }
  },
  {
    icon: AlarmClock,
    label: { th: "ตรวจงานใกล้กำหนด", en: "Check deadlines" },
    prompt: {
      th: "ตรวจสอบงานที่ใกล้กำหนดหรือเลยกำหนดให้หน่อย",
      en: "Review tasks that are due soon or overdue."
    }
  },
  {
    icon: PenLine,
    label: { th: "ร่างขั้นตอนงานใหม่", en: "Draft a new task" },
    prompt: {
      th: "ช่วยคิดและร่างขั้นตอนสำหรับงานใหม่",
      en: "Help me outline the steps for a new task."
    }
  }
];

const WELCOME_ID = "welcome";

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function createWelcomeMessage(): ChatMessage {
  return { id: WELCOME_ID, role: "assistant", content: "", timestamp: nowTime() };
}

function formatProposalDueDate(value: string | null, allDay: boolean, isEn: boolean) {
  if (!value) return isEn ? "No due date" : "ไม่กำหนดวัน";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return isEn ? "Invalid date" : "วันที่ไม่ถูกต้อง";
  const locale = isEn ? "en-US" : "th-TH";
  return allDay
    ? date.toLocaleDateString(locale, { dateStyle: "medium" })
    : date.toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
}

const iconButtonClass =
  "grid h-7 w-7 place-items-center rounded-md text-theme-muted transition-colors hover:bg-theme-paper hover:text-theme-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/40 cursor-pointer";

export function AiChatWidget() {
  const pathname = usePathname();
  const { toast } = useToast();
  const { language } = useLanguage();
  const isEn = language === "en";
  const tr = (th: string, en: string) => (isEn ? en : th);

  const { isOpen, setIsOpen, viewMode, setViewMode, isSmallScreen } = useAiChat();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [activeModel, setActiveModel] = useState<string>("deepseek-v4-pro");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmProposalId, setConfirmProposalId] = useState<string | null>(null);
  const [isCreatingCards, setIsCreatingCards] = useState(false);
  const createRequestInFlightRef = useRef(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Extract projectId if currently inside a project route: /project/[id]/...
  const projectMatch = pathname?.match(/\/project\/([a-zA-Z0-9_-]+)/);
  const currentProjectId = projectMatch ? projectMatch[1] : undefined;
  const storageKey = currentProjectId ? `retzlo_ai_chat_${currentProjectId}` : "retzlo_ai_chat_global";

  // Load active model & credits
  useEffect(() => {
    const saved = getClientAiModel();
    if (saved) {
      setActiveModel(saved);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    async function loadCredits() {
      try {
        const res = await fetch("/api/ai/credits");
        if (res.ok) {
          const data = await res.json();
          if (data.quota) {
            setCredits(data.quota.credits);
          }
        }
      } catch {
        // Ignore quota load error
      }
    }

    loadCredits();
  }, [isOpen]);

  // Load chat history from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      setMessages(saved ? JSON.parse(saved) : [createWelcomeMessage()]);
    } catch {
      setMessages([createWelcomeMessage()]);
    }
  }, [storageKey]);

  // Save chat history to sessionStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(messages));
      } catch {
        // Ignore
      }
    }
  }, [messages, storageKey]);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Auto-grow composer
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  const pushAssistantError = (content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "assistant", content, timestamp: nowTime(), isError: true }
    ]);
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: query,
      timestamp: nowTime()
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const payloadMessages = nextMessages
        .filter((m) => m.id !== WELCOME_ID && !m.isError)
        .map((m) => ({
          role: m.role,
          content: m.content
        }));
      const boardId = new URLSearchParams(window.location.search).get("boardId") || undefined;

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAiAuthHeaders()
        },
        body: JSON.stringify({
          messages: payloadMessages,
          projectId: currentProjectId,
          boardId
        })
      });

      let data: AiChatResponse;
      try {
        data = await res.json();
      } catch {
        // Vercel returns HTML on 504 timeout — not JSON-parseable
        const errorMsg = res.status === 504
          ? tr(
              "AI ตอบกลับช้าเกินกำหนดของเซิร์ฟเวอร์ (Timeout) — ลองส่งข้อความสั้นลงหรือลองใหม่",
              "The AI took too long to respond (timeout). Try a shorter message or retry."
            )
          : tr(`เซิร์ฟเวอร์ตอบกลับผิดปกติ (HTTP ${res.status})`, `Unexpected server response (HTTP ${res.status})`);
        toast({ message: errorMsg, type: "error" });
        pushAssistantError(errorMsg);
        return;
      }

      if (!res.ok) {
        const errMsg = data.error || tr("ไม่สามารถติดต่อ AI ได้ในขณะนี้", "The AI service is unavailable right now.");
        toast({ message: errMsg, type: "error" });
        pushAssistantError(errMsg);
        return;
      }

      if (typeof data.remainingCredits === "number") {
        setCredits(data.remainingCredits);
      }

      const botReply: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply || tr("ขออภัย ไม่พบคำตอบจากระบบ AI", "Sorry, the AI returned an empty response."),
        timestamp: nowTime(),
        ...(data.createProposal ? { createProposal: data.createProposal } : {})
      };

      setMessages((prev) => [...prev, botReply]);
    } catch {
      toast({
        message: tr("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์", "Could not connect to the server."),
        type: "error"
      });
      pushAssistantError(
        tr(
          "ไม่สามารถเชื่อมต่อกับ AI Server ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่",
          "Could not reach the AI server. Check your connection and try again."
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const cancelCreateProposal = (messageId: string) => {
    setMessages((current) => current.map((message) =>
      message.id === messageId
        ? { ...message, createProposal: undefined, proposalStatus: "cancelled" }
        : message
    ));
    setConfirmProposalId(null);
  };

  const confirmCreateProposal = async () => {
    if (!confirmProposalId || createRequestInFlightRef.current) return;
    const message = messages.find((item) => item.id === confirmProposalId);
    const proposal = message?.createProposal;
    if (!message || !proposal) {
      setConfirmProposalId(null);
      return;
    }

    createRequestInFlightRef.current = true;
    setIsCreatingCards(true);
    try {
      const response = await fetch("/api/ai/create-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: proposal.projectId,
          boardId: proposal.boardId,
          cards: proposal.cards.map((card) => ({
            columnId: card.columnId,
            title: card.title,
            description: card.description,
            priority: card.priority,
            dueDate: card.dueDate,
            dueDateAllDay: card.dueDateAllDay
          }))
        })
      });
      const data = await response.json() as CreateCardsResponse;
      if (!response.ok) {
        throw new Error(data.error || tr("สร้างการ์ดไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", "Failed to create cards. Please try again."));
      }

      const createdCount = data.createdCount ?? proposal.cards.length;
      setMessages((current) => current.map((item) =>
        item.id === message.id
          ? {
              ...item,
              createProposal: undefined,
              proposalStatus: "created",
              createdCardCount: createdCount
            }
          : item
      ));
      setConfirmProposalId(null);
      toast({
        message: tr(`เพิ่มการ์ด ${createdCount} ใบลงบอร์ดแล้ว`, `Added ${createdCount} card(s) to the board`),
        type: "success"
      });
    } catch (error) {
      toast({
        message: error instanceof Error ? error.message : tr("สร้างการ์ดไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", "Failed to create cards. Please try again."),
        type: "error"
      });
    } finally {
      createRequestInFlightRef.current = false;
      setIsCreatingCards(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([createWelcomeMessage()]);
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      // Ignore
    }
    toast({ message: tr("เริ่มบทสนทนาใหม่แล้ว", "Started a new conversation"), type: "info" });
  };

  const handleCopy = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      toast({ message: tr("คัดลอกข้อความแล้ว", "Copied to clipboard"), type: "success" });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({ message: tr("คัดลอกไม่สำเร็จ", "Copy failed"), type: "error" });
    }
  };

  // Do not render on public auth pages
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";
  if (isAuthPage) return null;

  const visibleMessages = messages.filter((message) => message.id !== WELCOME_ID);
  const isEmpty = visibleMessages.length === 0;
  const modelLabel = activeModel === "deepseek-flash" ? "Flash" : activeModel;

  const proposalForConfirmation = messages.find((message) =>
    message.id === confirmProposalId
  )?.createProposal;
  const confirmationSummary = proposalForConfirmation
    ? tr(
        `ยืนยันสร้าง ${proposalForConfirmation.cards.length} การ์ดลงบอร์ด “${proposalForConfirmation.boardName}” หรือไม่? รายการ: ${proposalForConfirmation.cards.map((card) => card.title).join(", ")}`,
        `Create ${proposalForConfirmation.cards.length} card(s) on “${proposalForConfirmation.boardName}”? Items: ${proposalForConfirmation.cards.map((card) => card.title).join(", ")}`
      )
    : "";

  return (
    <>
      {/* ─── AI Chat Window (Supports Float at Bottom-Right & Side Panel like Gemini) ─── */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Retzlo AI"
          className={cn(
            "z-50 flex flex-col border border-theme-border bg-theme-panel text-theme-foreground shadow-2xl backdrop-blur-xl transition-all duration-300",
            viewMode === "float" || isSmallScreen
              ? "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[min(calc(100vw-2rem),420px)] h-[560px] max-h-[85vh] rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6"
              : "fixed top-0 right-0 bottom-0 w-[380px] sm:w-[450px] max-w-full border-l border-theme-border rounded-none overflow-hidden animate-in fade-in slide-in-from-right-6"
          )}
        >
          {/* Header */}
          <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-theme-border px-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <GeminiSparkleIcon className="h-[18px] w-[18px] shrink-0" />
              <div className="min-w-0 leading-tight">
                <h3 className="text-[13px] font-semibold tracking-tight text-theme-foreground">Retzlo AI</h3>
                <p className="flex items-center gap-1.5 truncate text-[11px] text-theme-muted">
                  <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", isLoading ? "bg-theme-warning" : "bg-theme-success")} />
                  {isLoading ? tr("กำลังประมวลผล", "Working") : tr("พร้อมใช้งาน", "Online")}
                  <span aria-hidden className="text-theme-border">/</span>
                  <span className="truncate font-mono">{modelLabel}</span>
                </p>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                onClick={handleClearChat}
                disabled={isEmpty}
                className={cn(iconButtonClass, "disabled:pointer-events-none disabled:opacity-35")}
                title={tr("เริ่มบทสนทนาใหม่", "New conversation")}
                aria-label={tr("เริ่มบทสนทนาใหม่", "New conversation")}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              {!isSmallScreen && (
                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === "float" ? "sidepanel" : "float")}
                  className={iconButtonClass}
                  title={
                    viewMode === "float"
                      ? tr("ตรึงแถบข้าง (Side Panel แบบ Gemini ใน Sheets)", "Dock to side panel")
                      : tr("สลับเป็นกล่องแชทลอย (ขวาล่าง)", "Switch to floating window (bottom-right)")
                  }
                >
                  {viewMode === "float" ? (
                    <PanelRight className="h-3.5 w-3.5" />
                  ) : (
                    <PanelRightClose className="h-3.5 w-3.5" />
                  )}
                </button>
              )}

              <span aria-hidden className="mx-1 h-4 w-px bg-theme-border" />

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={iconButtonClass}
                title={tr("ปิดแชท", "Close")}
                aria-label={tr("ปิดแชท", "Close")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          {/* Context bar */}
          <div className="flex h-8 shrink-0 items-center justify-between gap-2 border-b border-theme-border bg-theme-panel-strong/60 px-4 text-[11px] text-theme-muted">
            <span className="flex min-w-0 items-center gap-1.5 truncate">
              <FolderKanban className="h-3 w-3 shrink-0" />
              {currentProjectId
                ? tr("ใช้บริบทจากโปรเจกต์ปัจจุบัน", "Using current project context")
                : tr("โหมดทั่วไป · ไม่มีบริบทโปรเจกต์", "General mode · no project context")}
            </span>
            {credits !== null && (
              <span className="shrink-0 font-mono tabular-nums">
                {credits} {tr("เครดิต", "credits")}
              </span>
            )}
          </div>

          {/* Messages / Empty state */}
          <div className="flex-1 overflow-y-auto">
            {isEmpty ? (
              <div className="flex min-h-full flex-col justify-end px-5 pb-4 pt-8">
                <div className="mb-6">
                  <GeminiSparkleIcon className="mb-4 h-6 w-6" />
                  <h4 className="text-lg font-semibold tracking-tight text-theme-foreground">
                    {tr("วันนี้ให้ช่วยอะไรดี?", "How can I help today?")}
                  </h4>
                  <p className="mt-1.5 max-w-[34ch] text-[13px] leading-relaxed text-theme-muted">
                    {currentProjectId
                      ? tr(
                          "ถามเกี่ยวกับการ์ดในบอร์ด วางแผนลำดับงาน หรือให้ร่างการ์ดใหม่ให้ได้",
                          "Ask about cards on this board, plan priorities, or have me draft new cards."
                        )
                      : tr(
                          "เปิดโปรเจกต์เพื่อให้ AI อ่านบริบทบอร์ด หรือเริ่มถามคำถามทั่วไปได้เลย",
                          "Open a project to give me board context, or start with a general question."
                        )}
                  </p>
                </div>

                <div className="overflow-hidden rounded-xl border border-theme-border divide-y divide-theme-border">
                  {STARTER_PROMPTS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label.en}
                        type="button"
                        onClick={() => handleSend(isEn ? item.prompt.en : item.prompt.th)}
                        className="group flex w-full items-center gap-3 bg-theme-panel px-3.5 py-2.5 text-left transition-colors hover:bg-theme-paper focus:outline-none focus-visible:bg-theme-paper cursor-pointer"
                      >
                        <Icon className="h-4 w-4 shrink-0 text-theme-muted transition-colors group-hover:text-theme-accent" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-medium text-theme-foreground">
                            {isEn ? item.label.en : item.label.th}
                          </span>
                          <span className="block truncate text-[11px] text-theme-muted">
                            {isEn ? item.prompt.en : item.prompt.th}
                          </span>
                        </span>
                        <ArrowUp className="h-3.5 w-3.5 shrink-0 rotate-45 text-theme-muted opacity-0 transition-opacity group-hover:opacity-100" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-5 px-4 py-5 text-[13px] leading-relaxed">
                {visibleMessages.map((msg) => {
                  if (msg.role === "user") {
                    return (
                      <div key={msg.id} className="flex justify-end">
                        <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md border border-theme-border bg-theme-paper px-3.5 py-2 text-theme-foreground">
                          {msg.content}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} className="group flex gap-3">
                      <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border border-theme-border bg-theme-panel-strong">
                        {msg.isError ? (
                          <CircleAlert className="h-3.5 w-3.5 text-theme-danger" />
                        ) : (
                          <GeminiSparkleIcon className="h-3.5 w-3.5" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        {msg.isError ? (
                          <p className="rounded-lg border border-theme-danger-border bg-theme-danger-surface px-3 py-2 text-theme-danger">
                            {msg.content.replace(/^\u26A0\uFE0F?\s*/, "")}
                          </p>
                        ) : (
                          <AiMessageContent content={msg.content.replace(/^\u26A0\uFE0F?\s*/, "")} className="text-theme-foreground/90" />
                        )}

                        {msg.createProposal && (
                          <div className="mt-3 overflow-hidden rounded-xl border border-theme-border bg-theme-panel-strong">
                            <div className="flex items-baseline justify-between gap-2 border-b border-theme-border px-3.5 py-2.5">
                              <p className="text-[12px] font-semibold text-theme-foreground">
                                {tr("ร่างการ์ด", "Draft cards")} · {msg.createProposal.boardName}
                              </p>
                              <span className="font-mono text-[11px] text-theme-muted">
                                {msg.createProposal.cards.length} {tr("ใบ", "items")}
                              </span>
                            </div>
                            <ul className="max-h-44 divide-y divide-theme-border overflow-y-auto">
                              {msg.createProposal.cards.map((card, index) => (
                                <li key={`${card.columnId}-${index}`} className="flex gap-2.5 px-3.5 py-2.5">
                                  <span className="w-4 shrink-0 pt-px text-right font-mono text-[11px] text-theme-muted">
                                    {index + 1}
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[12px] font-medium text-theme-foreground">{card.title}</p>
                                    {card.description && (
                                      <p className="mt-0.5 line-clamp-2 whitespace-pre-wrap text-[11px] text-theme-muted">
                                        {card.description}
                                      </p>
                                    )}
                                    <p className="mt-1 flex flex-wrap gap-x-2 text-[10px] uppercase tracking-wide text-theme-muted">
                                      <span>{card.columnName}</span>
                                      <span>·</span>
                                      <span>{getPriorityMeta(card.priority).label}</span>
                                      <span>·</span>
                                      <span className="normal-case tracking-normal">
                                        {formatProposalDueDate(card.dueDate, card.dueDateAllDay, isEn)}
                                      </span>
                                    </p>
                                  </div>
                                </li>
                              ))}
                            </ul>
                            <div className="flex items-center justify-end gap-2 border-t border-theme-border px-3.5 py-2.5">
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() => cancelCreateProposal(msg.id)}
                              >
                                {tr("ยกเลิกร่าง", "Discard")}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => setConfirmProposalId(msg.id)}
                              >
                                {tr("ตรวจและสร้างการ์ด", "Review & create")}
                              </Button>
                            </div>
                          </div>
                        )}

                        {msg.proposalStatus === "created" && (
                          <p className="mt-3 flex items-center gap-1.5 text-[12px] text-theme-success">
                            <Check className="h-3.5 w-3.5" />
                            {tr(`สร้างการ์ด ${msg.createdCardCount ?? 0} ใบลงบอร์ดแล้ว`, `Created ${msg.createdCardCount ?? 0} card(s) on the board`)}
                          </p>
                        )}
                        {msg.proposalStatus === "cancelled" && (
                          <p className="mt-3 text-[12px] text-theme-muted">{tr("ยกเลิกร่างการ์ดแล้ว", "Draft discarded")}</p>
                        )}

                        <div className="mt-1.5 flex h-6 items-center gap-1 text-[10px] text-theme-muted">
                          <span className="font-mono tabular-nums">{msg.timestamp}</span>
                          {!msg.isError && (
                            <button
                              type="button"
                              onClick={() => handleCopy(msg.content, msg.id)}
                              className="ml-1 flex items-center gap-1 rounded px-1.5 py-0.5 opacity-0 transition hover:bg-theme-paper hover:text-theme-foreground focus:opacity-100 group-hover:opacity-100 cursor-pointer"
                              title={tr("คัดลอกคำตอบ", "Copy response")}
                            >
                              {copiedId === msg.id ? (
                                <Check className="h-3 w-3 text-theme-success" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                              {copiedId === msg.id ? tr("คัดลอกแล้ว", "Copied") : tr("คัดลอก", "Copy")}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Thinking indicator */}
                {isLoading && (
                  <div className="flex gap-3" aria-live="polite">
                    <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border border-theme-border bg-theme-panel-strong">
                      <GeminiSparkleIcon className="h-3.5 w-3.5 animate-spin [animation-duration:2.4s]" />
                    </div>
                    <div className="flex-1 space-y-2 pt-1">
                      <p className="text-[12px] text-theme-muted">{tr("กำลังวิเคราะห์ข้อมูลบอร์ด…", "Analyzing your board…")}</p>
                      <div className="h-2 w-3/4 animate-pulse rounded bg-theme-paper" />
                      <div className="h-2 w-1/2 animate-pulse rounded bg-theme-paper [animation-delay:150ms]" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="shrink-0 px-3 pb-3 pt-2">
            <div className="rounded-xl border border-theme-border bg-theme-background transition-colors focus-within:border-theme-accent/70 focus-within:ring-2 focus-within:ring-theme-accent/15">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={tr("ถาม Retzlo AI เกี่ยวกับงานของคุณ…", "Ask Retzlo AI about your work…")}
                className="block max-h-40 w-full resize-none bg-transparent px-3.5 pt-3 text-[13px] leading-relaxed text-theme-foreground placeholder:text-theme-muted focus:outline-none"
              />
              <div className="flex items-center justify-between gap-2 px-2 pb-2 pl-3.5">
                <span className="truncate text-[10px] text-theme-muted">
                  {tr("Enter ส่ง · Shift+Enter ขึ้นบรรทัด · 1 เครดิต/ข้อความ", "Enter to send · Shift+Enter for newline · 1 credit/msg")}
                </span>
                <button
                  type="button"
                  disabled={!input.trim() || isLoading}
                  onClick={() => handleSend()}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-theme-accent text-theme-background transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:bg-theme-paper disabled:text-theme-muted cursor-pointer"
                  title={tr("ส่งข้อความ", "Send message")}
                  aria-label={tr("ส่งข้อความ", "Send message")}
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(proposalForConfirmation)}
        title={tr("ยืนยันสร้างการ์ดจาก AI?", "Create cards from AI?")}
        message={confirmationSummary}
        confirmLabel={tr("ยืนยันสร้าง", "Create")}
        cancelLabel={tr("กลับไปตรวจรายการ", "Back to review")}
        isLoading={isCreatingCards}
        onConfirm={confirmCreateProposal}
        onClose={() => setConfirmProposalId(null)}
      />
    </>
  );
}
