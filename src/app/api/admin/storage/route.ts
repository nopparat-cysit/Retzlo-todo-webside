import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { requireAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { recordAdminAudit } from "@/lib/admin-system-state";
import { createAuditLog } from "@/lib/audit/audit-logger";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const admin = await requireAdminUser();
    if (!admin) {
      return jsonError("Not Found", 404);
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";

    const whereClause: Record<string, unknown> = {};
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { fileType: { contains: search, mode: "insensitive" } }
      ];
    }

    const [total, attachments, sizeAggregation] = await Promise.all([
      prisma.cardAttachment.count({ where: whereClause }),
      prisma.cardAttachment.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          },
          card: {
            select: {
              id: true,
              title: true,
              column: {
                select: {
                  name: true,
                  board: {
                    select: {
                      id: true,
                      name: true,
                      project: {
                        select: {
                          id: true,
                          name: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }),
      prisma.cardAttachment.aggregate({
        _sum: { size: true }
      })
    ]);

    const totalBytes = sizeAggregation._sum.size || 0;
    const totalMb = (totalBytes / (1024 * 1024)).toFixed(2);

    return NextResponse.json({
      attachments,
      total,
      totalBytes,
      totalMb
    });
  } catch (error) {
    return parseError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await requireAdminUser();
    if (!admin) {
      return jsonError("Not Found", 404);
    }

    const { searchParams } = new URL(request.url);
    const attachmentId = searchParams.get("id");

    if (!attachmentId) {
      return jsonError("Attachment ID is required.", 400);
    }

    const attachment = await prisma.cardAttachment.findUnique({
      where: { id: attachmentId },
      select: { id: true, name: true, size: true }
    });

    if (!attachment) {
      return jsonError("Attachment not found.", 404);
    }

    await prisma.cardAttachment.delete({
      where: { id: attachmentId }
    });

    recordAdminAudit({
      adminEmail: admin.email,
      action: "DELETE_ATTACHMENT",
      targetType: "STORAGE",
      targetId: attachment.id,
      targetName: attachment.name,
      details: { sizeBytes: attachment.size }
    });

    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : (request.headers.get("x-real-ip") || null);
    const userAgent = request.headers.get("user-agent") || null;

    void createAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorName: admin.name,
      actorRole: admin.globalRole,
      ipAddress: ip,
      userAgent,
      requestPath: "/api/admin/storage",
      requestMethod: "DELETE",
      category: "SYSTEM",
      action: "STORAGE_ATTACHMENT_DELETED",
      severity: "WARNING",
      status: "SUCCESS",
      targetType: "STORAGE",
      targetId: attachment.id,
      targetName: attachment.name,
      summary: `Admin ${admin.email} purged stored attachment "${attachment.name}" (${attachment.size} bytes)`,
      beforeState: attachment,
      metadata: { sizeBytes: attachment.size }
    });

    return NextResponse.json({
      ok: true,
      message: `Attachment "${attachment.name}" deleted successfully.`
    });
  } catch (error) {
    return parseError(error);
  }
}
