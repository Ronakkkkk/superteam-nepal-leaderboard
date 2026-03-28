import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // Auth check
  const session = request.cookies.get('admin_session')
  const secret  = process.env.ADMIN_SECRET_KEY
  if (!session || !secret || session.value !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { ambassador_id, amount, reason, category, awarded_by } = body

  // Validate all required fields
  if (!ambassador_id || amount === undefined || !reason || !category || !awarded_by) {
    return NextResponse.json(
      { error: 'ambassador_id, amount, reason, category, and awarded_by are all required' },
      { status: 400 }
    )
  }

  if (typeof amount !== 'number') {
    return NextResponse.json({ error: 'amount must be a number' }, { status: 400 })
  }

  // Insert xp_transactions row
  const { error: txError } = await supabaseAdmin
    .from('xp_transactions')
    .insert({ ambassador_id, amount, reason, category, awarded_by })

  if (txError) {
    return NextResponse.json({ error: txError.message }, { status: 500 })
  }

  // Fetch current XP totals
  const { data: current, error: fetchError } = await supabaseAdmin
    .from('ambassadors')
    .select('total_xp, monthly_xp, weekly_xp')
    .eq('id', ambassador_id)
    .single()

  if (fetchError || !current) {
    return NextResponse.json({ error: fetchError?.message ?? 'Ambassador not found' }, { status: 404 })
  }

  // Increment all three XP fields
  const { data: updated, error: updateError } = await supabaseAdmin
    .from('ambassadors')
    .update({
      total_xp:   current.total_xp  + amount,
      monthly_xp: current.monthly_xp + amount,
      weekly_xp:  current.weekly_xp  + amount,
    })
    .eq('id', ambassador_id)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ data: updated }, { status: 200 })
}
