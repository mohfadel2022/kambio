import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

/**
 * Edge-compatible NextAuth configuration.
 * IMPORTANT: Do NOT import Prisma or any Node.js-only modules here.
 * This file is used exclusively by middleware (Edge Runtime).
 * The full auth config (with Prisma) lives in src/auth.ts.
 */
export const { auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers: [
    // No-op credentials provider — actual auth happens in src/auth.ts.
    // We only need session/JWT reading here.
    Credentials({
      credentials: {},
      authorize: () => null,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.permissions = (user as any).permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role as string;
        (session.user as any).id = token.id as string;
        (session.user as any).permissions = token.permissions;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
