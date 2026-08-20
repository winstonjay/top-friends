import { describe, it, expect } from 'vitest'
import {
  dateForWeekday,
  describeSaveError,
  fadeFor,
  hueFor,
  lastMetOn,
  parseISODate,
  quietLabel,
  toISODate,
  weeksSince,
} from './friends.js'

// 20 Aug 2026 is a Thursday.
const today = new Date(2026, 7, 20)

describe('hueFor', () => {
  it('is deterministic', () => {
    expect(hueFor('abc-123')).toBe(hueFor('abc-123'))
  })

  it('stays on the colour wheel', () => {
    for (const id of ['a', 'kim', '550e8400-e29b-41d4-a716-446655440000']) {
      const hue = hueFor(id)
      expect(hue).toBeGreaterThanOrEqual(0)
      expect(hue).toBeLessThan(360)
    }
  })
})

describe('ISO dates', () => {
  it('round-trips through local time', () => {
    expect(toISODate(parseISODate('2026-08-03'))).toBe('2026-08-03')
  })

  it('pads single digits', () => {
    expect(toISODate(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('weeksSince', () => {
  it('counts whole weeks', () => {
    expect(weeksSince('2026-08-20', today)).toBe(0)
    expect(weeksSince('2026-08-14', today)).toBe(0)
    expect(weeksSince('2026-08-13', today)).toBe(1)
    expect(weeksSince('2026-06-01', today)).toBe(11)
  })

  it('never goes negative for a future date', () => {
    expect(weeksSince('2026-08-25', today)).toBe(0)
  })
})

describe('lastMetOn', () => {
  it('is null with no meetups', () => {
    expect(lastMetOn([])).toBeNull()
  })

  it('finds the most recent date', () => {
    expect(
      lastMetOn([
        { met_on: '2026-08-01' },
        { met_on: '2026-08-14' },
        { met_on: '2026-07-20' },
      ]),
    ).toBe('2026-08-14')
  })
})

describe('quietLabel', () => {
  it('covers never, this week, and the count', () => {
    expect(quietLabel(null)).toBe('—')
    expect(quietLabel(0)).toBe('this wk')
    expect(quietLabel(3)).toBe('3w')
  })
})

describe('fadeFor', () => {
  it('starts fully alive', () => {
    expect(fadeFor(0)).toEqual({ grayscale: 0, opacity: 1 })
  })

  it('is fully faded at ten weeks and beyond', () => {
    expect(fadeFor(10)).toEqual({ grayscale: 1, opacity: 0.55 })
    expect(fadeFor(25)).toEqual({ grayscale: 1, opacity: 0.55 })
  })

  it('treats never-logged as fully faded', () => {
    expect(fadeFor(null)).toEqual({ grayscale: 1, opacity: 0.55 })
  })
})

describe('dateForWeekday', () => {
  it('is today for today', () => {
    expect(toISODate(dateForWeekday(3, today))).toBe('2026-08-20')
  })

  it('goes back within the week', () => {
    expect(toISODate(dateForWeekday(0, today))).toBe('2026-08-17')
  })

  it('never lands in the future', () => {
    expect(toISODate(dateForWeekday(4, today))).toBe('2026-08-14')
  })
})

describe('describeSaveError', () => {
  it('is null for no error', () => {
    expect(describeSaveError(null)).toBeNull()
  })

  it('translates a network failure', () => {
    expect(describeSaveError({ message: 'Failed to fetch' })).toMatch(
      /reach the server/i,
    )
  })

  it('passes other messages through', () => {
    expect(describeSaveError({ message: 'row violates policy' })).toBe(
      'row violates policy',
    )
  })
})
