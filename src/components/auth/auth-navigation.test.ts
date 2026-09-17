import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const loginFormSource = readFileSync("src/components/auth/login-form.tsx", "utf8");
const landingSource = readFileSync("src/app/(marketing)/page.tsx", "utf8");

describe("auth-aware navigation", () => {
  it("redirects away from login on an existing client session", () => {
    expect(loginFormSource).toContain("getSession");
    expect(loginFormSource).toContain('router.replace(searchParams.get("callbackUrl") ?? "/projects")');
    expect(loginFormSource).not.toContain("isCheckingSession");
    expect(loginFormSource).not.toContain("Checking your workspace session");
    expect(loginFormSource).toContain("const password = String(formData.get(\"password\") ?? \"\")");
  });

  it("shows workspace/profile navigation on the landing page when a session exists", () => {
    expect(landingSource).toContain("/api/auth/session");
    expect(landingSource).toContain("currentUser ?");
    expect(landingSource).toContain('href="/profile"');
    expect(landingSource).toContain("Enter Workspace");
  });

  it("unifies auth layouts using centered AuthScene for accept-invitation and reset-password", () => {
    const acceptInvitationSource = readFileSync("src/app/(auth)/accept-invitation/page.tsx", "utf8");
    const resetPasswordSource = readFileSync("src/app/(auth)/reset-password/page.tsx", "utf8");
    const acceptComponentSource = readFileSync("src/components/auth/accept-invitation.tsx", "utf8");

    expect(acceptInvitationSource).toContain("<AuthScene");
    expect(acceptInvitationSource).not.toContain("PageShell");

    expect(resetPasswordSource).toContain("<AuthScene");
    expect(resetPasswordSource).not.toContain("PageShell");

    expect(acceptComponentSource).toContain('status === "ACCEPTED"');
    expect(acceptComponentSource).toContain("คำเชิญนี้ได้รับการตอบรับแล้ว");
    expect(acceptComponentSource).toContain("<ProjectPreviewCard");
  });
});
