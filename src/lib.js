export const STATUS_OPTIONS = ['not started', 'in progress', 'passed', 'failed']

let csrfToken = ''

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || 'Request failed')
  }
  return response.json()
}

export async function fetchCsrfToken() {
  const data = await api('/api/csrf-token')
  csrfToken = data.csrfToken
}

export const authApi = {
  login: (email, password) => api('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => api('/api/logout', { method: 'POST', body: '{}' }),
  currentUser: () => api('/api/current-user'),
}

export const progressApi = {
  load: () => api('/api/progress'),
  save: (taskId, status, evidence) => api('/api/progress', { method: 'POST', body: JSON.stringify({ taskId, status, evidence }) }),
}

export function buildGradingPrompt(task, evidence) {
  return `You are grading an LFCS practice task submission.\n\nTask title: ${task.title}\nDomain: ${task.domain}\nPrerequisite lesson: ${task.prerequisiteLesson}\nAchievement criteria: ${task.achievementCriteria}\nEnd task: ${task.endTask}\nRequired evidence: ${task.requiredEvidence}\nGrading prompt: ${task.gradingPrompt}\n\nUser submitted evidence:\n${evidence || '[No evidence provided]'}\n\nInstructions:\n- Grade strictly against the requirements above.\n- Return: Result (Pass/Fail), Findings, Missing Evidence, and Next Actions.\n- Do not assume unstated work was completed.`
}
