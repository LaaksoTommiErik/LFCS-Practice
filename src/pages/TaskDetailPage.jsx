import './task-detail.css'
import { Link, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { STATUS_OPTIONS, buildGradingPrompt } from '../lib'

const badgeClassByStatus = {
  'not started': 'status-badge not-started',
  'in progress': 'status-badge in-progress',
  passed: 'status-badge passed',
  failed: 'status-badge failed',
}

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

  const currentStatus = progress[taskId]?.status ?? 'not started'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(strictPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <section className="detail-page">
      <Link className="back-link" to="/">← Back to dashboard</Link>

      <header className="panel detail-hero">
        <div>
          <p className="eyebrow">{task.domain}</p>
          <h1>{task.title}</h1>
          <p className="helper-text">Capture evidence and grading context before marking this task as passed.</p>
        </div>
        <span className={badgeClassByStatus[currentStatus] ?? 'status-badge'}>{currentStatus}</span>
      </header>

      <div className="detail-grid">
        <article className="panel">
          <h2>Task specification</h2>
          <dl className="detail-list">
            <div><dt>Prerequisite lesson</dt><dd>{task.prerequisiteLesson}</dd></div>
            <div><dt>Achievement criteria</dt><dd>{task.achievementCriteria}</dd></div>
            <div><dt>End task</dt><dd>{task.endTask}</dd></div>
            <div><dt>Required evidence</dt><dd>{task.requiredEvidence}</dd></div>
            <div><dt>Grading prompt</dt><dd>{task.gradingPrompt}</dd></div>
          </dl>
        </article>

        <article className="panel">
          <h2>Progress control</h2>
          <label>Status
            <select value={currentStatus} onChange={(e) => onStatusChange(taskId, e.target.value)}>
              {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <p className="helper-text">Mark tasks passed only when command output, screenshot evidence, or a clear written explanation is present.</p>
        </article>
      </div>

      <article className="panel evidence-panel">
        <h2>Evidence capture</h2>
        <label>Your evidence
          <textarea
            value={evidence}
            onChange={(e) => {
              const value = e.target.value
              setEvidence(value)
              onEvidenceChange(taskId, value)
            }}
            rows={10}
            placeholder="Paste terminal commands, outputs, links to screenshots, and your explanation of what was validated."
          />
        </label>
        <p className="evidence-count">{evidence.length} chars</p>
      </article>

      <article className="panel">
        <h2>Strict grading</h2>
        <button onClick={handleCopy}>Copy grading prompt</button>
        {copied && <span className="success-text">Copied!</span>}
        <details>
          <summary>Preview generated prompt</summary>
          <pre>{strictPrompt}</pre>
        </details>
      </article>
    </section>
  )
}
