// Pure helpers for the display name, kept out of the components so the
// rules live in one place — and so the check constraint in the profiles
// migration has an obvious counterpart on this side.

export const NAME_MAX = 40

export function normalizeName(raw) {
  return String(raw ?? '')
    .trim()
    .replace(/\s+/g, ' ')
}

export function isNameValid(name) {
  return name.length > 0 && name.length <= NAME_MAX
}

export function describeProfileError(error) {
  if (!error) return null

  const code = error.code ?? ''
  const message = error.message ?? ''

  // 23514 is a check constraint — in this table, only the name rule.
  if (code === '23514') {
    return `That name is either empty or longer than ${NAME_MAX} characters.`
  }
  if (/failed to fetch|networkerror|load failed/i.test(message)) {
    return "Couldn't reach the server. The name is not saved."
  }

  return message || "It didn't save, and it declined to say why."
}
