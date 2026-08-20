import { useState } from 'react'
import {
  NAME_MAX,
  describeProfileError,
  isNameValid,
  normalizeName,
} from '../lib/profile.js'
import './NameForm.css'

// Used twice: once to ask a new user what to call them, once in settings
// to change the answer.
export default function NameForm({
  body,
  submitLabel,
  initialName = '',
  onSave,
}) {
  const [name, setName] = useState(initialName)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  const value = normalizeName(name)
  const changed = value !== normalizeName(initialName)
  const savable = isNameValid(value) && changed && !saving

  async function handleSubmit(event) {
    event.preventDefault()
    if (!savable) return

    setSaving(true)
    setError(null)
    setSaved(false)

    const { error: saveError } = await onSave(value)
    setSaving(false)

    if (saveError) {
      setError(describeProfileError(saveError))
      return
    }
    setSaved(true)
  }

  return (
    <form className="name-form" onSubmit={handleSubmit}>
      {body ? <p className="name-form-body">{body}</p> : null}

      <label className="name-form-label" htmlFor="display-name">
        Name
      </label>
      <input
        id="display-name"
        className="name-form-input"
        type="text"
        value={name}
        onChange={(event) => {
          setName(event.target.value)
          setSaved(false)
        }}
        maxLength={NAME_MAX}
        autoComplete="given-name"
        placeholder="Karl"
        disabled={saving}
      />

      <button type="submit" className="name-form-button" disabled={!savable}>
        {saving ? 'Saving…' : submitLabel}
      </button>

      {error ? (
        <p className="name-form-error" role="alert">
          {error}
        </p>
      ) : null}
      {saved && !error ? <p className="name-form-note">Saved.</p> : null}
    </form>
  )
}
