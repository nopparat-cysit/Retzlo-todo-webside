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
  isDirty?: boolean;
  hasMeaningfulData: (data: T) => boolean;
  isDraftEqualInitial?: (data: T) => boolean;
  onRestore: (data: T) => void;
  debounceMs?: number;
}

export function useFormDraft<T>({
  draftKey,
  currentData,
  enabled = true,
  isDirty = true,
  hasMeaningfulData,
  isDraftEqualInitial,
  onRestore,
  debounceMs = 400
}: UseFormDraftOptions<T>) {
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [draftTimestamp, setDraftTimestamp] = useState<number | undefined>(undefined);
  const loadedDraftRef = useRef<FormDraft<T> | null>(null);
  const lastCheckedKeyRef = useRef<string | null>(null);

  // Check for existing draft on initial enable (modal open) or when draftKey changes
  useEffect(() => {
    if (!enabled) {
      lastCheckedKeyRef.current = null;
      setIsRecoveryOpen(false);
      return;
    }

    if (lastCheckedKeyRef.current === draftKey) return;
    lastCheckedKeyRef.current = draftKey;

    const existingDraft = loadFormDraft<T>(draftKey);
    if (existingDraft && hasMeaningfulData(existingDraft.data)) {
      // If the stored draft is identical to initial pristine data, discard it immediately
      if (isDraftEqualInitial && isDraftEqualInitial(existingDraft.data)) {
        clearFormDraft(draftKey);
        loadedDraftRef.current = null;
        setIsRecoveryOpen(false);
        return;
      }

      loadedDraftRef.current = existingDraft;
      setDraftTimestamp(existingDraft.savedAt);
      setIsRecoveryOpen(true);
    }
  }, [draftKey, enabled, hasMeaningfulData, isDraftEqualInitial]);

  // Debounced auto-save currentData (only when form is dirty / modified)
  useEffect(() => {
    if (!enabled || isRecoveryOpen) return;

    // Do NOT auto-save pristine/clean data
    if (isDirty === false) {
      return;
    }

    if (!hasMeaningfulData(currentData)) {
      return;
    }

    const timer = setTimeout(() => {
      saveFormDraft(draftKey, currentData);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [currentData, debounceMs, draftKey, enabled, hasMeaningfulData, isDirty, isRecoveryOpen]);

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
