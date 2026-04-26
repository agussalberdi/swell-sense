import { loadEnvConfig } from '@next/env'
import type { Config } from 'drizzle-kit'

// Load .env.local so POSTGRES_URL is available when running drizzle-kit outside Next.js
loadEnvConfig(process.cwd())

export default {
  schema:    './src/lib/db/schema.ts',
  out:       './drizzle/migrations',
  dialect:   'postgresql',
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
} satisfies Config
