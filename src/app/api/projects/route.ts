import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/project-auth";

const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional()
});

const defaultColumns = ["Backlog", "In Progress", "Done"];

export async function GET() {
  const userId = await requireUserId();

  if (!userId) {
    return jsonError("Please sign in to continue.", 401);
  }

  const projects = await prisma.project.findMany({
    where: {
      members: {
        some: { userId }
      }
    },
    include: {
      members: {
        where: { userId },
        select: { role: true }
      },
      boards: {
        select: { id: true },
        take: 1,
        orderBy: { createdAt: "asc" }
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const payload = createProjectSchema.parse(await request.json());

    const project = await prisma.project.create({
      data: {
        name: payload.name,
        description: payload.description,
        members: {
          create: {
            userId,
            role: "OWNER"
          }
        },
        boards: {
          create: {
            name: "RETROD Board",
            columns: {
              create: defaultColumns.map((name, position) => ({ name, position }))
            }
          }
        }
      },
      include: {
        boards: {
          select: { id: true },
          take: 1
        }
      }
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return parseError(error);
  }
}
