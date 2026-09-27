import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { assertProjectMember, canAccessBoard, requireUserId } from "@/lib/project-auth";
import { extractAssigneeIds } from "@/lib/kanban/assignees";
import {
  canUserCheerCard,
  extractCardCoffeeCheers,
  withCardCoffeeCheer
} from "@/lib/kanban/coffee-cheers";
import { triggerPusherEvent } from "@/lib/pusher/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getCardWithAccess(cardId: string, userId: string) {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: {
      column: {
        include: {
          board: {
            include: {
              members: { select: { userId: true } }
            }
          }
        }
      }
    }
  });

  if (!card) {
    return { ok: false as const, error: "Card not found.", status: 404 };
  }

  const projectId = card.column.board.projectId;
  const membership = await assertProjectMember(projectId, userId);

  if (!membership) {
    return { ok: false as const, error: "You do not have access to this project.", status: 403 };
  }

  if (!canAccessBoard(card.column.board, userId, membership.role)) {
    return { ok: false as const, error: "You do not have access to this board.", status: 403 };
  }

  return { ok: true as const, card, membership, projectId };
}

export async function GET(_request: Request, { params }: { params: { cardId: string } }) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const access = await getCardWithAccess(params.cardId, userId);
    if (!access.ok) {
      return jsonError(access.error, access.status);
    }

    const { count, userIds, cheers } = extractCardCoffeeCheers(access.card.privateCoins);
    const { canCheer, reason } = canUserCheerCard({
      cardStatus: access.card.status,
      privateCoins: access.card.privateCoins,
      currentUserId: userId
    });

    return NextResponse.json({
      cardId: params.cardId,
      status: access.card.status,
      count,
      userIds,
      cheers,
      canCheer,
      reason
    });
  } catch (error) {
    return parseError(error);
  }
}

export async function POST(_request: Request, { params }: { params: { cardId: string } }) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const access = await getCardWithAccess(params.cardId, userId);
    if (!access.ok) {
      return jsonError(access.error, access.status);
    }

    const check = canUserCheerCard({
      cardStatus: access.card.status,
      privateCoins: access.card.privateCoins,
      currentUserId: userId
    });

    if (!check.canCheer) {
      if (check.reason === "SELF_CHEER_FORBIDDEN") {
        return jsonError("Anti-Cheat: You cannot buy coffee for your own completed task.", 403);
      }
      if (check.reason === "ALREADY_CHEERED") {
        return jsonError("You have already bought a coffee for this completed task.", 400);
      }
      if (check.reason === "NOT_DONE") {
        return jsonError("Coffee can only be gifted to completed tasks in the DONE column.", 400);
      }
      return jsonError("Cannot cheer this task.", 400);
    }

    // Retrieve cheerer user info for notification and display
    const cheererUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    });
    const cheererName = cheererUser?.name?.trim() || cheererUser?.email?.trim() || "A teammate";

    const nextCoins = withCardCoffeeCheer(access.card.privateCoins, userId, cheererName);

    await prisma.card.update({
      where: { id: params.cardId },
      data: {
        privateCoins: nextCoins as object
      }
    });

    const cheersData = extractCardCoffeeCheers(nextCoins);
    const assigneeIds = extractAssigneeIds(access.card.privateCoins);
    const notificationRecipients = assigneeIds.filter((id) => id !== userId);

    if (notificationRecipients.length > 0) {
      try {
        await prisma.notification.createMany({
          data: notificationRecipients.map((recipientId) => ({
            id: randomUUID(),
            userId: recipientId,
            projectId: access.projectId,
            cardId: params.cardId,
            type: "COFFEE_CHEER",
            title: `☕ Coffee from ${cheererName}!`,
            message: `${cheererName} treated you to a coffee for completing "${access.card.title}"! 🎉`,
            link: `/project/${access.projectId}/board?cardId=${params.cardId}`
          }))
        });

        triggerPusherEvent(
          ["retzlo-notifications"],
          "retzlo:sync",
          { action: "NEW_NOTIFICATION" }
        );
      } catch (notifErr) {
        console.error("Failed to deliver coffee cheer notification:", notifErr);
      }
    }

    // Synchronize board/card coffee count
    triggerPusherEvent(
      [
        `retzlo-project-${access.projectId}`,
        `retzlo-project:${access.projectId}`,
        `retzlo-board:${access.card.column.boardId}`
      ],
      "retzlo:sync",
      {
        action: "COFFEE_CHEERS",
        cardId: params.cardId,
        count: cheersData.count,
        userIds: cheersData.userIds
      }
    );

    return NextResponse.json({
      ok: true,
      count: cheersData.count,
      userIds: cheersData.userIds,
      cheers: cheersData.cheers
    });
  } catch (error) {
    return parseError(error);
  }
}
