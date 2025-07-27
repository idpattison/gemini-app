import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma'; // Your Prisma client instance

// Define Auth.js options
export const authOptions: NextAuthOptions = {
  // Configure Prisma as the database adapter
  adapter: PrismaAdapter(prisma),

  // Configure authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    // Add more providers here if needed (e.g., GitHub, Email, Credentials)
  ],

  // Callbacks to customize session and JWT

  callbacks: {
    async session({ session, user }) {
    // async session({ session, user }) {
      // Add user ID to the session object
      // This is crucial for linking todos to the authenticated user
      if (session.user) {
        session.user.id = user.id; // user comes from the adapter
      }
      return session;
    },
    // If you were using JWT strategy, you'd also need a jwt callback
    // async jwt({ token, user, account, profile }) {
    //   if (user) {
    //     token.id = user.id;
    //   }
    //   return token;
    // },
  },

  // Session strategy (default is 'jwt' if no adapter, 'database' if adapter is present)
  // We explicitly set 'database' here since we're using PrismaAdapter
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  // Pages for custom login/error handling (optional)
  pages: {
    signIn: '/', // Redirect to home page on sign-in attempt
    // error: '/auth/error', // Error page
    // signOut: '/auth/signout', // Sign out page
  },

  // Debug mode for development
  debug: process.env.NODE_ENV === 'development',
};

// Export the NextAuth handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
