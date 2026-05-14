import TaskCard from '../components/TaskCard'

const STATUS_LABELS = ['not started', 'in progress', 'passed', 'failed']

export default function DashboardPage({ roadmap, progress, onStatusChange }) {
  const tasks = roadmap.flatMap((weekBlock) => weekBlock.tasks)
  const stats = STATUS_LABELS.reduce((acc, label) => ({ ...acc, [label]: 0 }), {})

  tasks.forEach((task) => {
    const status = progress[task.id]?.status ?? 'not started'
    stats[status] = (stats[status] ?? 0) + 1
  })

  const passed = stats.passed || 0
  const percent = tasks.length ? Math.round((passed / tasks.length) * 100) : 0

  return (
    <div className="dashboard-shell">
      <section className="hero-grid">
        <article className="panel hero-panel">
          <p className="eyebrow">Linux / SRE readiness tracker</p>
          <h1>LFCS progress with operational evidence</h1>
          <p className="hero-copy">Track study tasks, collect evidence, and turn your learning into a portfolio-grade operational record.</p>
        </article>

        <article className="panel score-panel">
          <div className="score-ring" style={{ '--p': `${percent}%` }}>
            <div>
              <strong>{percent}%</strong>
              <small>passed</small>
            </div>
          </div>
          <div className="quick-links">
            <h3>Operational links</h3>
            <div className="link-pills">
              <a href="/healthz" target="_blank" rel="noreferrer">/healthz</a>
              <a href="/readyz" target="_blank" rel="noreferrer">/readyz</a>
              <a href="/metrics" target="_blank" rel="noreferrer">/metrics</a>
            </div>
          </div>
        </article>
      </section>

      <section className="stats-grid">
        <article className="panel stat-card"><h2>{tasks.length}</h2><p>Total tasks</p></article>
        <article className="panel stat-card"><h2>{stats['not started'] || 0}</h2><p>not started</p></article>
        <article className="panel stat-card"><h2>{stats['in progress'] || 0}</h2><p>in progress</p></article>
        <article className="panel stat-card"><h2>{passed}</h2><p>passed</p></article>
        <article className="panel stat-card"><h2>{stats.failed || 0}</h2><p>failed</p></article>
      </section>

      {roadmap.map((weekBlock) => (
        <section key={weekBlock.week} className="panel week-block">
          <header className="week-header">
            <h2>Week {weekBlock.week}</h2>
            <p>{weekBlock.focus}</p>
          </header>
          <div className="task-grid">
            {weekBlock.tasks.map((task) => (
              <TaskCard key={task.id} task={task} status={progress[task.id]?.status ?? 'not started'} onStatusChange={onStatusChange} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
