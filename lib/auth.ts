import { NextAuthOptions } from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
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

        try {
          const user = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email))
            .limit(1);

          if (!user[0] || !user[0].passwordHash) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user[0].passwordHash
          );

          if (!isPasswordValid) {
            return null;
          }

          // Update last login
          await db
            .update(users)
            .set({ lastLoginAt: new Date() })
            .where(eq(users.id, user[0].id));

          return {
            id: user[0].id,
            email: user[0].email,
            name: user[0].fullName,
            emailVerified: user[0].isEmailVerified ? new Date() : null,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.emailVerified = user.emailVerified;
      }

      // Handle OAuth account linking
      if (account?.provider === "google" && user?.email) {
        try {
          const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, user.email))
            .limit(1);

          if (existingUser[0]) {
            token.id = existingUser[0].id;
          }
        } catch (error) {
          console.error("JWT callback error:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.emailVerified = token.emailVerified as Date | null;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Allow OAuth sign-ins
      if (account?.provider === "google") {
        return true;
      }

      // For credentials, check if email is verified
      if (account?.provider === "credentials") {
        try {
          const dbUser = await db
            .select()
            .from(users)
            .where(eq(users.email, user.email!))
            .limit(1);

          if (dbUser[0] && !dbUser[0].isEmailVerified) {
            // Redirect to email verification page
            return (
              "/auth/verify-email?email=" + encodeURIComponent(user.email!)
            );
          }
        } catch (error) {
          console.error("Sign-in callback error:", error);
          return false;
        }
      }

      return true;
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      // Log successful sign-in
      console.log(`User ${user.email} signed in with ${account?.provider}`);
    },
    async signOut({ session, token }) {
      // Log sign-out
      console.log(`User signed out`);
    },
  },
  debug: process.env.NODE_ENV === "development",
};
