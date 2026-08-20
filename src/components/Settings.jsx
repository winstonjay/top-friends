import { supabase } from '../lib/supabase.js'
import NameForm from './NameForm.jsx'
import './Settings.css'

export default function Settings({ session, profile, onSaveName }) {
  return (
    <div className="settings">
      <section className="settings-block">
        <h2 className="settings-heading">Signed in as</h2>
        <p className="settings-value">{session.user.email}</p>
      </section>

      <section className="settings-block">
        <h2 className="settings-heading">What we call you</h2>
        <NameForm
          initialName={profile?.display_name ?? ''}
          submitLabel="Save"
          onSave={onSaveName}
        />
      </section>

      <button
        type="button"
        className="settings-signout"
        onClick={() => supabase.auth.signOut()}
      >
        Sign out
      </button>
    </div>
  )
}
