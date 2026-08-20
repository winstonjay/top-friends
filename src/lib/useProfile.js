import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase.js'
import { normalizeName } from './profile.js'

// The signed-in user's profile row, or null if they haven't named
// themselves yet. Null is the signal to go and ask.
//
// What's stored is the fetch *and* whose it was, so "still loading" is
// derived during render rather than toggled in an effect — and a
// different user can never be shown the previous one's name.
export function useProfile(session) {
  const userId = session?.user?.id ?? null
  const [fetched, setFetched] = useState(null)

  useEffect(() => {
    if (!userId) return

    let live = true

    supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', userId)
      // No row is the expected state for a new user, not an error.
      .maybeSingle()
      .then(({ data }) => {
        if (live) setFetched({ userId, profile: data ?? null })
      })

    return () => {
      live = false
    }
  }, [userId])

  const saveName = useCallback(
    async (raw) => {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ user_id: userId, display_name: normalizeName(raw) })
        .select('display_name')
        .single()

      if (error) return { error }
      setFetched({ userId, profile: data })
      return { error: null }
    },
    [userId],
  )

  const current = fetched?.userId === userId ? fetched : null

  return {
    profile: current?.profile ?? null,
    loading: Boolean(userId) && !current,
    saveName,
  }
}
