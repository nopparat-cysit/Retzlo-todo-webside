import { describe, it, expect, beforeEach } from "vitest";
import {
  getSystemBroadcast,
  setSystemBroadcast,
  clearSystemBroadcast,
  recordDecoyHit,
  getDecoyTelemetry,
  recordAdminAudit,
  getAdminAuditLogs
} from "./admin-system-state";

describe("Admin System State & Telemetry", () => {
  beforeEach(() => {
    clearSystemBroadcast();
  });

  describe("Global Broadcast Announcements", () => {
    it("should initially have no broadcast", () => {
      expect(getSystemBroadcast()).toBeNull();
    });

    it("should set and retrieve an active broadcast announcement", () => {
      const broadcast = setSystemBroadcast({
        message: "Maintenance scheduled in 1 hour",
        type: "warning",
        active: true,
        createdBy: "admin@retzlo.test"
      });

      expect(broadcast.id).toBeDefined();
      expect(broadcast.message).toBe("Maintenance scheduled in 1 hour");
      expect(broadcast.type).toBe("warning");
      expect(broadcast.active).toBe(true);

      const retrieved = getSystemBroadcast();
      expect(retrieved).not.toBeNull();
      expect(retrieved?.message).toBe("Maintenance scheduled in 1 hour");
    });

    it("should clear the broadcast announcement", () => {
      setSystemBroadcast({
        message: "Test announcement",
        type: "info",
        active: true,
        createdBy: "admin@retzlo.test"
      });

      expect(getSystemBroadcast()).not.toBeNull();

      clearSystemBroadcast();
      expect(getSystemBroadcast()).toBeNull();
    });
  });

  describe("Honeypot Decoy Telemetry (/admin)", () => {
    it("should record hits with IP and User-Agent", () => {
      const initial = getDecoyTelemetry().totalHits;

      recordDecoyHit("192.168.1.100", "Mozilla/5.0 ScannerBot");

      const telemetry = getDecoyTelemetry();
      expect(telemetry.totalHits).toBe(initial + 1);
      expect(telemetry.recentHits.length).toBeGreaterThan(0);
      expect(telemetry.recentHits[0].ip).toBe("192.168.1.100");
      expect(telemetry.recentHits[0].userAgent).toBe("Mozilla/5.0 ScannerBot");
    });

    it("should fallback gracefully if ip or user agent is missing", () => {
      recordDecoyHit("", "");
      const telemetry = getDecoyTelemetry();
      expect(telemetry.recentHits[0].ip).toBe("unknown");
      expect(telemetry.recentHits[0].userAgent).toBe("unknown");
    });
  });

  describe("Admin Action Audit Logging", () => {
    it("should record immutable audit logs", () => {
      const initialCount = getAdminAuditLogs().length;

      recordAdminAudit({
        adminEmail: "admin@retzlo.com",
        action: "UPDATE_USER_ROLE",
        targetType: "USER",
        targetId: "user-123",
        targetName: "john@example.com",
        details: { newRole: "ADMIN" }
      });

      const logs = getAdminAuditLogs();
      expect(logs.length).toBe(initialCount + 1);
      const latest = logs[0];
      expect(latest.adminEmail).toBe("admin@retzlo.com");
      expect(latest.action).toBe("UPDATE_USER_ROLE");
      expect(latest.targetType).toBe("USER");
      expect(latest.targetName).toBe("john@example.com");
      expect(latest.details).toEqual({ newRole: "ADMIN" });
    });
  });
});
