import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/project-auth";

const updateLedgerSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long").optional(),
  color: z.string().optional().nullable()
});

export async function PATCH(
  request: Request,
  { params }: { params: { ledgerId: string } }
) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const { ledgerId } = params;

    // Verify ownership
    const ledger = await prisma.financeLedger.findUnique({
      where: { id: ledgerId }
    });

    if (!ledger || ledger.userId !== userId) {
      return jsonError("Ledger not found or unauthorized.", 404);
    }

    const payload = updateLedgerSchema.parse(await request.json());

    // Check duplicate name case-insensitively
    if (payload.name) {
      const duplicate = await prisma.financeLedger.findFirst({
        where: {
          userId,
          name: { equals: payload.name, mode: "insensitive" },
          id: { not: ledgerId }
        }
      });
      if (duplicate) {
        return jsonError("A ledger with this name already exists.", 400);
      }
    }

    const updated = await prisma.financeLedger.update({
      where: { id: ledgerId },
      data: {
        name: payload.name ?? undefined,
        color: payload.color
      }
    });

    return NextResponse.json({ ledger: updated });
  } catch (error) {
    return parseError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { ledgerId: string } }
) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const { ledgerId } = params;

    // Verify ownership
    const ledger = await prisma.financeLedger.findUnique({
      where: { id: ledgerId }
    });

    if (!ledger || ledger.userId !== userId) {
      return jsonError("Ledger not found or unauthorized.", 404);
    }

    const totalLedgers = await prisma.financeLedger.count({
      where: { userId }
    });
    if (totalLedgers <= 1) {
      return jsonError("You must keep at least one ledger book.", 400);
    }

    await prisma.financeLedger.delete({
      where: { id: ledgerId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return parseError(error);
  }
}
