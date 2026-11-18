import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const PHANTOM_TAILWIND_V4_CLASSES = [
  "shadow-xs",
  "shadow-2xs",
  "drop-shadow-xs",
  "drop-shadow-2xs",
  "rounded-xs",
  "ring-1.5",
  "ring-3",
  "h-4.5",
  "w-4.5",
  "h-5.5",
  "w-5.5"
] as const;

const BROKEN_UNPREFIXED_TOKENS = [
  "bg-panel-strong",
  "bg-panel",
  "bg-paper",
  "bg-muted",
  "bg-border",
  "border-border",
  "border-paper-strong",
  "divide-border",
  "text-foreground",
  "text-muted-foreground"
] as const;

const MAX_GLOBALS_IMPORTANT_COUNT = 183;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildUtilityTokenRegex(tokens: readonly string[]): RegExp {
  const alternation = tokens.map(escapeRegExp).join("|");
  return new RegExp(
    `(?<=^|[\\s"'\`:!])(?:${alternation})(?:/[a-zA-Z0-9_.\\[\\]-]+)?(?=$|[\\s"'\`},;)\\]])`,
    "g"
  );
}

function collectNonTestSourceFiles(rootDir: string): string[] {
  const files: string[] = [];
  const entries = readdirSync(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(rootDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectNonTestSourceFiles(fullPath));
      continue;
    }
    if (!entry.isFile()) {
      continue;
    }
    const isSource = entry.name.endsWith(".ts") || entry.name.endsWith(".tsx");
    const isTest =
      entry.name.endsWith(".test.ts") ||
      entry.name.endsWith(".test.tsx") ||
      entry.name.endsWith(".spec.ts");
    if (isSource && !isTest) {
      files.push(fullPath);
    }
  }
  return files;
}

function findViolations(files: string[], tokens: readonly string[]): string[] {
  const pattern = buildUtilityTokenRegex(tokens);
  const violations: string[] = [];

  for (const file of files) {
    const content = readFileSync(file, "utf8");
    const lines = content.split(/\r?\n/);
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      pattern.lastIndex = 0;
      const matches = line.match(pattern);
      if (matches && matches.length > 0) {
        const relPath = relative(process.cwd(), file).replace(/\\/g, "/");
        violations.push(`${relPath}:${index + 1} [${matches.join(", ")}]`);
      }
    }
  }

  return violations;
}

describe("Design system structural guard", () => {
  const targetFiles = [
    ...collectNonTestSourceFiles(join(process.cwd(), "src", "components")),
    ...collectNonTestSourceFiles(join(process.cwd(), "src", "app"))
  ];

  it("forbids Tailwind v4 phantom classes incompatible with Tailwind v3.4", () => {
    const violations = findViolations(targetFiles, PHANTOM_TAILWIND_V4_CLASSES);
    expect(violations).toEqual([]);
  });

  it("forbids unprefixed shadcn-style semantic tokens that lack the theme- prefix", () => {
    const violations = findViolations(targetFiles, BROKEN_UNPREFIXED_TOKENS);
    expect(violations).toEqual([]);
  });

  it(`caps !important occurrences in globals.css at <= ${MAX_GLOBALS_IMPORTANT_COUNT}`, () => {
    const css = readFileSync(join(process.cwd(), "src", "app", "globals.css"), "utf8");
    const matches = css.match(/!important/g) ?? [];
    expect(matches.length).toBeLessThanOrEqual(MAX_GLOBALS_IMPORTANT_COUNT);
  });
});
