import { createClient, SupabaseClient } from '@supabase/supabase-js'

// NOTE: RLS is intentionally disabled on the `ambassadors` and `xp_transactions`
// tables in Supabase (this is an internal admin tool, not a public-facing API).
// The service role key bypasses RLS regardless, but disabling it removes the
// overhead of policy evaluation on every query.
// To disable: Supabase Dashboard → Table Editor → [table] → RLS → Disable.

let _adminClient: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (!_adminClient) {
    _adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  }
  return _adminClient
}

export const supabaseAdmin = {
  get from() {
    return getSupabaseAdmin().from.bind(getSupabaseAdmin())
  },
}
