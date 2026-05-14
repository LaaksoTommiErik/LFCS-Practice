import { Link } from 'react-router-dom'
import { STATUS_OPTIONS } from '../lib'

const badgeClassByStatus = {
  'not started': 'status-badge not-started',
  'in progress': 'status-badge in-progress',
  passed: 'status-badge passed',
  failed: 'status-badge failed',
}

export default function TaskCard({ task, status, onStatusChange }) {
  return (
    <article className="task-card panel">
      <div>
        <div className="task-card-head">
          <span className={badgeClassByStatus[status] ?? 'status-badge'}>{status}</span>
          <span className="task-id">{task.id}</span>
        </div>
        <h3>{task.title}</h3>
        <p>{task.achievementCriteria}</p>
      </div>
      <div className="task-card-actions">
        <label>
          Status
          <select value={status} onChange={(e) => onStatusChange(task.id, e.target.value)}>
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
        <Link to={`/task/${task.id}`}>View details →</Link>
      </div>
    </article>
  )
}
