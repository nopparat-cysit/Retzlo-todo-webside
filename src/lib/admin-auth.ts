import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export function isAdminRole(role: string | null | undefined): boolean {
  return role === "ADMIN";
}

/**
 * Validates that the current request has an active session
 * and that the user has globalRole === "ADMIN" in the database.
 * Returns the admin user record if authorized, or null otherwise.
 */
export async function requireAdminUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  // Always query database directly to ensure role changes take effect immediately
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      avatar: true,
      globalRole: true,
      status: true,
      createdAt: true
    }
  });

  if (!user || user.globalRole !== "ADMIN") {
    return null;
  }

  return user;
}
