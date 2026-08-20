---
name: the-wall
description: Design decisions for the home screen (the wall), the add flow, and meetup logging. Load before touching Home, covers, the nav, or anything that draws a friend.
---

# The wall

## Stable order, fade as the signal

The grid keeps creation order forever. Going quiet greys a circle out
(full grayscale at ten weeks) instead of re-ranking — a wall that
reshuffles itself punishes you for looking at it. Never logged renders
fully faded with a "—" label; that's the nudge to log something, not a
bug. If a suggestion mechanism arrives later it's a separate element
above the grid, not a reordering.

## A person's colour is derived, not stored

Hue is a hash of the row id (`hueFor` in `src/lib/friends.js`). No hue
column, no picker, stable across devices. If people ever get photos, the
photo replaces the gradient and the hash keeps working for everyone
without one.

## Covers, not sheets

Anything modal (adding someone, a person's page) is a full-screen cover
that slides up, with one way out: the close circle top-right, or Escape.
On a 390px phone a bottom sheet is a full-screen cover with worse
ergonomics, so we skip the pretence. `Cover.jsx` is the one
implementation; don't add a second modal style.

## No bars

The nav is not a bar — no border, no fill. Circle buttons with a thin
line (`RoundButton.jsx`) floating over the page: settings/back on the
left, add on the right. The + only shows on the wall itself (not in
settings, not before a profile exists), because that's the only place it
means anything.

## Logging is one tap plus honesty

Default log is "Catch-up, this week" — two facts, no form. Bindings
(standing things) appear as chips once they exist; "+ New thing" names
one inline at the moment it first happens, which is the only time anyone
can be bothered. The day picker is hidden behind a disclosure because
precision is optional; "this week" is an acceptable answer. No notes
field yet — if it arrives it stays optional and collapsed.

## Tier vocabulary is settled

`childhood | uni | adult | new`, labelled Childhood / University /
Adult era / New. Enforced by a check constraint (depth_tier migration)
and mirrored by `TIERS` in `src/lib/friends.js`. Changing the vocabulary
means a migration plus that object, together.
