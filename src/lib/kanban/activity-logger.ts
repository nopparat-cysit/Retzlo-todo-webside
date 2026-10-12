import { prisma } from "@/lib/prisma";
import { triggerPusherEvent } from "@/lib/pusher/server";

export interface LogBoardActivityParams {
  boardId: string;
  userId: string;
  cardId?: string | null;
  action:
    | "CARD_CREATED"
    | "CARD_MOVED"
    | "CARD_UPDATED"
    | "CARD_ARCHIVED"
    | "CARD_RESTORED"
    | "CARD_DELETED"
    | "ATTACHMENT_ADDED"
    | "ATTACHMENT_REMOVED";
  details?: Record<string, unknown>;
}

/**
 * Persists an activity log entry to the database and broadcasts
 * a live update event via Pusher for instant real-time sync.
 */
export async function logBoardActivity({
  boardId,
  userId,
  cardId,
  action,
  details
}: LogBoardActivityParams) {
  try {
    const activity = await prisma.boardActivity.create({
      data: {
        boardId,
        userId,
        cardId: cardId || null,
        action,
        details: (details as any) || {}
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    // Broadcast live event to board activity channel
    void triggerPusherEvent(
      [`retzlo-board-${boardId}-activity`, `retzlo-board-${boardId}`],
      "retzlo:sync",
      {
        action: "BOARD_ACTIVITY",
        activity: {
          id: activity.id,
          boardId: activity.boardId,
          userId: activity.userId,
          cardId: activity.cardId,
          action: activity.action,
          details: activity.details,
          createdAt: activity.createdAt.toISOString(),
          user: (activity as any).user
        }
      }
    );

    return activity;
  } catch (error) {
    // Non-blocking: failure to write an activity log should not break main user mutation
    console.warn("[logBoardActivity] Failed to record activity:", error);
    return null;
  }
}
