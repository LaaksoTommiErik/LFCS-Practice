import TaskCard from '../components/TaskCard'

export default function DashboardPage({ roadmap, progress, onStatusChange }) {
  return (
    <div>
      <h1>LFCS Study Dashboard</h1>
      <p>8-week local-first plan for LFCS/LFS207 preparation.</p>
      {roadmap.map((weekBlock) => (
        <section key={weekBlock.week} className="week-block">
          <h2>Week {weekBlock.week}: {weekBlock.focus}</h2>
          <div className="task-grid">
            {weekBlock.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                status={progress[task.id]?.status ?? 'not started'}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
