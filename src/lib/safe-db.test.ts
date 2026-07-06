import { describe, expect, it } from "vitest";

import { getDatabaseErrorMessage, isDatabaseConnectionError } from "@/lib/safe-db";

describe("safe database errors", () => {
  it("detects Prisma connection errors without leaking credentials", () => {
    const error = new Error(
      "Invalid `prisma.project.findMany()` invocation: Can't reach database server at `db.example.supabase.co:5432`"
    );

    expect(isDatabaseConnectionError(error)).toBe(true);
    expect(getDatabaseErrorMessage(error)).toBe(
      "Database connection is unavailable. Please check the Supabase connection and try again."
    );
    expect(getDatabaseErrorMessage(error)).not.toContain("db.example");
  });

  it("does not classify ordinary errors as database outages", () => {
    const error = new Error("Project not found");

    expect(isDatabaseConnectionError(error)).toBe(false);
    expect(getDatabaseErrorMessage(error)).toBe("Something did not sync. Try again.");
  });
});
