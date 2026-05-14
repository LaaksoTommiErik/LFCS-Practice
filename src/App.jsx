import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import roadmap from './data/roadmap.json'
import DashboardPage from './pages/DashboardPage'
import TaskDetailPage from './pages/TaskDetailPage'
import LoginPage from './pages/LoginPage'
import CurrentUserPage from './pages/CurrentUserPage'
import { authApi, fetchCsrfToken, progressApi } from './lib'

export default function App() {
  const [user, setUser] = useState(null)
  const [progress, setProgress] = useState({})
  const [ready, setReady] = useState(false)

  const tasksById = useMemo(() => {
    const map = {}
    roadmap.forEach((week) => week.tasks.forEach((task) => { map[task.id] = task }))
    return map
  }, [])

  useEffect(() => {
    const init = async () => {
      try {
        await fetchCsrfToken()
        const me = await authApi.currentUser()
        setUser(me)
        const saved = await progressApi.load()
        setProgress(saved.progress)
      } catch {
        setUser(null)
      } finally {
        setReady(true)
      }
    }
    init()
  }, [])

  const login = async (email, password) => {
    await authApi.login(email, password)
    const me = await authApi.currentUser()
    const saved = await progressApi.load()
    setUser(me)
    setProgress(saved.progress)
  }

  const updateProgress = async (taskId, patch) => {
    const next = {
      status: 'not started',
      evidence: '',
      ...(progress[taskId] || {}),
      ...patch,
    }
    setProgress((current) => ({ ...current, [taskId]: next }))
    await progressApi.save(taskId, next.status, next.evidence)
  }

  if (!ready) return <main className="container"><p>Loading...</p></main>
  if (!user) return <LoginPage onLogin={login} />

  return (
    <main className="container">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand">LFCS Study Dashboard</div>
          <nav className="main-nav">
            <a href="/">Dashboard</a>
            <a href="/me">Account</a>
            <a href="/healthz" target="_blank" rel="noreferrer">Health</a>
            <a href="/readyz" target="_blank" rel="noreferrer">Readiness</a>
            <a href="/metrics" target="_blank" rel="noreferrer">Metrics</a>
          </nav>
        </div>
        <div className="userbar">
          <span>{user.email}</span>
          <span>{user.role}</span>
          <button onClick={async () => { await authApi.logout(); setUser(null) }}>Logout</button>
        </div>
      </header>
      <Routes>
        <Route path="/" element={<DashboardPage roadmap={roadmap} progress={progress} onStatusChange={(id, status) => updateProgress(id, { status })} />} />
        <Route path="/task/:taskId" element={<TaskDetailPage tasksById={tasksById} progress={progress} onStatusChange={(id, status) => updateProgress(id, { status })} onEvidenceChange={(id, evidence) => updateProgress(id, { evidence })} />} />
        <Route path="/me" element={<CurrentUserPage user={user} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </main>
  )
}
