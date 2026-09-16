import { describe, expect, it, vi } from "vitest";
import { sendProjectInvitationEmail } from "./mail";

describe("mail service - project invitations", () => {
  it("gracefully returns false when SMTP is not configured without throwing", async () => {
    // Ensure SMTP env vars are empty
    const origHost = process.env.SMTP_HOST;
    delete process.env.SMTP_HOST;

    const result = await sendProjectInvitationEmail({
      email: "invitee@example.com",
      inviterName: "Alice",
      projectName: "Retro Workspace",
      acceptUrl: "http://localhost:3000/accept-invitation?token=test-token-123456"
    });

    expect(result.sent).toBe(false);
    expect(result.reason).toBe("SMTP_NOT_CONFIGURED");

    if (origHost) {
      process.env.SMTP_HOST = origHost;
    }
  });
});
