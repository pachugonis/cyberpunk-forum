import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { verifyTwoFactorToken } from "./two-factor";
import { allowAuthAttempt } from "./rate-limit";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        token: { label: "2FA code", type: "text" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        if (!allowAuthAttempt(request, "login", credentials.email as string)) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
            password: true,
            twoFactorEnabled: true,
            twoFactorSecret: true,
          },
        });

        if (!user) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        // 2FA must be enforced here, not only in the login UI
        if (user.twoFactorEnabled) {
          const token = credentials.token as string | undefined;
          if (
            !token ||
            !user.twoFactorSecret ||
            !verifyTwoFactorToken(token, user.twoFactorSecret)
          ) {
            return null;
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.authTime = Date.now();
        return token;
      }

      // Re-check the account on every request so role changes apply
      // immediately and a password reset ends all existing sessions
      const dbUser = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: { role: true, passwordChangedAt: true },
      });

      const authTime = typeof token.authTime === "number" ? token.authTime : 0;
      if (!dbUser || (dbUser.passwordChangedAt && dbUser.passwordChangedAt.getTime() > authTime)) {
        return null;
      }

      token.role = dbUser.role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
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
