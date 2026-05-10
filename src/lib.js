export const STATUS_OPTIONS = ['not started', 'in progress', 'passed', 'failed']

let csrfToken = ''

function isUnsafeMethod(method) {
  return !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())
}

async function fetchJson(response) {
  return response.json().catch(() => ({}))
}

export async function fetchCsrfToken() {
  const response = await fetch('/api/csrf-token', {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const data = await fetchJson(response)
    throw new Error(data.error || 'Failed to fetch CSRF token')
  }

  const data = await response.json()
  csrfToken = data.csrfToken
  return csrfToken
}

async function api(path, options = {}, retrying = false) {
  const method = options.method || 'GET'
  const needsCsrf = isUnsafeMethod(method)

  if (needsCsrf && !csrfToken) {
    await fetchCsrfToken()
  }

  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(needsCsrf && csrfToken ? { 'x-csrf-token': csrfToken } : {}),
      ...(options.headers || {}),
    },
    ...options,
  })

  if (response.status === 403 && needsCsrf && !retrying) {
    csrfToken = ''
    await fetchCsrfToken()
    return api(path, options, true)
  }

  if (!response.ok) {
    const data = await fetchJson(response)
    throw new Error(data.error || 'Request failed')
  }

  return response.json()
}

export const authApi = {
  login: (email, password) =>
    api('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: async () => {
    try {
      return await api('/api/logout', {
        method: 'POST',
        body: '{}',
      })
    } finally {
      csrfToken = ''
    }
  },

  currentUser: () => api('/api/current-user'),
}

export const progressApi = {
  load: () => api('/api/progress'),

  save: (taskId, status, evidence) =>
    api('/api/progress', {
      method: 'POST',
      body: JSON.stringify({ taskId, status, evidence }),
    }),
}

export function buildGradingPrompt(task, evidence) {
  return `You are grading an LFCS practice task submission.\n\nTask title: ${task.title}\nDomain: ${task.domain}\nPrerequisite lesson: ${task.prerequisiteLesson}\nAchievement criteria: ${task.achievementCriteria}\nEnd task: ${task.endTask}\nRequired evidence: ${task.requiredEvidence}\nGrading prompt: ${task.gradingPrompt}\n\nUser submitted evidence:\n${evidence || '[No evidence provided]'}\n\nInstructions:\n- Grade strictly against the requirements above.\n- Return: Result (Pass/Fail), Findings, Missing Evidence, and Next Actions.\n- Do not assume unstated work was completed.`
}