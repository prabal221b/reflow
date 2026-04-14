import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { connectDB } from "../db/connection";
import User from "../db/models/user";

export const { handlers, signIn, signOut, auth } = NextAuth({
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
          await connectDB();

          const email = (credentials.email as string).toLowerCase().trim();
          const user = await User.findOne({ email });

          if (!user || !user.passwordHash) {
            return null;
          }

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          );

          if (!isValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          };
        } catch {
          return null;
        }
      },
    }),
    ...(process.env.AUTH_GOOGLE_ID
      ? [
          GoogleProvider({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        if (!profile?.email) return false;
        return true;
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.userId = user.id;
      }

      // Sync Google user to our DB on first sign-in
      if (account?.provider === "google" && profile?.email) {
        try {
          await connectDB();
          const email = profile.email.toLowerCase().trim();
          let dbUser = await User.findOne({ email });

          if (!dbUser) {
            dbUser = await User.create({
              email,
              name: profile.name || "User",
              provider: "google",
              providerId: account.providerAccountId,
              onboarding: {
                completed: false,
                responses: { platforms: [], triggers: [] },
              },
            });
          }

          token.userId = dbUser._id.toString();
        } catch (error) {
          console.error(
            "Auth: Google sync failed:",
            error instanceof Error ? error.message : "Unknown"
          );
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  logger: {
    error(error) {
      if (error.name === "CredentialsSignin") return;
      console.error(`Auth Error: ${error.name}`);
    },
    warn(_code) { /* suppress */ },
    debug(_code, _metadata) { /* no-op */ },
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
});
