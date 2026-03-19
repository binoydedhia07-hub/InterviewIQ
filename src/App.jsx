import { useState, useCallback } from 'react'
import InputForm from './components/InputForm.jsx'
import Results from './components/Results.jsx'

const INITIAL_SESSION = () => ({
  id: Date.now(),
  notes: '',
  context: { role: '', companySize: '', useCase: '' },
  result: null,
})

export default function App() {
  const [sessions, setSessions] = useState([INITIAL_SESSION()])
  const [activeId, setActiveId] = useState(sessions[0].id)
  const [loading, setLoading] = useState(false)
  const [crossResult, setCrossResult] = useState(null)
  const [error, setError] = useState(null)
  const [view, setView] = useState('input') // 'input' | 'result' | 'cross'

  const activeSession = sessions.find(s => s.id === activeId)

  const updateSession = useCallback((id, patch) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s))
  }, [])

  const addSession = () => {
    const s = INITIAL_SESSION()
    setSessions(prev => [...prev, s])
    setActiveId(s.id)
    setView('input')
  }

  const deleteSession = (id) => {
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id)
      if (next.length === 0) {
        const fresh = INITIAL_SESSION()
        setActiveId(fresh.id)
        setView('input')
        return [fresh]
      }
      if (id === activeId) {
        setActiveId(next[0].id)
        setView(next[0].result ? 'result' : 'input')
      }
      return next
    })
  }

  const synthesizeOne = async () => {
    if (!activeSession.notes.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: activeSession.notes,
          context: activeSession.context,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Synthesis failed')
      updateSession(activeId, { result: data })
      setView('result')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const synthesizeAll = async () => {
    const withNotes = sessions.filter(s => s.notes.trim())
    if (withNotes.length < 2) return
    setLoading(true)
    setError(null)
    setCrossResult(null)
    try {
      const res = await fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allSessions: withNotes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Synthesis failed')
      setCrossResult(data)
      setView('cross')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const sessionsWithNotes = sessions.filter(s => s.notes.trim())

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">Interview<br />Synthesizer</div>
        <div className="sidebar-tagline">B2B user research toolkit</div>

        <div className="sidebar-section-label">Sessions</div>

        <div className="session-list">
          {sessions.map((s, i) => (
            <div
              key={s.id}
              className={`session-card ${s.id === activeId && view !== 'cross' ? 'active' : ''}`}
              onClick={() => { setActiveId(s.id); setView(s.result ? 'result' : 'input') }}
            >
              <div className="session-card-title">
                {s.context.role || `Interview ${i + 1}`}
              </div>
              <div className="session-card-meta">
                {s.context.companySize ? `${s.context.companySize} · ` : ''}
                {s.notes.trim() ? `${s.notes.trim().split(' ').length} words` : 'No notes yet'}
                {s.result ? ' · ✓ synthesized' : ''}
              </div>
              <button
                className="session-delete"
                onClick={(e) => { e.stopPropagation(); deleteSession(s.id) }}
              >✕</button>
            </div>
          ))}
        </div>

        <button className="btn-add-session" onClick={addSession}>
          + Add interview
        </button>

        {sessionsWithNotes.length >= 2 && (
          <button
            className="btn-synthesize-all"
            onClick={synthesizeAll}
            disabled={loading}
          >
            Synthesize {sessionsWithNotes.length} interviews
          </button>
        )}
      </aside>

      {/* Main */}
      <main className="main">
        {loading ? (
          <div className="loading-state">
            <div className="loading-dots">
              <div className="loading-dot" />
              <div className="loading-dot" />
              <div className="loading-dot" />
            </div>
            <div className="loading-text">Synthesizing insights…</div>
          </div>
        ) : view === 'input' && activeSession ? (
          <InputForm
            session={activeSession}
            onUpdate={(patch) => updateSession(activeId, patch)}
            onSubmit={synthesizeOne}
            error={error}
          />
        ) : (view === 'result' && activeSession?.result) ? (
          <Results
            result={activeSession.result}
            isCross={false}
            onBack={() => setView('input')}
          />
        ) : (view === 'cross' && crossResult) ? (
          <Results
            result={crossResult}
            isCross={true}
            sessionCount={sessionsWithNotes.length}
            onBack={() => setView('input')}
          />
        ) : (
          <div className="empty-state">
            <div className="empty-title">No result yet</div>
            <div className="empty-sub">Add your interview notes and hit synthesize.</div>
          </div>
        )}
      </main>
    </div>
  )
}
