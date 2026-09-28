"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bot,
  Check,
  Copy,
  KeyRound,
  Maximize2,
  MessageSquare,
  Minus,
  PanelRight,
  PanelRightClose,
  RotateCcw,
  Send,
  Sparkles,
  X
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { getAiAuthHeaders, getClientAiModel } from "@/lib/ai/client-key";
import { ApiKeyModal } from "@/components/ai/api-key-modal";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
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

  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"float" | "sidepanel">("float");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [activeModel, setActiveModel] = useState<string>("deepseek-v4-pro");
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
  }, [apiKeyModalOpen]);

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

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAiAuthHeaders()
        },
        body: JSON.stringify({
          messages: payloadMessages,
          projectId: currentProjectId
        })
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          message: data.error || "ไม่สามารถติดต่อ AI ได้ในขณะนี้",
          type: "error"
        });
        const errorMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `⚠️ เกิดข้อผิดพลาด: ${data.error || "กรุณาลองใหม่อีกครั้ง"}`,
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
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
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

  return (
    <>
      {/* ─── Floating Launcher Button at Bottom-Left (สไตล์ Call Center) ─── */}
      {!isOpen && (
        <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 select-none">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 rounded-full border border-dusk-lavender/50 bg-stone-900/90 px-3.5 py-2.5 text-stone-100 shadow-xl shadow-dusk-lavender/10 backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-dusk-lavender hover:bg-stone-900 hover:shadow-dusk-lavender/25 active:scale-95 cursor-pointer dark:bg-ink-950/90"
            title="เปิดแชทผู้ช่วย Retzlo AI (DeepSeek-V4 Pro)"
          >
            <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-dusk-lavender/20 text-dusk-lavender border border-dusk-lavender/40 group-hover:bg-dusk-lavender group-hover:text-stone-950 transition-colors">
              <Bot className="h-4 w-4" />
              {/* Online indicator dot */}
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-stone-950" />
            </div>

            <div className="flex flex-col text-left">
              <span className="text-xs font-bold leading-tight text-stone-100 group-hover:text-dusk-lavender transition-colors flex items-center gap-1">
                AI Chat
                <Sparkles className="h-2.5 w-2.5 text-dusk-amber animate-pulse" />
              </span>
              <span className="text-[10px] font-mono text-stone-400">
                {activeModel.replace("deepseek-", "")}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* ─── AI Chat Window (Supports Float at Bottom-Left & Side Panel like Gemini) ─── */}
      {isOpen && (
        <div
          className={cn(
            "z-50 flex flex-col border border-stone-700/80 bg-stone-950/95 text-stone-100 shadow-2xl backdrop-blur-xl transition-all duration-300",
            viewMode === "float"
              ? "fixed bottom-4 left-4 sm:bottom-6 sm:left-6 w-[360px] sm:w-[420px] h-[560px] max-h-[85vh] rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6"
              : "fixed top-0 right-0 bottom-0 w-[380px] sm:w-[450px] max-w-full border-l border-stone-700/80 rounded-none overflow-hidden animate-in fade-in slide-in-from-right-6"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-stone-900/80 px-4 py-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-dusk-lavender/20 text-dusk-lavender border border-dusk-lavender/40">
                <Bot className="h-4.5 w-4.5" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-stone-950" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-stone-100 flex items-center gap-1">
                  Retzlo AI Assistant
                  <Sparkles className="h-3 w-3 text-dusk-amber" />
                </h3>
                <button
                  type="button"
                  onClick={() => setApiKeyModalOpen(true)}
                  className="inline-flex items-center gap-1 rounded bg-stone-800/80 px-1.5 py-0.2 text-[10px] font-mono text-stone-300 hover:bg-stone-700 hover:text-dusk-lavender transition cursor-pointer"
                  title="คลิกเพื่อสลับโมเดลหรือตั้งค่า API Key"
                >
                  <KeyRound className="h-2.5 w-2.5 text-dusk-lavender" />
                  <span>{activeModel}</span>
                </button>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearChat}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-white/10 hover:text-stone-200 transition cursor-pointer"
                title="ล้างประวัติการสนทนา"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setViewMode(viewMode === "float" ? "sidepanel" : "float")}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-white/10 hover:text-stone-200 transition cursor-pointer"
                title={
                  viewMode === "float"
                    ? "ตรึงแถบข้าง (Side Panel แบบ Gemini ใน Sheets)"
                    : "สลับเป็นกล่องแชทลอย (ซ้ายล่าง)"
                }
              >
                {viewMode === "float" ? (
                  <PanelRight className="h-3.5 w-3.5" />
                ) : (
                  <PanelRightClose className="h-3.5 w-3.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-white/10 hover:text-stone-200 transition cursor-pointer"
                title="ปิดแชท"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Context Tag Banner */}
          {currentProjectId && (
            <div className="bg-dusk-lavender/10 border-b border-dusk-lavender/20 px-3.5 py-1 text-[11px] text-dusk-lavender flex items-center justify-between">
              <span>📍 เชื่อมต่อบริบทโปรเจกต์ปัจจุบัน</span>
              {credits !== null && (
                <span className="font-mono text-[10px] text-stone-400">
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
                        ? "bg-dusk-lavender text-stone-950 font-medium rounded-tr-xs"
                        : "bg-stone-900 border border-stone-800 text-stone-200 rounded-tl-xs"
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
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition p-1 rounded bg-stone-800 text-stone-400 hover:text-stone-200"
                        title="คัดลอกคำตอบ"
                      >
                        {copiedId === msg.id ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1 px-1 font-mono">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {/* Thinking indicator */}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="rounded-2xl rounded-tl-xs bg-stone-900 border border-stone-800 px-3.5 py-2.5 text-stone-400 flex items-center gap-2">
                  <Bot className="h-3.5 w-3.5 text-dusk-lavender animate-pulse" />
                  <span className="text-xs">กำลังคิดและวิเคราะห์...</span>
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-dusk-lavender animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-dusk-lavender animate-bounce [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-dusk-lavender animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick starter chips (shown when 1 message) */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 space-y-1.5">
              <p className="text-[11px] font-semibold text-stone-400">💡 คำถามด่วนที่แนะนำ:</p>
              <div className="flex flex-wrap gap-1.5">
                {STARTER_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="text-left rounded-lg border border-stone-800 bg-stone-900/70 hover:border-dusk-lavender/50 hover:bg-stone-800 px-2.5 py-1 text-[11px] text-stone-300 transition cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Box */}
          <div className="border-t border-white/10 bg-stone-900/90 p-3 shrink-0">
            <div className="relative flex items-center">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="พิมพ์ข้อความคุยกับ AI (Enter เพื่อส่ง)..."
                className="w-full resize-none rounded-xl border border-stone-700 bg-stone-950/80 px-3.5 py-2.5 pr-10 text-xs text-stone-100 placeholder:text-stone-400 focus:border-dusk-lavender focus:outline-none focus:ring-1 focus:ring-dusk-lavender"
              />
              <button
                type="button"
                disabled={!input.trim() || isLoading}
                onClick={() => handleSend()}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-dusk-lavender hover:bg-dusk-lavender/20 disabled:opacity-40 transition cursor-pointer"
                title="ส่งข้อความ"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 text-[10px] text-stone-400 px-1">
              <span>หัก 1 เครดิต / ข้อความ</span>
              <span>{activeModel}</span>
            </div>
          </div>
        </div>
      )}

      {/* Model & Key Configuration Modal */}
      <ApiKeyModal
        open={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        onSaved={() => {
          setActiveModel(getClientAiModel() || "deepseek-v4-pro");
        }}
      />
    </>
  );
}
