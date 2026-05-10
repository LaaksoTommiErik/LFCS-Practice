import { Link } from 'react-router-dom'
import { STATUS_OPTIONS } from '../lib'

export default function TaskCard({ task, status, onStatusChange }) {
  return (
    <article className="task-card">
      <div>
        <h3>{task.title}</h3>
        <p><strong>Domain:</strong> {task.domain}</p>
        <p><strong>Achievement:</strong> {task.achievementCriteria}</p>
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
        <Link to={`/task/${task.id}`}>View details</Link>
      </div>
    </article>
  )
}
