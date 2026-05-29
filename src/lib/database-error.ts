export function getDatabaseErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const message = "message" in error && typeof error.message === "string" ? error.message : "";
  const code = "code" in error && typeof error.code === "string" ? error.code : "";

  if (code === "P1001" || message.includes("Can't reach database server")) {
    return "Database connection failed. Check DATABASE_URL and use the Supabase pooler URL if direct IPv6 is unavailable.";
  }

  if (message.includes("tenant/user") || message.includes("no tenant identifier")) {
    return "Database pooler endpoint is not correct for this Supabase project. Copy the exact pooler connection string from Supabase.";
  }

  if (message.includes("does not exist") || code === "P2021") {
    return "Database schema is not ready. Run npx prisma db push after DATABASE_URL is correct.";
  }

  return null;
}
