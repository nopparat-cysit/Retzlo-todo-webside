const DATABASE_CONNECTION_PATTERNS = [
  "can't reach database server",
  "cannot reach database server",
  "connection refused",
  "connection terminated",
  "connect etimedout",
  "prepared statement",
  "connectorerror",
  "queryerror(postgreserror"
];

export function isDatabaseConnectionError(error: unknown): boolean {
  const message = extractErrorMessage(error).toLowerCase();
  return DATABASE_CONNECTION_PATTERNS.some((pattern) => message.includes(pattern));
}

export function getDatabaseErrorMessage(error: unknown): string {
  if (isDatabaseConnectionError(error)) {
    return "Database connection is unavailable. Please check the Supabase connection and try again.";
  }

  return "Something did not sync. Try again.";
}

export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  try {
    return JSON.stringify(error);
  } catch {
    return "";
  }
}
