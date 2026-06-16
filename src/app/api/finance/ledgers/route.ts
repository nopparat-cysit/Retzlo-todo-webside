import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/project-auth";

const createLedgerSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  color: z.string().optional().nullable()
});

export async function GET() {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const ledgers = await prisma.financeLedger.findMany({
      where: { userId },
      orderBy: { name: "asc" }
    });

    return NextResponse.json({ ledgers });
  } catch (error) {
    return parseError(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const payload = createLedgerSchema.parse(await request.json());

    // Check duplicate name case-insensitively
    const existing = await prisma.financeLedger.findFirst({
      where: {
        userId,
        name: { equals: payload.name, mode: "insensitive" }
      }
    });

    if (existing) {
      return jsonError("A ledger with this name already exists.", 400);
    }

    const ledger = await prisma.financeLedger.create({
      data: {
        name: payload.name,
        color: payload.color ?? "DEFAULT",
        userId
      }
    });

    return NextResponse.json({ ledger }, { status: 201 });
  } catch (error) {
    return parseError(error);
  }
}
