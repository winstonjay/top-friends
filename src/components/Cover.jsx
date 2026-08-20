import { useEffect } from 'react'
import RoundButton from './RoundButton.jsx'
import './Cover.css'

// Full-screen cover, not a bottom sheet. On a phone a sheet is a cover
// with worse ergonomics — this owns the whole screen, slides up, and has
// exactly one way out: the circle in the top-right (or Escape).
export default function Cover({ label, onClose, children }) {
  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="cover" role="dialog" aria-modal="true" aria-label={label}>
      <div className="cover-top">
        <RoundButton icon="close" label="Close" onClick={onClose} />
      </div>
      <div className="cover-body">{children}</div>
    </div>
  )
}
