/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { randomBytes } from "crypto";

export const { auth, handlers, signIn, signOut } = NextAuth({
adapter: PrismaAdapter(prisma),
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials: any) {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }
  
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });
  
          if (!user) {
            return null;
          }
  
          const isPasswordValid = await compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            return null;
          }
  
          return {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        }
      })
    ],
    session: {
      strategy: "jwt",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      updateAge: 24 * 60 * 60, // 24 hours
      generateSessionToken: () => {
        return randomBytes(32).toString("hex");
      },
    },
    pages: {
      signIn: "/auth/signin",
      signOut: "/auth/signout",
    },
    callbacks: {
      async session({ session, token }: { session: any, token: any }) {
        if (token && session.user) {
          session.user.id = token.sub;
        }
        return session;
      },
    },

    secret: process.env.AUTH_SECRET || "asfsdfasd",
    debug: process.env.NODE_ENV === "development",
  });