import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db } from './db'
import { users, accounts, sessions, verificationTokens } from './db/schema'

// ---------------------------------------------------------------------------
// Auth.js v5 configuration
// ---------------------------------------------------------------------------

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Pass the extended table map so DrizzleAdapter writes userTier on insert
  adapter: DrizzleAdapter(db, {
    usersTable:              users,
    accountsTable:           accounts,
    sessionsTable:           sessions,
    verificationTokensTable: verificationTokens,
  }),

  providers: [
    Google({
      clientId:     process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],

  callbacks: {
    // Expose id + tier on every session — available in RSCs via await auth()
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id:   user.id,
        tier: (user as { userTier?: string }).userTier ?? 'free',
      },
    }),
  },

  pages: {
    // Send unauthenticated users back to the dashboard (not a custom sign-in page)
    signIn: '/dashboard',
  },
})

// Extend the Session type so TypeScript knows about id + tier
declare module 'next-auth' {
  interface Session {
    user: {
      id:      string
      tier:    'free' | 'pro' | 'team'
      name?:   string | null
      email?:  string | null
      image?:  string | null
    }
  }
}
