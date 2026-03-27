import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { data, error } = await supabase
    .from('ambassadors')
    .select('id, username, avatar_url, skills, total_xp, monthly_xp, weekly_xp')
    .order('total_xp', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Add computed rank field server-side (1-based, ordered by total_xp DESC)
  const ranked = (data ?? []).map((ambassador, index) => ({
    ...ambassador,
    rank: index + 1,
  }))

  return NextResponse.json({ data: ranked })
}
