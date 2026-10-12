import { describe, it, expect } from "vitest";
import {
  sanitizeAuditPayload,
  diffObjects
} from "./audit-logger";

describe("Audit Logging & PDPA Sanitization Engine", () => {
  describe("sanitizeAuditPayload (Privacy & Security Masking)", () => {
    it("should recursively mask passwords, tokens, hashes, and OTPs", () => {
      const sensitiveInput = {
        email: "user@retzlo.test",
        password: "SuperSecretPassword123!",
        nested: {
          authToken: "bearer_xyz123",
          otpCode: "982143",
          userSecret: "api-secret-key-999"
        },
        creditCardNumber: "4111222233334444"
      };

      const sanitized = sanitizeAuditPayload(sensitiveInput) as Record<string, unknown>;

      expect(sanitized.email).toBe("user@retzlo.test");
      expect(sanitized.password).toBe("[REDACTED]");
      expect(sanitized.creditCardNumber).toBe("[REDACTED]");

      const nested = sanitized.nested as Record<string, unknown>;
      expect(nested.authToken).toBe("[REDACTED]");
      expect(nested.otpCode).toBe("[REDACTED]");
      expect(nested.userSecret).toBe("[REDACTED]");
    });

    it("should redact raw JWT string tokens", () => {
      const longJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      expect(sanitizeAuditPayload(longJwt)).toBe("[REDACTED_JWT_TOKEN]");
    });

    it("should truncate overly long texts to minimize log bloat", () => {
      const longText = "a".repeat(1500);
      const sanitized = sanitizeAuditPayload(longText) as string;
      expect(sanitized).toContain("[TRUNCATED_TEXT, length: 1500]");
    });
  });

  describe("diffObjects (Structural State Differencing)", () => {
    it("should detect modified, added, and removed attributes", () => {
      const beforeState = {
        name: "Old Workspace Name",
        role: "MEMBER",
        active: true,
        removedProp: "goodbye"
      };

      const afterState = {
        name: "New Workspace Name",
        role: "ADMIN",
        active: true,
        newProp: "hello"
      };

      const diff = diffObjects(beforeState, afterState) as {
        changed: Record<string, { from: unknown; to: unknown }>;
        added: Record<string, unknown>;
        removed: Record<string, unknown>;
      };

      expect(diff).not.toBeNull();
      expect(diff.changed.name).toEqual({ from: "Old Workspace Name", to: "New Workspace Name" });
      expect(diff.changed.role).toEqual({ from: "MEMBER", to: "ADMIN" });
      expect(diff.added.newProp).toBe("hello");
      expect(diff.removed.removedProp).toBe("goodbye");
      expect(diff.changed.active).toBeUndefined(); // Unchanged
    });

    it("should return null if there are no changes", () => {
      const state = { a: 1, b: "same" };
      expect(diffObjects(state, state)).toBeNull();
    });

    it("should handle creation and deletion deltas", () => {
      expect(diffObjects(null, { item: "created" })).toEqual({
        created: { item: "created" }
      });
      expect(diffObjects({ item: "deleted" }, null)).toEqual({
        deleted: { item: "deleted" }
      });
    });
  });
});
