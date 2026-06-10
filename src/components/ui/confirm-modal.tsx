"use client";

import { useRef, useState, useEffect, KeyboardEvent } from "react";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  /** If set, user must type this exact text to enable the confirm button */
  validateText?: string;
  validatePlaceholder?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  validateText,
  validatePlaceholder,
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const [typed, setTyped] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTyped("");
      // Focus the validate input or confirm button after animation
      setTimeout(() => {
        inputRef.current?.focus();
      }, 80);
    }
  }, [open]);

  if (!open) return null;

  const isValid = !validateText || typed === validateText;

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[300] grid place-items-center bg-ink-950/80 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="lofi-panel relative w-full max-w-md rounded-xl p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-4 flex items-start gap-3">
          {variant === "danger" && (
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-500/15 text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2
              id="confirm-modal-title"
              className="text-xl font-semibold text-stone-100"
            >
              {title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-400">
              {message}
            </p>
          </div>
          <button
            className="shrink-0 rounded-md p-1.5 text-stone-500 transition hover:bg-white/10 hover:text-stone-200"
            type="button"
            aria-label="Close"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Validate input */}
        {validateText && (
          <div className="mb-4">
            <p className="mb-2 text-xs text-stone-400">
              Type{" "}
              <span className="font-mono font-semibold text-red-300">
                {validateText}
              </span>{" "}
              to confirm:
            </p>
            <input
              ref={inputRef}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={validatePlaceholder ?? validateText}
              className={cn(
                "h-10 w-full rounded-md border border-white/10 bg-ink-950/50 px-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-dusk-lavender/70 focus:ring-2 focus:ring-dusk-lavender/20",
                typed.length > 0 && typed !== validateText
                  ? "border-red-500/60 focus:border-red-400"
                  : ""
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isValid && !isLoading) onConfirm();
              }}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === "danger" ? "danger" : "primary"}
            disabled={!isValid || isLoading}
            onClick={onConfirm}
          >
            {isLoading ? "Please wait..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
