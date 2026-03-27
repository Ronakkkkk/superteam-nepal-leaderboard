import { supabase } from '@/lib/supabase'
import { LeaderboardTable, type Ambassador } from '@/components/LeaderboardTable'

async function getLeaderboard(): Promise<Ambassador[]> {
  try {
    const { data, error } = await supabase
      .from('ambassadors')
      .select('id, username, avatar_url, skills, total_xp, monthly_xp, weekly_xp')
      .order('total_xp', { ascending: false })

    if (error || !data) return []
    return data as Ambassador[]
  } catch {
    return []
  }
}

export default async function Page() {
  const ambassadors = await getLeaderboard()
  return <LeaderboardTable initialData={ambassadors} />
}
