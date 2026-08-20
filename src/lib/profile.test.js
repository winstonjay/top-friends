import { describe, it, expect } from 'vitest'
import {
  NAME_MAX,
  describeProfileError,
  isNameValid,
  normalizeName,
} from './profile.js'

describe('normalizeName', () => {
  it('trims the edges', () => {
    expect(normalizeName('  Karl  ')).toBe('Karl')
  })

  it('collapses runs of whitespace', () => {
    expect(normalizeName('Karl   van\t\nSims')).toBe('Karl van Sims')
  })

  it('survives nothing at all', () => {
    expect(normalizeName(undefined)).toBe('')
    expect(normalizeName(null)).toBe('')
  })

  it('leaves a name that needs no help', () => {
    expect(normalizeName('Karl')).toBe('Karl')
  })
})

describe('isNameValid', () => {
  it('wants at least something', () => {
    expect(isNameValid('')).toBe(false)
    expect(isNameValid('K')).toBe(true)
  })

  it('stops at the same length the database does', () => {
    expect(isNameValid('a'.repeat(NAME_MAX))).toBe(true)
    expect(isNameValid('a'.repeat(NAME_MAX + 1))).toBe(false)
  })
})

describe('describeProfileError', () => {
  it('says nothing when nothing went wrong', () => {
    expect(describeProfileError(null)).toBeNull()
  })

  it('translates the check constraint', () => {
    expect(describeProfileError({ code: '23514' })).toMatch(
      new RegExp(`${NAME_MAX} characters`),
    )
  })

  it('is clear that a dead connection means unsaved', () => {
    expect(describeProfileError({ message: 'Failed to fetch' })).toMatch(
      /not saved/i,
    )
  })

  it('falls back to whatever Postgres said', () => {
    expect(describeProfileError({ message: 'permission denied' })).toBe(
      'permission denied',
    )
  })
})
