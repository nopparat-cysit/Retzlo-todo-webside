import Pusher from "pusher";

let pusherServerInstance: Pusher | null = null;

/**
 * Sanitize channel name according to Pusher's allowed character set:
 * Must only contain [A-Za-z0-9_\-=@,.;]
 */
export function sanitizePusherChannel(channel: string): string {
  return channel.replace(/[^A-Za-z0-9_\-=@,.;]/g, "-");
}

export function getPusherServer(): Pusher | null {
  if (pusherServerInstance) {
    return pusherServerInstance;
  }

  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER || process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1";

  if (!appId || !key || !secret) {
    return null;
  }

  try {
    pusherServerInstance = new Pusher({
      appId,
      key,
      secret,
      cluster,
      useTLS: true,
    });
    return pusherServerInstance;
  } catch (error) {
    console.warn("[Pusher Server] Failed to initialize instance:", error);
    return null;
  }
}

export interface PusherTriggerOptions {
  socketId?: string;
}

/**
 * Safely trigger a Pusher event across one or multiple channels.
 * Returns true if sent successfully, or false if Pusher is not configured / failed.
 * Guaranteed never to throw an unhandled error to preserve database transaction safety.
 */
export async function triggerPusherEvent(
  channels: string | string[],
  event: string,
  data: Record<string, unknown>,
  options?: PusherTriggerOptions
): Promise<boolean> {
  const pusher = getPusherServer();
  if (!pusher) {
    return false;
  }

  const channelList = Array.isArray(channels) ? channels : [channels];
  const sanitizedChannels = channelList
    .map(sanitizePusherChannel)
    .filter(Boolean);

  if (sanitizedChannels.length === 0) {
    return false;
  }

  try {
    const triggerParams = options?.socketId ? { socket_id: options.socketId } : undefined;
    await pusher.trigger(sanitizedChannels, event, data, triggerParams);
    return true;
  } catch (error) {
    // Graceful degradation: Log warning without breaking calling request
    console.warn("[Pusher Server] Failed to trigger event:", event, error);
    return false;
  }
}
