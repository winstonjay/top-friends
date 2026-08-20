import { useEffect, useState } from 'react'
import { supabase } from './supabase.js'
import { stripAuthParams } from './auth.js'

// The one place that knows whether anybody is signed in. `loading` is
// true until Supabase has read whatever it kept in storage, so the app
// doesn't flash the sign-in screen at somebody who is already in.
export function useSession() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let live = true

    supabase.auth.getSession().then(({ data }) => {
      if (!live) return
      setSession(data.session)
      setLoading(false)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!live) return
      setSession(next)
      setLoading(false)
    })

    return () => {
      live = false
      data.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session) return
    const cleaned = stripAuthParams(window.location.href)
    if (cleaned !== window.location.href) {
      window.history.replaceState({}, '', cleaned)
    }
  }, [session])

  return { session, loading }
}
