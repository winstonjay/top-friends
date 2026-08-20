import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { describeAuthError, isEmailish, normalizeEmail } from '../lib/auth.js'
import './SignIn.css'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | sent
  const [error, setError] = useState(null)

  const address = normalizeEmail(email)
  const sendable = isEmailish(address) && status !== 'sending'

  async function handleSubmit(event) {
    event.preventDefault()
    if (!sendable) return

    setStatus('sending')
    setError(null)

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: address,
      options: {
        // No signup form, on purpose. The account is created by hand in
        // the Supabase dashboard, so the anon key in this bundle can't be
        // used by a stranger to mint one.
        shouldCreateUser: false,
        emailRedirectTo: window.location.origin,
      },
    })

    if (authError) {
      setError(describeAuthError(authError))
      setStatus('idle')
      return
    }

    setStatus('sent')
  }

  if (status === 'sent') {
    return (
      <div className="signin">
        <h1 className="signin-title">Top Friends</h1>
        <p className="signin-body">
          Link sent to <strong>{address}</strong>. It expires in an hour, so
          don't sit on it.
        </p>
        <button
          type="button"
          className="signin-link"
          onClick={() => setStatus('idle')}
        >
          Wrong address
        </button>
      </div>
    )
  }

  return (
    <form className="signin" onSubmit={handleSubmit}>
      <h1 className="signin-title">Top Friends</h1>
      <p className="signin-body">
        A ranked list of people who have no idea they're on it.
      </p>

      <label className="signin-label" htmlFor="email">
        Email
      </label>
      <input
        id="email"
        className="signin-input"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck="false"
        placeholder="you@example.com"
        disabled={status === 'sending'}
      />

      <button type="submit" className="signin-button" disabled={!sendable}>
        {status === 'sending' ? 'Sending…' : 'Send me a link'}
      </button>

      {error ? (
        <p className="signin-error" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  )
}
