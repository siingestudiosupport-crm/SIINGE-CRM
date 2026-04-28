import { createClient } from '@supabase/supabase-js'

export const hubSupabase = createClient(
  import.meta.env.VITE_HUB_SUPABASE_URL,
  import.meta.env.VITE_HUB_SUPABASE_ANON_KEY
)
