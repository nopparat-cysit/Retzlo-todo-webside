"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bot,
  Check,
  Copy,
  PanelRight,
  PanelRightClose,
  RotateCcw,
  Send,
  Sparkles,
  X
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useToast } from "@/components/ui/toast";
import { useAiChat } from "@/components/ai/ai-chat-context";
import { getAiAuthHeaders, getClientAiModel } from "@/lib/ai/client-key";
import type { AiCreateCardProposal } from "@/lib/ai/chat-actions";
import { GeminiSparkleIcon } from "@/components/ai/gemini-sparkle-icon";
import { getPriorityMeta } from "@/lib/kanban/priority";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
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

function formatProposalDueDate(value: string | null, allDay: boolean) {
  if (!value) return "ไม่กำหนดวัน";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "วันที่ไม่ถูกต้อง";
  return allDay
    ? date.toLocaleDateString("th-TH", { dateStyle: "medium" })
    : date.toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" });
}

const STARTER_PROMPTS = [
  "📊 สรุปสถานะและความคืบหน้าของบอร์ดนี้ให้หน่อย",
  "💡 มีงานอะไรที่ควรทำเป็นลำดับถัดไปบ้าง?",
  "⚠️ ตรวจสอบงานที่ใกล้กำหนดหรือเลยกำหนดให้หน่อย",
  "📝 ช่วยคิดและร่างขั้นตอนสำหรับงานใหม่"
];

export function AiChatWidget() {
  const pathname = usePathname();
  const { toast } = useToast();

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
      const storageKey = currentProjectId
        ? `retzlo_ai_chat_${currentProjectId}`
        : "retzlo_ai_chat_global";
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content:
              "สวัสดีครับ! ผม **Retzlo AI** ผู้ช่วยวางแผนงานของคุณ 🤖✨\n\nสอบถามเกี่ยวกับงานในบอร์ด ปรึกษาขั้นตอนการทำงาน หรือให้ผมช่วยวิเคราะห์ความคืบหน้าได้ตลอดเวลาเลยครับ",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);
      }
    } catch {
      // Ignore storage error
    }
  }, [currentProjectId]);

  // Save chat history to sessionStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        const storageKey = currentProjectId
          ? `retzlo_ai_chat_${currentProjectId}`
          : "retzlo_ai_chat_global";
        sessionStorage.setItem(storageKey, JSON.stringify(messages));
      } catch {
        // Ignore
      }
    }
  }, [messages, currentProjectId]);

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

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const payloadMessages = nextMessages
        .filter((m) => m.id !== "welcome")
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
          ? "AI ตอบกลับช้าเกินกำหนดของเซิร์ฟเวอร์ (Timeout) — ลองส่งข้อความสั้นลงหรือลองใหม่"
          : `เซิร์ฟเวอร์ตอบกลับผิดปกติ (HTTP ${res.status})`;
        toast({ message: errorMsg, type: "error" });
        const errorMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `⚠️ ${errorMsg}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages((prev) => [...prev, errorMessage]);
        return;
      }

      if (!res.ok) {
        const errMsg = (data.error as string) || "ไม่สามารถติดต่อ AI ได้ในขณะนี้";
        toast({
          message: errMsg,
          type: "error"
        });
        const errorMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `⚠️ เกิดข้อผิดพลาด: ${errMsg}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages((prev) => [...prev, errorMessage]);
        return;
      }

      if (typeof data.remainingCredits === "number") {
        setCredits(data.remainingCredits);
      }

      const botReply: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply || "ขออภัยครับ ไม่พบคำตอบจากระบบ AI",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        ...(data.createProposal ? { createProposal: data.createProposal } : {})
      };

      setMessages((prev) => [...prev, botReply]);
    } catch {
      toast({
        message: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์",
        type: "error"
      });
      const netErrorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "⚠️ ไม่สามารถเชื่อมต่อกับ AI Server ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่ครับ",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, netErrorMessage]);
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
        throw new Error(data.error || "สร้างการ์ดไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
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
      toast({ message: `เพิ่มการ์ด ${createdCount} ใบลงบอร์ดแล้ว`, type: "success" });
    } catch (error) {
      toast({
        message: error instanceof Error ? error.message : "สร้างการ์ดไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
        type: "error"
      });
    } finally {
      createRequestInFlightRef.current = false;
      setIsCreatingCards(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    const welcome: ChatMessage = {
      id: "welcome",
      role: "assistant",
      content:
        "สวัสดีครับ! เริ่มต้นบทสนทนาใหม่เรียบร้อย มีอะไรให้ **Retzlo AI** ช่วยดูแลเกี่ยวกับงานหรือบอร์ดนี้ไหมครับ?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages([welcome]);
    try {
      const storageKey = currentProjectId
        ? `retzlo_ai_chat_${currentProjectId}`
        : "retzlo_ai_chat_global";
      sessionStorage.removeItem(storageKey);
    } catch {
      // Ignore
    }
    toast({ message: "ล้างประวัติการสนทนาเรียบร้อย", type: "info" });
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast({ message: "คัดลอกข้อความแล้ว", type: "success" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Do not render on public auth pages
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";
  if (isAuthPage) return null;

  const proposalForConfirmation = messages.find((message) =>
    message.id === confirmProposalId
  )?.createProposal;
  const confirmationSummary = proposalForConfirmation
    ? `ยืนยันสร้าง ${proposalForConfirmation.cards.length} การ์ดลงบอร์ด “${proposalForConfirmation.boardName}” หรือไม่? รายการ: ${proposalForConfirmation.cards.map((card) => card.title).join("、")}`
    : "";

  return (
    <>
      {/* ─── AI Chat Window (Supports Float at Bottom-Right & Side Panel like Gemini) ─── */}
      {isOpen && (
        <div
          className={cn(
            "z-50 flex flex-col border border-theme-border bg-theme-panel text-theme-foreground shadow-2xl backdrop-blur-xl transition-all duration-300",
            viewMode === "float" || isSmallScreen
              ? "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[min(calc(100vw-2rem),420px)] h-[560px] max-h-[85vh] rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6"
              : "fixed top-0 right-0 bottom-0 w-[380px] sm:w-[450px] max-w-full border-l border-theme-border rounded-none overflow-hidden animate-in fade-in slide-in-from-right-6"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-theme-border bg-theme-panel-strong px-4 py-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-theme-border bg-theme-paper text-theme-accent">
                <GeminiSparkleIcon className="h-4.5 w-4.5" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-theme-success ring-2 ring-theme-panel-strong" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-theme-foreground flex items-center gap-1">
                  Retzlo AI Assistant
                  <Sparkles className="h-3 w-3 text-theme-warning" />
                </h3>
                <p className="text-[10px] text-theme-muted font-medium">
                  {activeModel === "deepseek-flash" ? "Fast Mode" : "Ready • ผู้ช่วยอัจฉริยะ"}
                </p>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearChat}
                className="rounded-lg p-1.5 text-theme-muted hover:bg-theme-paper hover:text-theme-foreground transition cursor-pointer"
                title="ล้างประวัติการสนทนา"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              {!isSmallScreen && (
                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === "float" ? "sidepanel" : "float")}
                  className="rounded-lg p-1.5 text-theme-muted hover:bg-theme-paper hover:text-theme-foreground transition cursor-pointer"
                  title={
                    viewMode === "float"
                      ? "ตรึงแถบข้าง (Side Panel แบบ Gemini ใน Sheets)"
                      : "สลับเป็นกล่องแชทลอย (ขวาล่าง)"
                  }
                >
                  {viewMode === "float" ? (
                    <PanelRight className="h-3.5 w-3.5" />
                  ) : (
                    <PanelRightClose className="h-3.5 w-3.5" />
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-theme-muted hover:bg-theme-paper hover:text-theme-foreground transition cursor-pointer"
                title="ปิดแชท"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Context Tag Banner */}
          {currentProjectId && (
            <div className="border-b border-theme-border bg-theme-paper px-3.5 py-1 text-[11px] text-theme-accent flex items-center justify-between">
              <span>📍 เชื่อมต่อบริบทโปรเจกต์ปัจจุบัน</span>
              {credits !== null && (
                <span className="font-mono text-[10px] text-theme-muted">
                  {credits} cr
                </span>
              )}
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={cn("flex flex-col group", isUser ? "items-end" : "items-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed break-words shadow-xs relative",
                      isUser
                        ? "bg-theme-accent text-theme-background font-medium rounded-tr-xs"
                        : "bg-theme-panel-strong border border-theme-border text-theme-foreground rounded-tl-xs"
                    )}
                  >
                    {/* Message formatting */}
                    <div className="whitespace-pre-wrap font-sans">
                      {msg.content}
                    </div>

                    {/* Copy action for assistant messages */}
                    {!isUser && msg.id !== "welcome" && (
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition p-1 rounded bg-theme-paper text-theme-muted hover:text-theme-foreground"
                        title="คัดลอกคำตอบ"
                      >
                        {copiedId === msg.id ? (
                          <Check className="h-3 w-3 text-theme-success" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] text-theme-muted mt-1 px-1 font-mono">
                    {msg.timestamp}
                  </span>
                  {msg.createProposal && (
                    <div className="mt-2 w-full max-w-[85%] rounded-xl border border-stone-700 bg-stone-900 p-3 shadow-sm">
                      <p className="text-xs font-semibold text-stone-100">
                        ร่างการ์ด {msg.createProposal.cards.length} ใบ · {msg.createProposal.boardName}
                      </p>
                      <p className="mt-1 text-[11px] text-stone-400">
                        ตรวจรายการ แล้วกดยืนยันก่อนบันทึกลงระบบ
                      </p>
                      <ul className="mt-2 max-h-36 space-y-2 overflow-y-auto">
                        {msg.createProposal.cards.map((card, index) => (
                          <li
                            key={`${card.columnId}-${index}`}
                            className="rounded-lg border border-stone-700 bg-stone-950 px-2.5 py-2"
                          >
                            <p className="text-xs font-medium text-stone-100">
                              {index + 1}. {card.title}
                            </p>
                            {card.description && (
                              <p className="mt-1 whitespace-pre-wrap text-[11px] text-stone-300">
                                {card.description}
                              </p>
                            )}
                            <p className="mt-1 text-[10px] text-stone-400">
                              {card.columnName} · ความสำคัญ {getPriorityMeta(card.priority).label} · {formatProposalDueDate(card.dueDate, card.dueDateAllDay)}
                            </p>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => setConfirmProposalId(msg.id)}
                        >
                          ตรวจรายการและยืนยัน
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => cancelCreateProposal(msg.id)}
                        >
                          ยกเลิกร่าง
                        </Button>
                      </div>
                    </div>
                  )}
                  {msg.proposalStatus === "created" && (
                    <p className="mt-2 rounded-lg border border-emerald-700/50 bg-emerald-950/40 px-3 py-2 text-[11px] text-emerald-300">
                      สร้างการ์ด {msg.createdCardCount ?? 0} ใบลงบอร์ดแล้ว
                    </p>
                  )}
                  {msg.proposalStatus === "cancelled" && (
                    <p className="mt-2 text-[11px] text-stone-400">ยกเลิกร่างการ์ดแล้ว</p>
                  )}
                </div>
              );
            })}

            {/* Thinking indicator */}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="rounded-2xl rounded-tl-xs bg-theme-panel-strong border border-theme-border px-3.5 py-2.5 text-theme-muted flex items-center gap-2">
                  <Bot className="h-3.5 w-3.5 text-theme-accent animate-pulse" />
                  <span className="text-xs">กำลังคิดและวิเคราะห์...</span>
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-theme-accent animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-theme-accent animate-bounce [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-theme-accent animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick starter chips (shown when 1 message) */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 space-y-1.5">
              <p className="text-[11px] font-semibold text-theme-muted">💡 คำถามด่วนที่แนะนำ:</p>
              <div className="flex flex-wrap gap-1.5">
                {STARTER_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="text-left rounded-lg border border-theme-border bg-theme-paper hover:border-theme-accent hover:bg-theme-paper-strong px-2.5 py-1 text-[11px] text-theme-muted hover:text-theme-foreground transition cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Box */}
          <div className="border-t border-theme-border bg-theme-panel-strong p-3 shrink-0">
            <div className="relative flex items-center">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="พิมพ์ข้อความคุยกับ AI (Enter เพื่อส่ง)..."
                className="w-full resize-none rounded-xl border border-theme-border bg-theme-background px-3.5 py-2.5 pr-10 text-xs text-theme-foreground placeholder:text-theme-muted focus:border-theme-accent focus:outline-none focus:ring-1 focus:ring-theme-accent"
              />
              <button
                type="button"
                disabled={!input.trim() || isLoading}
                onClick={() => handleSend()}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-theme-accent hover:bg-theme-paper disabled:opacity-40 transition cursor-pointer"
                title="ส่งข้อความ"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 text-[10px] text-theme-muted px-1">
              <span>หัก 1 เครดิต / ข้อความ</span>
              <span>{activeModel}</span>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(proposalForConfirmation)}
        title="ยืนยันสร้างการ์ดจาก AI?"
        message={confirmationSummary}
        confirmLabel="ยืนยันสร้าง"
        cancelLabel="กลับไปตรวจรายการ"
        isLoading={isCreatingCards}
        onConfirm={confirmCreateProposal}
        onClose={() => setConfirmProposalId(null)}
      />
    </>
  );
}
