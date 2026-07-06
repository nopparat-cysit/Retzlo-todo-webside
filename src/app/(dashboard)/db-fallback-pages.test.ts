import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const pages = [
  new URL("./hub/notes/page.tsx", import.meta.url),
  new URL("./hub/diary/page.tsx", import.meta.url),
  new URL("./projects/rewards/page.tsx", import.meta.url),
  new URL("./project/[id]/rewards/page.tsx", import.meta.url)
];

describe("dashboard database fallback pages", () => {
  it("renders ErrorState with sanitized database messages instead of crashing", () => {
    for (const page of pages) {
      const source = readFileSync(page, "utf8");

      expect(source, page.pathname).toContain('import { ErrorState } from "@/components/ui/state"');
      expect(source, page.pathname).toContain('import { getDatabaseErrorMessage } from "@/lib/safe-db"');
      expect(source, page.pathname).toMatch(/try \{[\s\S]*prisma\./);
      expect(source, page.pathname).toMatch(/catch \(error\)[\s\S]*<ErrorState/);
      expect(source, page.pathname).not.toContain("DATABASE_URL");
      expect(source, page.pathname).not.toContain("supabase.co");
    }
  });
});
