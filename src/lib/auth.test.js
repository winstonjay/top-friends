import { describe, it, expect } from 'vitest'
import {
  describeAuthError,
  isEmailish,
  normalizeEmail,
  stripAuthParams,
} from './auth.js'

describe('normalizeEmail', () => {
  it('trims and lowercases', () => {
    expect(normalizeEmail('  Karl@Example.COM ')).toBe('karl@example.com')
  })

  it('survives nothing at all', () => {
    expect(normalizeEmail(undefined)).toBe('')
    expect(normalizeEmail(null)).toBe('')
  })
})

describe('isEmailish', () => {
  it('accepts something deliverable-looking', () => {
    expect(isEmailish('karl@example.com')).toBe(true)
    expect(isEmailish('karl+top8@mail.example.co.uk')).toBe(true)
  })

  it('rejects the obvious misses', () => {
    expect(isEmailish('')).toBe(false)
    expect(isEmailish('karl')).toBe(false)
    expect(isEmailish('karl@example')).toBe(false)
    expect(isEmailish('karl @example.com')).toBe(false)
  })
})

describe('describeAuthError', () => {
  it('says nothing when nothing went wrong', () => {
    expect(describeAuthError(null)).toBeNull()
  })

  it('explains a missing account', () => {
    expect(describeAuthError({ code: 'otp_disabled' })).toMatch(/no account/i)
    expect(
      describeAuthError({ message: 'Signups not allowed for otp' }),
    ).toMatch(/no account/i)
  })

  it('explains rate limiting', () => {
    expect(describeAuthError({ status: 429, message: 'nope' })).toMatch(
      /wait a minute/i,
    )
    expect(describeAuthError({ code: 'over_email_send_rate_limit' })).toMatch(
      /wait a minute/i,
    )
  })

  it('explains a dead connection', () => {
    expect(describeAuthError({ message: 'Failed to fetch' })).toMatch(
      /couldn't reach/i,
    )
  })

  it('falls back to whatever Supabase said', () => {
    expect(describeAuthError({ message: 'Email link is invalid' })).toBe(
      'Email link is invalid',
    )
  })

  it('has something to say about a silent failure', () => {
    expect(describeAuthError({})).toMatch(/declined to say/i)
  })
})

describe('stripAuthParams', () => {
  it('drops the PKCE code', () => {
    expect(stripAuthParams('https://x.test/?code=abc123')).toBe(
      'https://x.test/',
    )
  })

  it('drops an error handed back on the query', () => {
    expect(
      stripAuthParams(
        'https://x.test/?error=access_denied&error_code=otp_expired',
      ),
    ).toBe('https://x.test/')
  })

  it('drops an implicit-flow hash', () => {
    expect(
      stripAuthParams('https://x.test/#access_token=abc&expires_in=3600'),
    ).toBe('https://x.test/')
  })

  it('leaves an ordinary URL alone', () => {
    const href = 'https://x.test/people?sort=name#top'
    expect(stripAuthParams(href)).toBe(href)
  })
})
