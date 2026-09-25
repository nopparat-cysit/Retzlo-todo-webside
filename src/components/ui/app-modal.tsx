"use client";

import type { ComponentPropsWithoutRef, KeyboardEvent, MouseEvent, PointerEvent, ReactNode } from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";

import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ModalPortal } from "@/components/ui/modal-portal";
import { cn } from "@/lib/utils";

interface AppModalContextValue {
  requestClose: () => void;
}

const AppModalContext = createContext<AppModalContextValue>({
  requestClose: () => {}
});

export function useAppModal() {
  return useContext(AppModalContext);
}

interface AppModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  labelledBy?: string;
  hasUnsavedChanges?: boolean;
  onDiscard?: () => void;
  discardTitle?: string;
  discardMessage?: string;
  discardConfirmLabel?: string;
  closeOnOverlayClick?: boolean;
}

export function AppModal({
  open,
  onClose,
  children,
  className,
  contentClassName,
  labelledBy,
  hasUnsavedChanges = false,
  onDiscard,
  discardTitle = "Discard changes?",
  discardMessage = "You have unsaved changes. Are you sure you want to discard them?",
  discardConfirmLabel = "Discard changes",
  closeOnOverlayClick = true
}: AppModalProps) {
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);
  const isPointerDownOnOverlayRef = useRef(false);

  useEffect(() => {
    if (!open || !hasUnsavedChanges) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [open, hasUnsavedChanges]);

  if (!open) {
    return null;
  }

  function requestClose() {
    if (hasUnsavedChanges) {
      setIsDiscardConfirmOpen(true);
      return;
    }

    onClose();
  }

  function confirmDiscard() {
    setIsDiscardConfirmOpen(false);
    if (onDiscard) {
      onDiscard();
      return;
    }

    onClose();
  }

  function handleOverlayPointerDown(event: PointerEvent<HTMLDivElement>) {
    event.stopPropagation();
    isPointerDownOnOverlayRef.current = event.target === event.currentTarget;
  }

  function handleOverlayClick(event: MouseEvent<HTMLDivElement>) {
    event.stopPropagation();

    // Only close if the pointer down actually started directly on the overlay backdrop.
    // If user dragged to highlight/copy text inside the modal and released outside, DO NOT close.
    if (isPointerDownOnOverlayRef.current && event.target === event.currentTarget && closeOnOverlayClick) {
      requestClose();
    }
    isPointerDownOnOverlayRef.current = false;
  }

  function stopModalContentEvent(event: PointerEvent<HTMLDivElement> | MouseEvent<HTMLDivElement>) {
    event.stopPropagation();
    isPointerDownOnOverlayRef.current = false;
  }

  function handleModalContentKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    event.stopPropagation();

    if (event.key === "Escape") {
      event.preventDefault();
      requestClose();
    }
  }

  return (
    <ModalPortal>
      <div
        className={cn(
          "fixed inset-0 z-[1000] flex items-end sm:items-center justify-center overflow-y-auto scroll-touch bg-ink-950/80 p-0 sm:p-4 md:py-6 backdrop-blur-sm",
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onPointerDown={handleOverlayPointerDown}
        onClick={handleOverlayClick}
        onKeyDown={handleModalContentKeyDown}
      >
        <div
          className={cn("motion-dialog-content relative w-full", contentClassName)}
          onPointerDown={stopModalContentEvent}
          onClick={stopModalContentEvent}
          onKeyDown={handleModalContentKeyDown}
        >
          <AppModalContext.Provider value={{ requestClose }}>
            {children}
          </AppModalContext.Provider>
        </div>
      </div>

      <ConfirmModal
        open={isDiscardConfirmOpen}
        title={discardTitle}
        message={discardMessage}
        confirmLabel={discardConfirmLabel}
        variant="danger"
        onConfirm={confirmDiscard}
        onClose={() => setIsDiscardConfirmOpen(false)}
      />
    </ModalPortal>
  );
}

export function AppModalFooter({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("flex justify-end gap-2 border-t border-white/10 p-3.5 sm:p-5 pb-safe", className)} {...props} />;
}
