import RoundButton from './RoundButton.jsx'
import './NavBar.css'

// Not a bar: no border, no fill — just the title and two circles
// floating over the page. Three columns rather than space-between, so
// the title sits in the actual middle instead of the middle of what's
// left over.
export default function NavBar({ settingsOpen, onToggleSettings, onAdd }) {
  return (
    <header className="nav">
      <RoundButton
        icon={settingsOpen ? 'back' : 'settings'}
        label={settingsOpen ? 'Back' : 'Settings'}
        onClick={onToggleSettings}
      />

      <h1 className="nav-title">Top Friends</h1>

      {onAdd ? (
        <RoundButton icon="add" label="Add someone" onClick={onAdd} />
      ) : (
        <span className="nav-spacer" aria-hidden="true" />
      )}
    </header>
  )
}
