// Pure helpers behind the sign-in screen. Kept out of the component so
// the fiddly bits — what counts as an address, what a Supabase error
// should say out loud — can be tested without rendering anything.

const EMAILISH = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeEmail(raw) {
  return String(raw ?? '').trim().toLowerCase()
}

// Deliberately loose. The only opinion worth having in the browser is
// "this could plausibly be delivered to"; the real verdict arrives when
// the link does, or doesn't.
export function isEmailish(email) {
  return EMAILISH.test(email)
}

export function describeAuthError(error) {
  if (!error) return null

  const code = error.code ?? ''
  const message = error.message ?? ''
  const status = error.status ?? 0

  if (code === 'otp_disabled' || /signups? not allowed/i.test(message)) {
    return "No account for that address. This app doesn't hand them out — add the user in the Supabase dashboard."
  }
  if (code === 'over_email_send_rate_limit' || status === 429) {
    return 'That is a lot of links for one person. Wait a minute.'
  }
  if (/failed to fetch|networkerror|load failed/i.test(message)) {
    return "Couldn't reach the server. Might be you, might be them."
  }

  return message || 'It failed, and it declined to say why.'
}

// Supabase returns the session on the URL — `?code=…` under PKCE,
// `#access_token=…` under the implicit flow. The client swallows it on
// load; this strips the leftovers so a refresh, a bookmark, or a shared
// link isn't quietly carrying a spent credential around.
export function stripAuthParams(href) {
  const url = new URL(href)

  for (const key of ['code', 'error', 'error_code', 'error_description']) {
    url.searchParams.delete(key)
  }
  if (/(^|[#&])(access_token|refresh_token|error)=/.test(url.hash)) {
    url.hash = ''
  }

  return url.toString()
}
