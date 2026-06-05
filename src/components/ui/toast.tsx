"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastOptions {
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (opts: ToastOptions) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

// ─── Single Toast ─────────────────────────────────────────────────────────────

const TOAST_DURATION = 3500;

const typeStyles: Record<
  ToastType,
  { bar: string; icon: string; text: string; glow: string; bg: string }
> = {
  success: {
    bg: "bg-ink-900/90",
    bar: "bg-dusk-amber",
    icon: "✦",
    text: "text-dusk-amber",
    glow: "shadow-[0_0_24px_rgba(229,189,114,0.18)]",
  },
  error: {
    bg: "bg-red-950/80",
    bar: "bg-red-400",
    icon: "✕",
    text: "text-red-200",
    glow: "shadow-[0_0_24px_rgba(248,113,113,0.14)]",
  },
  info: {
    bg: "bg-ink-900/90",
    bar: "bg-dusk-lavender",
    icon: "◈",
    text: "text-dusk-lavender",
    glow: "shadow-[0_0_24px_rgba(169,162,255,0.18)]",
  },
  warning: {
    bg: "bg-ink-900/90",
    bar: "bg-dusk-rose",
    icon: "⚠",
    text: "text-dusk-rose",
    glow: "shadow-[0_0_24px_rgba(213,154,179,0.18)]",
  },
};

interface ToastProps {
  item: ToastItem;
  onDismiss: (id: string) => void;
}

export function Toast({ item, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoveredRef = useRef(false);

  const dismiss = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => onDismiss(item.id), 320);
  }, [exiting, item.id, onDismiss]);

  const startTimer = useCallback(() => {
    timerRef.current = setTimeout(dismiss, TOAST_DURATION);
  }, [dismiss]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Slide in
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    startTimer();
    return () => {
      cancelAnimationFrame(raf);
      clearTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const styles = typeStyles[item.type];

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      onMouseEnter={() => {
        hoveredRef.current = true;
        clearTimer();
      }}
      onMouseLeave={() => {
        hoveredRef.current = false;
        startTimer();
      }}
      className={cn(
        // base
        "relative flex w-80 max-w-[calc(100vw-2rem)] items-start gap-3 overflow-hidden rounded-lg border border-white/10 px-4 py-3 backdrop-blur-md transition-all duration-300",
        styles.bg,
        styles.glow,
        // enter
        visible && !exiting
          ? "translate-x-0 opacity-100"
          : "translate-x-10 opacity-0"
      )}
    >
      {/* Lofi scanline texture overlay */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-lg opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.55) 0, rgba(255,255,255,0.55) 1px, transparent 1px, transparent 4px)",
          mixBlendMode: "screen",
        }}
      />

      {/* Left accent bar */}
      <span
        aria-hidden="true"
        className={cn("absolute inset-y-0 left-0 w-0.5 rounded-l-lg", styles.bar)}
      />

      {/* Icon */}
      <span
        aria-hidden="true"
        className={cn("mt-px shrink-0 text-sm font-bold leading-none", styles.text)}
      >
        {styles.icon}
      </span>

      {/* Message */}
      <p className="flex-1 text-sm leading-snug text-stone-100">{item.message}</p>

      {/* Dismiss */}
      <button
        onClick={dismiss}
        aria-label="Dismiss notification"
        className={cn(
          "ml-1 shrink-0 rounded p-0.5 opacity-60 transition hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-dusk-lavender",
          styles.text
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 14 14"
          fill="currentColor"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path d="M2.22 2.22a.75.75 0 011.06 0L7 5.94l3.72-3.72a.75.75 0 111.06 1.06L8.06 7l3.72 3.72a.75.75 0 11-1.06 1.06L7 8.06l-3.72 3.72a.75.75 0 01-1.06-1.06L5.94 7 2.22 3.28a.75.75 0 010-1.06z" />
        </svg>
      </button>
    </div>
  );
}

// ─── Provider ────────────────────────────────────────────────────────────────

const MAX_TOASTS = 4;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback(({ message, type }: ToastOptions) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => {
      const next = [...prev, { id, message, type }];
      return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next;
    });
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}

      {/* Toast stack — fixed bottom-right */}
      <div
        aria-label="Notifications"
        className="pointer-events-none fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-2"
      >
        {toasts.map((item) => (
          <div key={item.id} className="pointer-events-auto">
            <Toast item={item} onDismiss={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
