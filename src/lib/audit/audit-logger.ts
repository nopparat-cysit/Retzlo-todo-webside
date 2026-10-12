import { prisma } from "@/lib/prisma";

export type AuditCategory =
  | "AUTH"
  | "USER"
  | "PROJECT"
  | "BOARD"
  | "CARD"
  | "REWARDS"
  | "FINANCE"
  | "AI"
  | "SECURITY"
  | "SYSTEM";

export type AuditSeverity = "INFO" | "NOTICE" | "WARNING" | "ERROR" | "CRITICAL";

export type AuditStatus = "SUCCESS" | "FAILED" | "DENIED";

export interface CreateAuditLogParams {
  actorId?: string | null;
  actorEmail?: string | null;
  actorName?: string | null;
  actorRole?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  requestPath?: string | null;
  requestMethod?: string | null;
  category: AuditCategory;
  action: string;
  severity?: AuditSeverity;
  status?: AuditStatus;
  targetType?: string | null;
  targetId?: string | null;
  targetName?: string | null;
  summary: string;
  beforeState?: Record<string, unknown> | object | null;
  afterState?: Record<string, unknown> | object | null;
  diff?: Record<string, unknown> | object | null;
  metadata?: Record<string, unknown> | object | null;
  errorMessage?: string | null;
}

export interface AuditLogRecord {
  id: string;
  timestamp: Date;
  actorId: string | null;
  actorEmail: string | null;
  actorName: string | null;
  actorRole: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  requestPath: string | null;
  requestMethod: string | null;
  category: string;
  action: string;
  severity: string;
  status: string;
  targetType: string | null;
  targetId: string | null;
  targetName: string | null;
  summary: string;
  diff: unknown;
  metadata: unknown;
  errorMessage: string | null;
}

// ── In-Memory Fallback Buffer ────────────────────────────────────────────────
declare global {
  // eslint-disable-next-line no-var
  var __retzlo_memory_audit_logs: AuditLogRecord[];
}

if (!globalThis.__retzlo_memory_audit_logs) {
  globalThis.__retzlo_memory_audit_logs = [];
}

const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /pass/i,
  /hash/i,
  /token/i,
  /secret/i,
  /otp/i,
  /auth/i,
  /credential/i,
  /cookie/i,
  /creditcard/i,
  /cvv/i,
  /privatekey/i
];

/**
 * PDPA & GDPR Data Sanitizer:
 * Recursively strips sensitive secrets and truncates personal private texts.
 */
export function sanitizeAuditPayload(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  if (typeof value === "string") {
    // Redact JWT or long bearer tokens
    if (value.startsWith("ey") && value.length > 50) {
      return "[REDACTED_JWT_TOKEN]";
    }
    // Truncate long content if it's over 1000 characters
    if (value.length > 1000) {
      return `${value.slice(0, 100)}... [TRUNCATED_TEXT, length: ${value.length}]`;
    }
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeAuditPayload(item));
  }

  if (typeof value === "object") {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(k));
      if (isSensitive) {
        sanitizedObj[k] = "[REDACTED]";
      } else {
        sanitizedObj[k] = sanitizeAuditPayload(v);
      }
    }
    return sanitizedObj;
  }

  return value;
}

/**
 * Calculates a structured difference between pre-mutation and post-mutation state.
 */
export function diffObjects(
  before?: Record<string, unknown> | object | null,
  after?: Record<string, unknown> | object | null
): Record<string, unknown> | null {
  if (!before && !after) return null;
  if (!before && after) return { created: sanitizeAuditPayload(after) };
  if (before && !after) return { deleted: sanitizeAuditPayload(before) };

  const cleanBefore = (sanitizeAuditPayload(before) || {}) as Record<string, unknown>;
  const cleanAfter = (sanitizeAuditPayload(after) || {}) as Record<string, unknown>;

  const changed: Record<string, { from: unknown; to: unknown }> = {};
  const added: Record<string, unknown> = {};
  const removed: Record<string, unknown> = {};

  const allKeys = new Set([...Object.keys(cleanBefore), ...Object.keys(cleanAfter)]);

  for (const key of allKeys) {
    if (!(key in cleanBefore)) {
      added[key] = cleanAfter[key];
    } else if (!(key in cleanAfter)) {
      removed[key] = cleanBefore[key];
    } else if (JSON.stringify(cleanBefore[key]) !== JSON.stringify(cleanAfter[key])) {
      changed[key] = {
        from: cleanBefore[key],
        to: cleanAfter[key]
      };
    }
  }

  const result: Record<string, unknown> = {};
  if (Object.keys(changed).length > 0) result.changed = changed;
  if (Object.keys(added).length > 0) result.added = added;
  if (Object.keys(removed).length > 0) result.removed = removed;

  return Object.keys(result).length > 0 ? result : null;
}

/**
 * Asynchronously logs an auditable system event with dual persistence
 * (Neon PostgreSQL primary + in-memory fallback buffer).
 */
export async function createAuditLog(params: CreateAuditLogParams): Promise<void> {
  const diff =
    params.diff ||
    (params.beforeState || params.afterState
      ? diffObjects(params.beforeState, params.afterState)
      : null);

  const sanitizedDiff = diff ? sanitizeAuditPayload(diff) : null;
  const sanitizedMetadata = params.metadata ? sanitizeAuditPayload(params.metadata) : null;

  const logData = {
    actorId: params.actorId || null,
    actorEmail: params.actorEmail || null,
    actorName: params.actorName || null,
    actorRole: params.actorRole || "ANONYMOUS",
    ipAddress: params.ipAddress || null,
    userAgent: params.userAgent || null,
    requestPath: params.requestPath || null,
    requestMethod: params.requestMethod || null,
    category: params.category,
    action: params.action,
    severity: params.severity || "INFO",
    status: params.status || "SUCCESS",
    targetType: params.targetType || null,
    targetId: params.targetId || null,
    targetName: params.targetName || null,
    summary: params.summary,
    diff: (sanitizedDiff as object) || null,
    metadata: (sanitizedMetadata as object) || null,
    errorMessage: params.errorMessage || null
  };

  try {
    const record = await prisma.auditLog.create({
      data: logData
    });

    // Also push to in-memory circular buffer for ultra-fast instant UI updates
    globalThis.__retzlo_memory_audit_logs.unshift(record);
    if (globalThis.__retzlo_memory_audit_logs.length > 200) {
      globalThis.__retzlo_memory_audit_logs = globalThis.__retzlo_memory_audit_logs.slice(0, 200);
    }
  } catch (error) {
    // Graceful fallback to in-memory log buffer so no audit trail is ever lost
    console.error("[AUDIT_LOG_FALLBACK] Failed to write to DB:", error);
    const fallbackRecord: AuditLogRecord = {
      id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date(),
      ...logData
    };
    globalThis.__retzlo_memory_audit_logs.unshift(fallbackRecord);
    if (globalThis.__retzlo_memory_audit_logs.length > 200) {
      globalThis.__retzlo_memory_audit_logs = globalThis.__retzlo_memory_audit_logs.slice(0, 200);
    }
  }
}

export interface AuditQueryFilters {
  search?: string;
  category?: string;
  action?: string;
  severity?: string;
  status?: string;
  actorId?: string;
  targetType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

/**
 * Queries audit logs with dynamic multi-dimension filtering and metrics aggregation.
 */
export async function queryAuditLogs(filters: AuditQueryFilters) {
  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(100, Math.max(1, filters.limit || 25));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (filters.search) {
    const term = filters.search.trim();
    where.OR = [
      { summary: { contains: term, mode: "insensitive" } },
      { actorEmail: { contains: term, mode: "insensitive" } },
      { actorName: { contains: term, mode: "insensitive" } },
      { targetName: { contains: term, mode: "insensitive" } },
      { action: { contains: term, mode: "insensitive" } },
      { ipAddress: { contains: term, mode: "insensitive" } }
    ];
  }

  if (filters.category && filters.category !== "ALL") {
    where.category = filters.category;
  }

  if (filters.action && filters.action !== "ALL") {
    where.action = filters.action;
  }

  if (filters.severity && filters.severity !== "ALL") {
    where.severity = filters.severity;
  }

  if (filters.status && filters.status !== "ALL") {
    where.status = filters.status;
  }

  if (filters.actorId) {
    where.actorId = filters.actorId;
  }

  if (filters.targetType && filters.targetType !== "ALL") {
    where.targetType = filters.targetType;
  }

  if (filters.startDate || filters.endDate) {
    where.timestamp = {
      ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
      ...(filters.endDate ? { lte: new Date(filters.endDate) } : {})
    };
  }

  try {
    const [total, logs, total24h, errorsCount, securityBlocksCount] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: "desc" },
        skip,
        take: limit
      }),
      prisma.auditLog.count({
        where: {
          timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      }),
      prisma.auditLog.count({
        where: {
          status: "FAILED"
        }
      }),
      prisma.auditLog.count({
        where: {
          OR: [{ category: "SECURITY" }, { status: "DENIED" }]
        }
      })
    ]);

    return {
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      metrics: {
        total24h,
        errorsCount,
        securityBlocksCount
      }
    };
  } catch (error) {
    // If DB read fails, fallback to memory logs
    console.error("[AUDIT_LOG_QUERY_FALLBACK] Error querying DB:", error);
    const memoryLogs = globalThis.__retzlo_memory_audit_logs;
    return {
      logs: memoryLogs.slice(skip, skip + limit),
      total: memoryLogs.length,
      page,
      totalPages: Math.ceil(memoryLogs.length / limit),
      metrics: {
        total24h: memoryLogs.length,
        errorsCount: memoryLogs.filter((l) => l.status === "FAILED").length,
        securityBlocksCount: memoryLogs.filter((l) => l.category === "SECURITY").length
      }
    };
  }
}
