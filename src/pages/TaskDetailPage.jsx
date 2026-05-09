import { Link, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { STATUS_OPTIONS, buildGradingPrompt } from '../lib'

export default function TaskDetailPage({ tasksById, progress, onStatusChange, onEvidenceChange }) {
  const { taskId } = useParams()
  const task = tasksById[taskId]
  const [copied, setCopied] = useState(false)
  const [evidence, setEvidence] = useState(progress[taskId]?.evidence ?? '')

  useEffect(() => {
    setEvidence(progress[taskId]?.evidence ?? '')
  }, [progress, taskId])

  const strictPrompt = useMemo(() => (task ? buildGradingPrompt(task, evidence) : ''), [task, evidence])

  if (!task) {
    return <div><p>Task not found.</p><Link to="/">Back to dashboard</Link></div>
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(strictPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div>
      <Link to="/">← Back to dashboard</Link>
      <h1>{task.title}</h1>
      <p><strong>Domain:</strong> {task.domain}</p>
      <p><strong>Prerequisite lesson:</strong> {task.prerequisiteLesson}</p>
      <p><strong>Achievement criteria:</strong> {task.achievementCriteria}</p>
      <p><strong>End task:</strong> {task.endTask}</p>
      <p><strong>Required evidence:</strong> {task.requiredEvidence}</p>
      <p><strong>Grading prompt:</strong> {task.gradingPrompt}</p>

      <label>Status
        <select value={progress[taskId]?.status ?? 'not started'} onChange={(e) => onStatusChange(taskId, e.target.value)}>
          {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </label>

      <label>Your evidence
        <textarea
          value={evidence}
          onChange={(e) => {
            const value = e.target.value
            setEvidence(value)
            onEvidenceChange(taskId, value)
          }}
          rows={8}
        />
      </label>

      <button onClick={handleCopy}>Copy strict ChatGPT grading prompt</button>
      {copied && <span> Copied!</span>}
      <details><summary>Preview generated prompt</summary><pre>{strictPrompt}</pre></details>
    </div>
  )
}
