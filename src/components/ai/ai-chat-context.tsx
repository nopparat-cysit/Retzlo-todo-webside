"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type AiChatViewMode = "sidepanel" | "float";

interface AiChatContextValue {
  isOpen: boolean;
  openAiChat: () => void;
  closeAiChat: () => void;
  toggleAiChat: () => void;
  setIsOpen: (open: boolean) => void;
  viewMode: AiChatViewMode;
  setViewMode: (mode: AiChatViewMode) => void;
  isSmallScreen: boolean;
}

const AiChatContext = createContext<AiChatContextValue | null>(null);

export function AiChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  // Default to "sidepanel" initially as requested
  const [viewMode, setViewModeState] = useState<AiChatViewMode>("sidepanel");
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Sync isSmallScreen with window width (< 1024px)
  useEffect(() => {
    function checkScreen() {
      setIsSmallScreen(window.innerWidth < 1024);
    }
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const openAiChat = useCallback(() => setIsOpen(true), []);
  const closeAiChat = useCallback(() => setIsOpen(false), []);
  const toggleAiChat = useCallback(() => setIsOpen((prev) => !prev), []);

  const setViewMode = useCallback((mode: AiChatViewMode) => {
    setViewModeState(mode);
  }, []);

  return (
    <AiChatContext.Provider
      value={{
        isOpen,
        openAiChat,
        closeAiChat,
        toggleAiChat,
        setIsOpen,
        viewMode,
        setViewMode,
        isSmallScreen,
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
      viewMode: "sidepanel",
      setViewMode: () => {},
      isSmallScreen: false,
    };
  }
  return context;
}
