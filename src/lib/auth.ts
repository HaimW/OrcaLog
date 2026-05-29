import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        // Auto-promote to admin if email is in the admin list
        let role = user.role;
        const config = await prisma.appConfig.findUnique({
          where: { id: "singleton" },
        });
        if (config) {
          const adminEmails: string[] = JSON.parse(config.adminEmails);
          if (adminEmails.includes(user.email) && role !== "admin") {
            await prisma.user.update({
              where: { id: user.id },
              data: { role: "admin" },
            });
            role = "admin";
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.fullName || user.username || user.email,
          role,
          language: user.language,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.language = (user as any).language;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).language = token.language;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
