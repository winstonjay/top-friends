import './App.css'
import { useSession } from './lib/useSession.js'
import SignIn from './components/SignIn.jsx'
import Shell from './components/Shell.jsx'

function App() {
  const { session, loading } = useSession()

  if (loading) return <main className="app" />
  if (!session) {
    return (
      <main className="app">
        <SignIn />
      </main>
    )
  }

  return <Shell session={session} />
}

export default App
