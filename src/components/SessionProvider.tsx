'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'

// Thin wrapper so we can import a 'use client' component from the RSC layout
export default function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}
