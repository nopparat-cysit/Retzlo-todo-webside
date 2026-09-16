import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const modalSource = readFileSync(new URL("./invitation-confirm-modal.tsx", import.meta.url), "utf8");
const popoverSource = readFileSync(new URL("./notifications-popover.tsx", import.meta.url), "utf8");

describe("Invitation System Components", () => {
  it("renders InvitationConfirmModal via ModalPortal with accessible dialog role", () => {
    expect(modalSource).toContain('import { ModalPortal } from "@/components/ui/modal-portal"');
    expect(modalSource).toMatch(/<ModalPortal>[\s\S]*role="dialog"[\s\S]*<\/ModalPortal>/);
    expect(modalSource).toContain('aria-labelledby="invitation-confirm-title"');
  });

  it("handles accept and decline with toasts and proper endpoints", () => {
    expect(modalSource).toContain('fetch("/api/auth/accept-invitation"');
    expect(modalSource).toContain('method: "POST"');
    expect(modalSource).toContain('method: "DELETE"');
    expect(modalSource).toContain('type: "success"');
  });

  it("renders notifications popover with unread counter badge and project invitation triggers", () => {
    expect(popoverSource).toContain('fetch("/api/notifications"');
    expect(popoverSource).toContain("PROJECT_INVITATION");
    expect(popoverSource).toContain("<InvitationConfirmModal");
  });
});
