import { Routes, Route } from 'react-router-dom'
import { useMemo, useState } from 'react'
import roadmap from './data/roadmap.json'
import DashboardPage from './pages/DashboardPage'
import TaskDetailPage from './pages/TaskDetailPage'
import { loadProgress, saveProgress } from './lib'

export default function App() {
  const [progress, setProgress] = useState(() => loadProgress())

  const tasksById = useMemo(() => {
    const map = {}
    roadmap.forEach((week) => week.tasks.forEach((task) => { map[task.id] = task }))
    return map
  }, [])

  const updateProgress = (taskId, patch) => {
    setProgress((current) => {
      const next = {
        ...current,
        [taskId]: {
          status: 'not started',
          evidence: '',
          ...(current[taskId] || {}),
          ...patch,
        },
      }
      saveProgress(next)
      return next
    })
  }

  return (
    <main className="container">
      <Routes>
        <Route path="/" element={<DashboardPage roadmap={roadmap} progress={progress} onStatusChange={(id, status) => updateProgress(id, { status })} />} />
        <Route path="/task/:taskId" element={<TaskDetailPage tasksById={tasksById} progress={progress} onStatusChange={(id, status) => updateProgress(id, { status })} onEvidenceChange={(id, evidence) => updateProgress(id, { evidence })} />} />
      </Routes>
    </main>
  )
}
