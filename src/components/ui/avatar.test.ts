import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { getAvatarColor } from "./avatar";

const source = readFileSync(new URL("./avatar.tsx", import.meta.url), "utf8");

describe("Avatar component", () => {
  it("exports both Avatar and AvatarStack", () => {
    expect(source).toContain("export function Avatar(");
    expect(source).toContain("export function AvatarStack(");
  });

  it("computes deterministic avatar colors using hashing", () => {
    const color1 = getAvatarColor("user-abc");
    const color2 = getAvatarColor("user-abc");
    const color3 = getAvatarColor("user-xyz");

    expect(color1).toBe(color2);
    expect(typeof color3).toBe("string");
    expect(color1).toMatch(/bg-(indigo|purple|amber|cyan|emerald|rose)-500\/20/);
  });

  it("supports status indicator styling", () => {
    expect(source).toContain("statusColor");
    expect(source).toContain("ring-2 ring-ink-950");
  });
});
