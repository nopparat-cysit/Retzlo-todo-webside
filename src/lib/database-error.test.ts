import { describe, expect, it } from "vitest";

import { getDatabaseErrorMessage } from "./database-error";

describe("getDatabaseErrorMessage", () => {
  it("explains unreachable database errors", () => {
    expect(getDatabaseErrorMessage({ code: "P1001", message: "Can't reach database server" })).toContain(
      "Database connection failed"
    );
  });

  it("explains wrong Supabase pooler tenant errors", () => {
    expect(getDatabaseErrorMessage({ message: "FATAL: (ENOTFOUND) tenant/user postgres.ref not found" })).toContain(
      "pooler endpoint is not correct"
    );
  });

  it("explains missing schema errors", () => {
    expect(getDatabaseErrorMessage({ code: "P2021", message: "The table public.User does not exist" })).toContain(
      "Database schema is not ready"
    );
  });
});
