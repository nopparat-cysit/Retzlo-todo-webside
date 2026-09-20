import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const nextConfigSource = readFileSync(new URL("../../next.config.mjs", import.meta.url), "utf8");

describe("security headers", () => {
  it("disables browser camera microphone and location permissions", () => {
    expect(nextConfigSource).toContain("Permissions-Policy");
    expect(nextConfigSource).toContain("camera=()");
    expect(nextConfigSource).toContain("microphone=()");
    expect(nextConfigSource).toContain("geolocation=()");
  });

  it("configures standard web security headers to prevent framing and sniffing", () => {
    expect(nextConfigSource).toContain("X-Frame-Options");
    expect(nextConfigSource).toContain("DENY");
    expect(nextConfigSource).toContain("X-Content-Type-Options");
    expect(nextConfigSource).toContain("nosniff");
    expect(nextConfigSource).toContain("Referrer-Policy");
    expect(nextConfigSource).toContain("strict-origin-when-cross-origin");
  });
});