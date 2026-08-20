import { createClient } from '@supabase/supabase-js'

// Anon key only. The service_role key must never reach client code —
// every table is protected by RLS (auth.uid() = user_id) instead.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill it in.',
  )
}

export const supabase = createClient(url, anonKey)
