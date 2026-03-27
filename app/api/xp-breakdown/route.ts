import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const ambassador_id = searchParams.get('ambassador_id')

  if (!ambassador_id) {
    return NextResponse.json({ error: 'ambassador_id required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('xp_transactions')
    .select('category, amount')
    .eq('ambassador_id', ambassador_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Group by category and sum amounts
  const breakdown: Record<string, number> = {}
  for (const tx of data ?? []) {
    const cat = tx.category ?? 'Other'
    breakdown[cat] = (breakdown[cat] ?? 0) + tx.amount
  }

  return NextResponse.json({ data: breakdown })
}
