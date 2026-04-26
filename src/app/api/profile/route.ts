import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import type { Board } from '@/lib/db/schema'
import type { UnitSystem } from '@/lib/units'

// ---------------------------------------------------------------------------
// PATCH /api/profile — upsert skill level, home break, quiver, and units.
// Requires an active session.
// ---------------------------------------------------------------------------
export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { homeBreakId, skillLevel, boards, onboardingCompleted, unitSystem } = body as {
    homeBreakId?: string
    skillLevel?: string
    boards?: Board[]
    onboardingCompleted?: boolean
    unitSystem?: UnitSystem
  }

  await db
    .insert(profiles)
    .values({
      userId:              session.user.id,
      homeBreakId:         homeBreakId         ?? null,
      skillLevel:          skillLevel          ?? null,
      boards:              boards              ?? [],
      onboardingCompleted: onboardingCompleted ?? false,
      unitSystem:          unitSystem          ?? 'imperial',
    })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: {
        ...(homeBreakId         !== undefined && { homeBreakId }),
        ...(skillLevel          !== undefined && { skillLevel }),
        ...(boards              !== undefined && { boards }),
        ...(onboardingCompleted !== undefined && { onboardingCompleted }),
        ...(unitSystem          !== undefined && { unitSystem }),
      },
    })

  return NextResponse.json({ ok: true })
}
