import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";

import { normalizeLoginIdentifier } from "@/lib/auth/login-identifier";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().optional(),
  identifier: z.string().optional(),
  password: z.string().min(1)
});

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email or username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const rawIdentifier = parsed.data.identifier ?? parsed.data.email ?? "";

        if (!rawIdentifier.trim()) {
          return null;
        }

        const identifier = normalizeLoginIdentifier(rawIdentifier);
        const user =
          identifier.type === "email"
            ? await prisma.user.findUnique({ where: { email: identifier.value } })
            : await prisma.user.findUnique({ where: { username: identifier.value } });

        if (!user) {
          return null;
        }

        const isValidPassword = await verifyPassword(parsed.data.password, user.password);

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }

      return session;
    }
  }
};
