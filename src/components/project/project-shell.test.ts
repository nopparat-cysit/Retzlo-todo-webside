import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const source = readFileSync(join(process.cwd(), "src/components/project/project-shell.tsx"), "utf8");

describe("ProjectShell database outage handling", () => {
  it("catches database connectivity failures instead of letting the Next error overlay render", () => {
    expect(source).toContain("let project: ProjectShellProject | null");
    expect(source).toContain("catch (error) {");
    expect(source).toContain("isDatabaseConnectionError(error)");
    expect(source).toContain("<ProjectDatabaseUnavailable />");
  });

  it("does not render project children in the database outage fallback", () => {
    const fallbackStart = source.indexOf("function ProjectDatabaseUnavailable");
    expect(fallbackStart).toBeGreaterThan(-1);
    const fallbackSource = source.slice(fallbackStart);
    expect(fallbackSource).not.toContain("{children}");
    expect(fallbackSource).toContain("Database is taking a quiet break");
  });
});
