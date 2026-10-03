"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface AiChatContextValue {
  isOpen: boolean;
  openAiChat: () => void;
  closeAiChat: () => void;
  toggleAiChat: () => void;
  setIsOpen: (open: boolean) => void;
}

const AiChatContext = createContext<AiChatContextValue | null>(null);

export function AiChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openAiChat = useCallback(() => setIsOpen(true), []);
  const closeAiChat = useCallback(() => setIsOpen(false), []);
  const toggleAiChat = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <AiChatContext.Provider
      value={{
        isOpen,
        openAiChat,
        closeAiChat,
        toggleAiChat,
        setIsOpen,
      }}
    >
      {children}
    </AiChatContext.Provider>
  );
}

export function useAiChat(): AiChatContextValue {
  const context = useContext(AiChatContext);
  if (!context) {
    return {
      isOpen: false,
      openAiChat: () => {},
      closeAiChat: () => {},
      toggleAiChat: () => {},
      setIsOpen: () => {},
    };
  }
  return context;
}
