import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { assertProjectMember, requireUserId } from "@/lib/project-auth";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const userId = await requireUserId();

  if (!userId) {
    return jsonError("Please sign in to continue.", 401);
  }

  const membership = await assertProjectMember(params.id, userId);

  if (!membership) {
    return jsonError("You do not have access to this project.", 403);
  }

  const cards = await prisma.card.findMany({
    where: {
      dueDate: { not: null },
      column: {
        board: {
          projectId: params.id
        }
      }
    },
    include: {
      column: {
        select: {
          name: true,
          boardId: true
        }
      }
    },
    orderBy: [{ dueDate: "asc" }, { position: "asc" }]
  });

  return NextResponse.json({ cards });
}
