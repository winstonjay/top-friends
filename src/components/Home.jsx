import { useState } from 'react'
import { useFriends } from '../lib/useFriends.js'
import { lastMetOn, quietLabel, weeksSince } from '../lib/friends.js'
import Cover from './Cover.jsx'
import AddFriend from './AddFriend.jsx'
import PersonView from './PersonView.jsx'
import FriendCircle from './FriendCircle.jsx'
import './Home.css'

// The wall. Stable order (oldest friendship first), no re-ranking — the
// fade is the signal, so nobody gets shuffled for going quiet.
export default function Home({ session, adding, onCloseAdd }) {
  const { friends, loading, loadError, addFriend, logMeetup } = useFriends(session)
  const [openId, setOpenId] = useState(null)
  const open = friends.find((p) => p.id === openId) ?? null

  return (
    <div className="home">
      {loading ? null : loadError ? (
        <p className="home-empty" role="alert">
          The wall didn't load. It says: {loadError.message}
        </p>
      ) : friends.length === 0 ? (
        <p className="home-empty">
          Nobody on the wall yet. Presumably you know people — the + up
          there is how they get on it.
        </p>
      ) : (
        <ul className="home-grid">
          {friends.map((p) => {
            const last = lastMetOn(p.meetups)
            const weeks = last ? weeksSince(last) : null
            return (
              <li key={p.id}>
                <button
                  type="button"
                  className="home-friend"
                  onClick={() => setOpenId(p.id)}
                >
                  <FriendCircle person={p} weeks={weeks} />
                  <span className="home-friend-name">{p.name}</span>
                  <span className="home-friend-quiet">{quietLabel(weeks)}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {adding ? (
        <Cover label="Add someone" onClose={onCloseAdd}>
          <AddFriend
            onAdd={async (name, tier) => {
              const result = await addFriend(name, tier)
              if (!result.error) onCloseAdd()
              return result
            }}
          />
        </Cover>
      ) : null}

      {open ? (
        <Cover label={open.name} onClose={() => setOpenId(null)}>
          <PersonView
            person={open}
            onLog={async (entry) => {
              const result = await logMeetup(open.id, entry)
              if (!result.error) setOpenId(null)
              return result
            }}
          />
        </Cover>
      ) : null}
    </div>
  )
}
