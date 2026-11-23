import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { projectAppearanceSchema } from "@/lib/projects/appearance";
import { requireUserId } from "@/lib/project-auth";
import { createAuditLog } from "@/lib/audit/audit-logger";
import { getClientIp } from "@/lib/rate-limit";

const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  type: z.enum(["WORK", "DIARY"]).default("WORK")
}).merge(projectAppearanceSchema);

const defaultColumns = [
  { name: "Backlog", defaultCardStatus: "TODO" },
  { name: "In Progress", defaultCardStatus: "DOING" },
  { name: "Done", defaultCardStatus: "DONE" }
];

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
        type: payload.type,
        themeColor: payload.themeColor,
        sticker: payload.sticker,
        members: {
          create: {
            userId,
            role: "OWNER"
          }
        },
        boards: {
          create: {
            name: "Retzlo Board",
            columns: {
              create: defaultColumns.map((column, position) => ({ ...column, position }))
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

    void createAuditLog({
      actorId: userId,
      actorRole: "OWNER",
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || null,
      requestPath: "/api/projects",
      requestMethod: "POST",
      category: "PROJECT",
      action: "PROJECT_CREATED",
      severity: "NOTICE",
      status: "SUCCESS",
      targetType: "PROJECT",
      targetId: project.id,
      targetName: project.name,
      summary: `Created project "${project.name}" (${project.type})`,
      afterState: { id: project.id, name: project.name, type: project.type }
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return parseError(error);
  }
}
