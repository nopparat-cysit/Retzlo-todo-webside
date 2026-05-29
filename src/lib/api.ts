import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getDatabaseErrorMessage } from "@/lib/database-error";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function parseError(error: unknown) {
  if (error instanceof ZodError) {
    return jsonError("Invalid request payload.", 422);
  }

  const databaseError = getDatabaseErrorMessage(error);

  if (databaseError) {
    return jsonError(databaseError, 500);
  }

  return jsonError("Something did not sync. Try again.", 500);
}
