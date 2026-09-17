"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

export interface UseLiveSyncOptions {
  /**
   * Channel key or keys for cross-tab communication via BroadcastChannel.
   * e.g. "board:cl12345" or ["board:cl12345", "project:pr67890"]
   */
  channelKey?: string | string[];
  /**
   * Polling interval in milliseconds when the tab is focused and visible.
   * Default is 4000ms. Set to 0 to disable polling and rely only on focus/broadcast.
   */
  intervalMs?: number;
  /**
   * Condition to check whether it is currently safe to sync.
   * Return `false` if user is actively dragging or typing in a modal.
   */
  canSync?: () => boolean;
  /**
   * The sync callback to fetch fresh data from the server.
   */
  onSync: () => Promise<void> | void;
  /**
   * Whether live sync is enabled. Default true.
   */
  enabled?: boolean;
}

export function useLiveSync({
  channelKey,
  intervalMs = 4000,
  canSync,
  onSync,
  enabled = true,
}: UseLiveSyncOptions) {
  const onSyncRef = useRef(onSync);
  const canSyncRef = useRef(canSync);
  const isSyncingRef = useRef(false);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const keys = useMemo(() => {
    if (!channelKey) return [];
    return Array.isArray(channelKey) ? channelKey : [channelKey];
  }, [channelKey]);
  const keysRef = useRef(keys);

  // Keep callback refs fresh
  useEffect(() => {
    onSyncRef.current = onSync;
    canSyncRef.current = canSync;
    keysRef.current = keys;
  }, [onSync, canSync, keys]);

  // Safe executor that guards against concurrent syncs and interaction blocks
  const triggerSync = useCallback(async () => {
    if (isSyncingRef.current) return;
    if (canSyncRef.current && !canSyncRef.current()) return;

    isSyncingRef.current = true;
    try {
      await onSyncRef.current();
    } catch {
      // Silent error on background sync to avoid disrupting user
    } finally {
      isSyncingRef.current = false;
    }
  }, []);

  // Broadcast mutation to other tabs on the same device
  const broadcastChange = useCallback((action = "MUTATION") => {
    if (typeof window === "undefined" || keysRef.current.length === 0) return;
    try {
      if (channelRef.current) {
        channelRef.current.postMessage({
          type: "SYNC_EVENT",
          keys: keysRef.current,
          channelKey: keysRef.current[0],
          action,
          timestamp: Date.now()
        });
      }
    } catch {
      // BroadcastChannel unavailable or error
    }
  }, []);

  // Setup BroadcastChannel for cross-tab sync
  useEffect(() => {
    if (!enabled || typeof window === "undefined" || keys.length === 0) return;

    let channel: BroadcastChannel | null = null;
    try {
      if ("BroadcastChannel" in window) {
        channel = new BroadcastChannel("retzlo-live-sync");
        channelRef.current = channel;

        channel.onmessage = (event) => {
          if (event.data?.type === "SYNC_EVENT") {
            const incomingKeys: string[] = Array.isArray(event.data.keys)
              ? event.data.keys
              : (event.data.channelKey ? [event.data.channelKey] : []);
            const hasMatch = incomingKeys.some((k) => keysRef.current.includes(k));
            if (hasMatch) {
              triggerSync();
            }
          }
        };
      }
    } catch {
      // Ignore BroadcastChannel errors (e.g. iframe sandbox)
    }

    return () => {
      if (channel) {
        channel.close();
        channelRef.current = null;
      }
    };
  }, [enabled, keys, triggerSync]);

  // Window Focus & Document Visibility Listeners
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const handleFocus = () => {
      triggerSync();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        triggerSync();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, triggerSync]);

  // Active Polling Interval (pauses when document is hidden)
  useEffect(() => {
    if (!enabled || intervalMs <= 0 || typeof window === "undefined") return;

    const intervalId = window.setInterval(() => {
      // Only poll when the document is currently visible to conserve resources
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }
      triggerSync();
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled, intervalMs, triggerSync]);

  return {
    syncNow: triggerSync,
    broadcastChange,
  };
}
