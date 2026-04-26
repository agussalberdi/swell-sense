import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

// ---------------------------------------------------------------------------
// db — singleton Drizzle client backed by Neon serverless HTTP.
// POSTGRES_URL is set by the Neon integration in Vercel.
// Locally: copy the connection string into .env.local as POSTGRES_URL.
// ---------------------------------------------------------------------------

const sql = neon(process.env.POSTGRES_URL!)

export const db = drizzle(sql, { schema })
