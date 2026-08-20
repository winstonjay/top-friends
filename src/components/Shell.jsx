import { useState } from 'react'
import { useProfile } from '../lib/useProfile.js'
import NavBar from './NavBar.jsx'
import Home from './Home.jsx'
import Settings from './Settings.jsx'
import NameForm from './NameForm.jsx'
import './Shell.css'

// Everything behind the sign-in. The nav bar is always up, including
// while we're still asking for a name — otherwise a user who doesn't
// want to give one has no way back out.
export default function Shell({ session }) {
  const { profile, loading, saveName } = useProfile(session)
  const [settingsOpen, setSettingsOpen] = useState(false)
  // Lives here rather than in Home because the + that opens it does.
  const [addingFriend, setAddingFriend] = useState(false)

  const showHome = !loading && !settingsOpen && profile

  return (
    <div className="shell">
      <NavBar
        settingsOpen={settingsOpen}
        onToggleSettings={() => setSettingsOpen((open) => !open)}
        onAdd={showHome ? () => setAddingFriend(true) : null}
      />

      <main className="shell-body">
        {loading ? null : settingsOpen ? (
          <Settings
            session={session}
            profile={profile}
            onSaveName={saveName}
          />
        ) : profile ? (
          <Home
            session={session}
            adding={addingFriend}
            onCloseAdd={() => setAddingFriend(false)}
          />
        ) : (
          <NameForm
            body="Before the rankings, the formalities. What should this call you?"
            submitLabel="That's me"
            onSave={saveName}
          />
        )}
      </main>
    </div>
  )
}
