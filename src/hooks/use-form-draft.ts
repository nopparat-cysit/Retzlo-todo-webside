"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  clearFormDraft,
  loadFormDraft,
  saveFormDraft,
  type FormDraft
} from "@/lib/forms/draft-storage";

interface UseFormDraftOptions<T> {
  draftKey: string;
  currentData: T;
  enabled?: boolean;
  hasMeaningfulData: (data: T) => boolean;
  onRestore: (data: T) => void;
  debounceMs?: number;
}

export function useFormDraft<T>({
  draftKey,
  currentData,
  enabled = true,
  hasMeaningfulData,
  onRestore,
  debounceMs = 400
}: UseFormDraftOptions<T>) {
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [draftTimestamp, setDraftTimestamp] = useState<number | undefined>(undefined);
  const loadedDraftRef = useRef<FormDraft<T> | null>(null);
  const initialCheckedRef = useRef(false);

  // Check for existing draft on initial enable (modal open)
  useEffect(() => {
    if (!enabled) {
      initialCheckedRef.current = false;
      setIsRecoveryOpen(false);
      return;
    }

    if (initialCheckedRef.current) return;
    initialCheckedRef.current = true;

    const existingDraft = loadFormDraft<T>(draftKey);
    if (existingDraft && hasMeaningfulData(existingDraft.data)) {
      loadedDraftRef.current = existingDraft;
      setDraftTimestamp(existingDraft.savedAt);
      setIsRecoveryOpen(true);
    }
  }, [draftKey, enabled, hasMeaningfulData]);

  // Debounced auto-save currentData
  useEffect(() => {
    if (!enabled || isRecoveryOpen) return;

    if (!hasMeaningfulData(currentData)) {
      return;
    }

    const timer = setTimeout(() => {
      saveFormDraft(draftKey, currentData);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [currentData, debounceMs, draftKey, enabled, hasMeaningfulData, isRecoveryOpen]);

  const restoreDraft = useCallback(() => {
    if (loadedDraftRef.current) {
      onRestore(loadedDraftRef.current.data);
    }
    setIsRecoveryOpen(false);
  }, [onRestore]);

  const discardDraft = useCallback(() => {
    clearFormDraft(draftKey);
    loadedDraftRef.current = null;
    setIsRecoveryOpen(false);
  }, [draftKey]);

  const clearDraft = useCallback(() => {
    clearFormDraft(draftKey);
    loadedDraftRef.current = null;
  }, [draftKey]);

  return {
    isRecoveryOpen,
    draftTimestamp,
    restoreDraft,
    discardDraft,
    clearDraft
  };
}
