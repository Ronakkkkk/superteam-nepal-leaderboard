import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

function requireAdminKey(request: NextRequest): NextResponse | null {
  const key = request.headers.get('x-admin-key')
  if (!key || key !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

/* ── POST /api/ambassadors — create new ambassador ──────────────── */
export async function POST(request: NextRequest) {
  const authError = requireAdminKey(request)
  if (authError) return authError

  const body = await request.json()
  const { username, avatar_url, skills } = body

  if (!username) {
    return NextResponse.json({ error: 'username is required' }, { status: 400 })
  }

  // Normalize skills: accept array or comma-separated string
  let skillsArray: string[] = []
  if (Array.isArray(skills)) {
    skillsArray = skills.map((s: string) => s.trim()).filter(Boolean)
  } else if (typeof skills === 'string' && skills.trim()) {
    skillsArray = skills.split(',').map((s: string) => s.trim()).filter(Boolean)
  }

  const { data, error } = await supabaseAdmin
    .from('ambassadors')
    .insert({
      username,
      avatar_url: avatar_url ?? null,
      skills: skillsArray,
      total_xp:   0,
      monthly_xp: 0,
      weekly_xp:  0,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}

/* ── PATCH /api/ambassadors — update ambassador fields ─────────── */
export async function PATCH(request: NextRequest) {
  const authError = requireAdminKey(request)
  if (authError) return authError

  const body = await request.json()
  const { ambassador_id, username, avatar_url, skills } = body

  if (!ambassador_id) {
    return NextResponse.json({ error: 'ambassador_id is required' }, { status: 400 })
  }

  // Build update object from only provided fields
  const updates: Record<string, unknown> = {}
  if (username !== undefined)   updates.username   = username
  if (avatar_url !== undefined) updates.avatar_url = avatar_url ?? null
  if (skills !== undefined) {
    if (Array.isArray(skills)) {
      updates.skills = skills.map((s: string) => s.trim()).filter(Boolean)
    } else if (typeof skills === 'string') {
      updates.skills = skills.split(',').map((s: string) => s.trim()).filter(Boolean)
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('ambassadors')
    .update(updates)
    .eq('id', ambassador_id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

/* ── DELETE /api/ambassadors — delete ambassador + their XP ─────── */
export async function DELETE(request: NextRequest) {
  const authError = requireAdminKey(request)
  if (authError) return authError

  const body = await request.json()
  const { ambassador_id } = body

  if (!ambassador_id) {
    return NextResponse.json({ error: 'ambassador_id is required' }, { status: 400 })
  }

  // Delete xp_transactions first (foreign key safety)
  const { error: txError } = await supabaseAdmin
    .from('xp_transactions')
    .delete()
    .eq('ambassador_id', ambassador_id)

  if (txError) {
    return NextResponse.json({ error: txError.message }, { status: 500 })
  }

  // Delete ambassador
  const { error: ambError } = await supabaseAdmin
    .from('ambassadors')
    .delete()
    .eq('id', ambassador_id)

  if (ambError) {
    return NextResponse.json({ error: ambError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
