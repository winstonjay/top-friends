import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase.js'
import { normalizeName } from './profile.js'

// The wall's data: everybody on it, with their bindings and meetups
// embedded in one fetch. Same shape as useProfile — the fetch is stored
// with whose it was, so a different user never sees stale rows.
//
// One fetch for everything is deliberate: single-user app, dozens of
// rows at most, and the person view needs the history anyway.

const PERSON_FIELDS = 'id, name, depth_tier, created_at'

export function useFriends(session) {
  const userId = session?.user?.id ?? null
  const [fetched, setFetched] = useState(null)

  useEffect(() => {
    if (!userId) return

    let live = true

    supabase
      .from('people')
      .select(
        `${PERSON_FIELDS}, bindings (id, label, active), meetups (id, binding_id, met_on)`,
      )
      .eq('archived', false)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (live) setFetched({ userId, friends: data ?? [], error })
      })

    return () => {
      live = false
    }
  }, [userId])

  // user_id is filled in by the column defaults (auth.uid()), so inserts
  // never mention it.
  const addFriend = useCallback(async (rawName, tier) => {
    const { data, error } = await supabase
      .from('people')
      .insert({ name: normalizeName(rawName), depth_tier: tier })
      .select(PERSON_FIELDS)
      .single()

    if (error) return { error }
    setFetched(
      (f) =>
        f && {
          ...f,
          friends: [...f.friends, { ...data, bindings: [], meetups: [] }],
        },
    )
    return { error: null }
  }, [])

  // Two inserts when a new standing thing is named alongside the meetup.
  // If the second fails the binding survives without a meetup — harmless,
  // it just shows up as an unused chip next time.
  const logMeetup = useCallback(
    async (personId, { bindingId = null, newLabel = null, metOn }) => {
      let newBinding = null
      if (newLabel) {
        const { data, error } = await supabase
          .from('bindings')
          .insert({ person_id: personId, label: normalizeName(newLabel) })
          .select('id, label, active')
          .single()

        if (error) return { error }
        newBinding = data
        bindingId = data.id
      }

      const { data: meetup, error } = await supabase
        .from('meetups')
        .insert({ person_id: personId, binding_id: bindingId, met_on: metOn })
        .select('id, binding_id, met_on')
        .single()

      if (error) return { error }
      setFetched(
        (f) =>
          f && {
            ...f,
            friends: f.friends.map((p) =>
              p.id !== personId
                ? p
                : {
                    ...p,
                    bindings: newBinding
                      ? [...p.bindings, newBinding]
                      : p.bindings,
                    meetups: [...p.meetups, meetup],
                  },
            ),
          },
      )
      return { error: null }
    },
    [],
  )

  const current = fetched?.userId === userId ? fetched : null

  return {
    friends: current?.friends ?? [],
    loading: Boolean(userId) && !current,
    loadError: current?.error ?? null,
    addFriend,
    logMeetup,
  }
}
