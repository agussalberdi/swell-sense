import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import type { AdapterAccountType } from 'next-auth/adapters'

// ---------------------------------------------------------------------------
// Tier enum — powers the monetisation gate throughout the app.
// New tiers can be added here without any other schema changes.
// ---------------------------------------------------------------------------
export const userTierEnum = pgEnum('user_tier', ['free', 'pro', 'team'])

// ---------------------------------------------------------------------------
// Auth.js required tables (extended with userTier)
// ---------------------------------------------------------------------------
export const users = pgTable('user', {
  id:            text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name:          text('name'),
  email:         text('email').unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image:         text('image'),
  userTier:      userTierEnum('user_tier').notNull().default('free'),
})

export const accounts = pgTable(
  'account',
  {
    userId:            text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
    type:              text('type').$type<AdapterAccountType>().notNull(),
    provider:          text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token:     text('refresh_token'),
    access_token:      text('access_token'),
    expires_at:        integer('expires_at'),
    token_type:        text('token_type'),
    scope:             text('scope'),
    id_token:          text('id_token'),
    session_state:     text('session_state'),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ],
)

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId:       text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires:      timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token:      text('token').notNull(),
    expires:    timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
)

// ---------------------------------------------------------------------------
// App-owned: user profile (quiver + preferences)
// ---------------------------------------------------------------------------

export type Board = {
  type: 'shortboard' | 'fish' | 'longboard' | 'step-up' | 'gun' | 'funboard'
  length?: string
  fins?: string
}

export const profiles = pgTable('profile', {
  userId:              text('userId').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  homeBreakId:         text('homeBreakId'),
  skillLevel:          text('skillLevel'),
  boards:              jsonb('boards').$type<Board[]>().default([]),
  onboardingCompleted: boolean('onboardingCompleted').notNull().default(false),
  updatedAt:           timestamp('updatedAt', { mode: 'date' }).$onUpdateFn(() => new Date()),
})

// Type helpers consumed by RSCs and API routes
export type User    = typeof users.$inferSelect
export type Profile = typeof profiles.$inferSelect
