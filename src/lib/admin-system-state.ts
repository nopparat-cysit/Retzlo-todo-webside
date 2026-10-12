/**
 * In-memory operational state for Super Admin features:
 * - Global Broadcast Announcements
 * - Honeypot Decoy Hits Telemetry (/admin decoy)
 * - Admin Audit Logs
 */

export interface SystemBroadcast {
  id: string;
  message: string;
  type: "info" | "warning" | "urgent";
  active: boolean;
  createdAt: string;
  createdBy: string;
}

export interface DecoyHit {
  id: string;
  ip: string;
  userAgent: string;
  timestamp: string;
}

export interface AdminAuditEntry {
  id: string;
  adminEmail: string;
  action: string;
  targetType: "USER" | "PROJECT" | "REWARD" | "STORAGE" | "AI" | "BROADCAST";
  targetId?: string;
  targetName?: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// Global persistent references across hot-reloads
declare global {
  // eslint-disable-next-line no-var
  var __retzlo_admin_broadcast: SystemBroadcast | null;
  // eslint-disable-next-line no-var
  var __retzlo_decoy_hits: DecoyHit[];
  // eslint-disable-next-line no-var
  var __retzlo_audit_logs: AdminAuditEntry[];
}

if (!globalThis.__retzlo_decoy_hits) {
  globalThis.__retzlo_decoy_hits = [];
}

if (!globalThis.__retzlo_audit_logs) {
  globalThis.__retzlo_audit_logs = [];
}

// ── Global Broadcast ──────────────────────────────────────────────────────────

export function getSystemBroadcast(): SystemBroadcast | null {
  return globalThis.__retzlo_admin_broadcast ?? null;
}

export function setSystemBroadcast(
  broadcast: Omit<SystemBroadcast, "id" | "createdAt">
): SystemBroadcast {
  const record: SystemBroadcast = {
    id: `bc-${Date.now()}`,
    ...broadcast,
    createdAt: new Date().toISOString()
  };
  globalThis.__retzlo_admin_broadcast = record;
  return record;
}

export function clearSystemBroadcast(): void {
  globalThis.__retzlo_admin_broadcast = null;
}

// ── Honeypot Decoy Telemetry ──────────────────────────────────────────────────

export function recordDecoyHit(ip: string, userAgent: string): void {
  const hit: DecoyHit = {
    id: `hit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    ip: ip || "unknown",
    userAgent: userAgent || "unknown",
    timestamp: new Date().toISOString()
  };

  globalThis.__retzlo_decoy_hits.unshift(hit);
  // Keep last 100 decoy hits
  if (globalThis.__retzlo_decoy_hits.length > 100) {
    globalThis.__retzlo_decoy_hits = globalThis.__retzlo_decoy_hits.slice(0, 100);
  }
}

export function getDecoyTelemetry(): { totalHits: number; recentHits: DecoyHit[] } {
  return {
    totalHits: globalThis.__retzlo_decoy_hits.length,
    recentHits: globalThis.__retzlo_decoy_hits.slice(0, 20)
  };
}

// ── Admin Audit Logs ──────────────────────────────────────────────────────────

export function recordAdminAudit(
  entry: Omit<AdminAuditEntry, "id" | "timestamp">
): AdminAuditEntry {
  const log: AdminAuditEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    ...entry,
    timestamp: new Date().toISOString()
  };

  globalThis.__retzlo_audit_logs.unshift(log);
  // Keep last 300 audit logs
  if (globalThis.__retzlo_audit_logs.length > 300) {
    globalThis.__retzlo_audit_logs = globalThis.__retzlo_audit_logs.slice(0, 300);
  }
  return log;
}

export function getAdminAuditLogs(limit = 50): AdminAuditEntry[] {
  return globalThis.__retzlo_audit_logs.slice(0, limit);
}
