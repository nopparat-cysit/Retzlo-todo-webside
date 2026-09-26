"use client";

import PusherClient from "pusher-js";

let pusherClientInstance: PusherClient | null = null;

/**
 * Sanitize channel name according to Pusher's allowed character set:
 * Must only contain [A-Za-z0-9_\-=@,.;]
 */
export function sanitizePusherChannel(channel: string): string {
  return channel.replace(/[^A-Za-z0-9_\-=@,.;]/g, "-");
}

export function getPusherClient(): PusherClient | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (pusherClientInstance) {
    return pusherClientInstance;
  }

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1";

  if (!key) {
    return null;
  }

  try {
    pusherClientInstance = new PusherClient(key, {
      cluster,
      forceTLS: true,
      enabledTransports: ["ws", "wss"],
    });

    return pusherClientInstance;
  } catch (error) {
    console.warn("[Pusher Client] Failed to initialize PusherClient:", error);
    return null;
  }
}

/**
 * Get the current connection socket ID if connected.
 * Used to exclude the sender from receiving their own echoed events.
 */
export function getPusherSocketId(): string | undefined {
  if (!pusherClientInstance) return undefined;
  return pusherClientInstance.connection?.socket_id;
}
