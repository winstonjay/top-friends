import { fadeFor, hueFor } from '../lib/friends.js'
import './FriendCircle.css'

// The circle is the person: colour hashed from their id, initial on a
// gradient, greying out as the weeks pile up. Decorative — the name is
// always printed next to it, so this is aria-hidden.
export default function FriendCircle({ person, weeks, size = 64 }) {
  const hue = hueFor(person.id)
  const { grayscale, opacity } = fadeFor(weeks)

  return (
    <span
      className="friend-circle"
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `linear-gradient(140deg, hsl(${hue} 45% 60%), hsl(${hue + 30} 35% 42%))`,
        filter: `grayscale(${grayscale})`,
        opacity,
      }}
    >
      {person.name[0]}
    </span>
  )
}
