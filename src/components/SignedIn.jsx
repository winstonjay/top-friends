import { supabase } from '../lib/supabase.js'
import './SignedIn.css'

// Placeholder for the actual app. It exists so the sign-in loop can be
// walked end to end: in, who you are, back out.
export default function SignedIn({ session }) {
  return (
    <div className="signed-in">
      <p className="hello">hello, top friends</p>
      <p className="signed-in-who">{session.user.email}</p>
      <button
        type="button"
        className="signed-in-out"
        onClick={() => supabase.auth.signOut()}
      >
        Sign out
      </button>
    </div>
  )
}
