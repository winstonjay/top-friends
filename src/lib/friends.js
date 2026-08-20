// Pure logic for the wall: what a friend's circle looks like and what
// the quiet label says. Kept out of the components so it can be tested
// without rendering anything.

// Settled vocabulary — the check constraint in the depth_tier migration
// is the database-side counterpart of this object.
export const TIERS = {
  childhood: 'Childhood',
  uni: 'University',
  adult: 'Adult era',
  new: 'New',
}

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// A person's colour is a hash of their row id — deterministic, so it
// survives reloads and devices without storing a hue column.
export function hueFor(id) {
  let hue = 0
  for (const ch of String(id)) hue = (hue * 31 + ch.codePointAt(0)) % 360
  return hue
}

// met_on is a Postgres `date` ('yyyy-mm-dd'). Build and parse it in
// local time on purpose: new Date('yyyy-mm-dd') is UTC midnight, which
// shifts the day for anyone west of Greenwich.
export function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseISODate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function weeksSince(iso, today = new Date()) {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const days = Math.round((start - parseISODate(iso)) / 86400000)
  return Math.max(0, Math.floor(days / 7))
}

// ISO date strings sort like dates, so string comparison is enough.
export function lastMetOn(meetups) {
  return meetups.reduce(
    (last, m) => (!last || m.met_on > last ? m.met_on : last),
    null,
  )
}

// null weeks means never logged.
export function quietLabel(weeks) {
  if (weeks === null) return '—'
  return weeks === 0 ? 'this wk' : `${weeks}w`
}

// The fade is the whole signal: the grid keeps a stable order and quiet
// people grey out instead of being re-ranked. Ten weeks is fully faded;
// never-logged sits there too, which doubles as a nudge to log something.
export function fadeFor(weeks) {
  const t = weeks === null ? 1 : Math.min(weeks / 10, 1)
  return { grayscale: t, opacity: 1 - t * 0.45 }
}

export function formatDay(iso) {
  return parseISODate(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

// Most recent occurrence of a weekday (Mon=0), never in the future —
// "we did the thing on Tuesday" logged on Thursday means two days ago.
export function dateForWeekday(idx, today = new Date()) {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const todayIdx = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - ((todayIdx - idx + 7) % 7))
  return d
}

export function describeSaveError(error) {
  if (!error) return null
  const message = error.message ?? ''
  if (/failed to fetch|networkerror|load failed/i.test(message)) {
    return "Couldn't reach the server. Nothing was saved."
  }
  return message || "It didn't save, and it declined to say why."
}
