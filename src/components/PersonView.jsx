import { useState } from 'react'
import {
  TIERS,
  WEEKDAYS,
  dateForWeekday,
  describeSaveError,
  formatDay,
  lastMetOn,
  toISODate,
  weeksSince,
} from '../lib/friends.js'
import { normalizeName } from '../lib/profile.js'
import Chip from './Chip.jsx'
import FriendCircle from './FriendCircle.jsx'
import './PersonView.css'

export default function PersonView({ person, onLog }) {
  const [bindingId, setBindingId] = useState(null)
  const [adding, setAdding] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [showDays, setShowDays] = useState(false)
  const [day, setDay] = useState(null) // null = this week → today
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const last = lastMetOn(person.meetups)
  const weeks = last ? weeksSince(last) : null
  const activeBindings = person.bindings.filter((b) => b.active)
  const history = [...person.meetups]
    .sort((a, b) => (a.met_on < b.met_on ? 1 : -1))
    .slice(0, 6)
  const labelFor = (id) =>
    person.bindings.find((b) => b.id === id)?.label ?? 'Catch-up'

  const label = normalizeName(newLabel)
  const savable = !saving && (!adding || label.length > 0)

  async function handleLog() {
    if (!savable) return

    setSaving(true)
    setError(null)

    const { error: saveError } = await onLog({
      bindingId: adding ? null : bindingId,
      newLabel: adding ? label : null,
      metOn: toISODate(day === null ? new Date() : dateForWeekday(day)),
    })
    setSaving(false)
    if (saveError) setError(describeSaveError(saveError))
  }

  return (
    <div className="person">
      <div className="person-header">
        <FriendCircle person={person} weeks={weeks} size={54} />
        <div>
          <h2 className="person-name">{person.name}</h2>
          <p className="person-sub">
            {TIERS[person.depth_tier] ?? person.depth_tier} ·{' '}
            {person.meetups.length} logged
            {last ? ` · last ${formatDay(last)}` : ' · never logged'}
          </p>
        </div>
      </div>

      <p className="field-label">Saw them — what was it?</p>
      <div className="chip-row">
        <Chip
          on={bindingId === null && !adding}
          onClick={() => {
            setBindingId(null)
            setAdding(false)
          }}
        >
          Catch-up
        </Chip>
        {activeBindings.map((b) => (
          <Chip
            key={b.id}
            on={bindingId === b.id && !adding}
            onClick={() => {
              setBindingId(b.id)
              setAdding(false)
            }}
          >
            {b.label}
          </Chip>
        ))}
        <Chip on={adding} onClick={() => setAdding(true)}>
          + New thing
        </Chip>
      </div>

      {adding ? (
        <input
          className="field-input person-new-thing"
          type="text"
          value={newLabel}
          onChange={(event) => setNewLabel(event.target.value)}
          placeholder="Name the standing thing…"
          aria-label="Name the standing thing"
          disabled={saving}
        />
      ) : null}

      <button
        type="button"
        className="person-day-toggle"
        onClick={() => setShowDays((s) => !s)}
      >
        {showDays ? '▾' : '▸'}{' '}
        {day === null ? 'This week (default)' : `On ${WEEKDAYS[day]}`}
      </button>
      {showDays ? (
        <div className="chip-row">
          {WEEKDAYS.map((w, i) => (
            <Chip key={w} on={day === i} onClick={() => setDay(day === i ? null : i)}>
              {w}
            </Chip>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        className="cover-submit"
        disabled={!savable}
        onClick={handleLog}
      >
        {saving ? 'Logging…' : 'Log it'}
      </button>

      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}

      {history.length > 0 ? (
        <>
          <p className="field-label">Recent</p>
          <ul className="person-history">
            {history.map((m) => (
              <li key={m.id} className="person-history-row">
                <span
                  className={
                    m.binding_id ? 'person-history-bound' : 'person-history-plain'
                  }
                >
                  {labelFor(m.binding_id)}
                </span>
                <span className="person-history-date">{formatDay(m.met_on)}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  )
}
