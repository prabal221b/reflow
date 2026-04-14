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
          console.log("Auth: Missing credentials");
          return null;
        }
    
        try {
          await connectDB();
    
          const email = (credentials.email as string).toLowerCase().trim();
          const user = await User.findOne({ email });
    
          if (!user) {
            console.log(`Auth: User not found - ${email}`);
            return null;
          }
    
          if (!user.passwordHash) {
            console.log(`Auth: User ${email} has no password hash (likely social login)`);
            return null;
          }
    
          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          );
    
          if (!isValid) {
            console.log(`Auth: Invalid password for ${email}`);
            return null;
          }
    
          console.log(`Auth: Successful login for ${email}`);
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("Auth: Authorize error (check database connection)");
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
        if (!profile?.email) {
          console.error("Auth: Google login failed - no email in profile");
          return false;
        }
        return true;
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      // Logic for initial sign in
      if (user) {
        token.userId = user.id;
      }

      // Special handling for Google to link/create user in our DB
      if (account?.provider === "google" && profile?.email) {
        try {
          await connectDB();
          const email = profile.email.toLowerCase().trim();
          let dbUser = await User.findOne({ email });

          if (!dbUser) {
            // Create new user for Google login
            dbUser = await User.create({
              email,
              name: profile.name || "User",
              provider: "google",
              providerId: account.providerAccountId,
              onboarding: {
                completed: false,
                responses: { platforms: [], triggers: [] }
              }
            });
            console.log(`Auth: Created new user via Google - ${email}`);
          } else if (dbUser.provider !== "google") {
            // If user exists but via credentials, we "link" them by 
            // allowing login but we could also update their providerId
            console.log(`Auth: Google login for existing credentials user - ${email}`);
          }

          token.userId = dbUser._id.toString();
        } catch (error) {
          console.error("Auth: Google user sync error (sensible log)");
          // We don't throw the full error to avoid leaking code/DB details in logs
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
    error(code, metadata) {
      // Suppress the noisy CredentialsSignin stack trace in development
      if (code.name === "CredentialsSignin" || code.code === "credentials_signin") {
        console.log("Auth: Invalid credentials attempt (CredentialsSignin)");
        return;
      }
      console.error(`Auth Error: ${code.name || "Unknown error"}`);
    },
    warn(code) {
      console.warn(code);
    },
    debug(code, metadata) {
      // console.log(code, metadata);
    },
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
});
