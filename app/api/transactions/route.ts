import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const limit = parseInt(new URL(request.url).searchParams.get('limit') ?? '30', 10)
  // Fetch recent transactions joined with ambassador username
  const { data, error } = await supabase
    .from('xp_transactions')
    .select('*, ambassadors(username)')
    .order('created_at', { ascending: false })
    .limit(Math.min(limit, 100))

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Flatten the joined username onto each row
  const rows = (data ?? []).map((tx) => ({
    id:           tx.id,
    ambassador_id: tx.ambassador_id,
    username:     (tx.ambassadors as { username: string } | null)?.username ?? '—',
    amount:       tx.amount,
    category:     tx.category,
    reason:       tx.reason,
    awarded_by:   tx.awarded_by,
    created_at:   tx.created_at,
  }))

  return NextResponse.json({ data: rows })
}
