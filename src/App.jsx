import './App.css'
import { useSession } from './lib/useSession.js'
import SignIn from './components/SignIn.jsx'
import SignedIn from './components/SignedIn.jsx'

function App() {
  const { session, loading } = useSession()

  return (
    <main className="app">
      {loading ? null : session ? <SignedIn session={session} /> : <SignIn />}
    </main>
  )
}

export default App
