import './Chip.css'

// A pill toggle. aria-pressed carries the state so tests and screen
// readers don't have to read the colour.
export default function Chip({ on, onClick, children }) {
  return (
    <button
      type="button"
      className={on ? 'chip chip-on' : 'chip'}
      aria-pressed={Boolean(on)}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
