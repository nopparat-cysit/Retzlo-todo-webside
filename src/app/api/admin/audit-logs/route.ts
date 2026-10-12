import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { requireAdminUser } from "@/lib/admin-auth";
import { queryAuditLogs, createAuditLog } from "@/lib/audit/audit-logger";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const admin = await requireAdminUser();
    if (!admin) {
      return jsonError("Not Found", 404);
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const action = searchParams.get("action") || undefined;
    const severity = searchParams.get("severity") || undefined;
    const status = searchParams.get("status") || undefined;
    const targetType = searchParams.get("targetType") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "25", 10);
    const exportFormat = searchParams.get("export");

    const result = await queryAuditLogs({
      search,
      category,
      action,
      severity,
      status,
      targetType,
      startDate,
      endDate,
      page,
      limit: exportFormat ? 1000 : limit
    });

    // Handle CSV Export
    if (exportFormat === "csv") {
      void createAuditLog({
        actorId: admin.id,
        actorEmail: admin.email,
        actorName: admin.name,
        actorRole: admin.globalRole,
        category: "SYSTEM",
        action: "AUDIT_LOG_EXPORTED_CSV",
        severity: "NOTICE",
        summary: `Admin ${admin.email} exported ${result.logs.length} audit logs as CSV.`,
        metadata: { rowCount: result.logs.length }
      });

      const header = ["Timestamp", "Category", "Action", "Severity", "Status", "Actor Email", "IP Address", "Target Type", "Target Name", "Summary"];
      const rows = result.logs.map((log) => [
        new Date(log.timestamp).toISOString(),
        log.category,
        log.action,
        log.severity,
        log.status,
        log.actorEmail || "ANONYMOUS",
        log.ipAddress || "-",
        log.targetType || "-",
        `"${(log.targetName || "").replace(/"/g, '""')}"`,
        `"${(log.summary || "").replace(/"/g, '""')}"`
      ]);

      const csvContent = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");

      return new Response(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="retzlo-audit-logs-${Date.now()}.csv"`
        }
      });
    }

    // Handle JSON Export
    if (exportFormat === "json") {
      void createAuditLog({
        actorId: admin.id,
        actorEmail: admin.email,
        actorName: admin.name,
        actorRole: admin.globalRole,
        category: "SYSTEM",
        action: "AUDIT_LOG_EXPORTED_JSON",
        severity: "NOTICE",
        summary: `Admin ${admin.email} exported ${result.logs.length} audit logs as JSON.`,
        metadata: { rowCount: result.logs.length }
      });

      return new Response(JSON.stringify(result.logs, null, 2), {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="retzlo-audit-logs-${Date.now()}.json"`
        }
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    return parseError(error);
  }
}
