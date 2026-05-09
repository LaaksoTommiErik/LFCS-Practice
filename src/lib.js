export const STATUS_OPTIONS = ['not started', 'in progress', 'passed', 'failed']

const KEY = 'lfcs-study-dashboard-progress'

export function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

export function saveProgress(progress) {
  localStorage.setItem(KEY, JSON.stringify(progress))
}

export function buildGradingPrompt(task, evidence) {
  return `You are grading an LFCS practice task submission.\n\nTask title: ${task.title}\nDomain: ${task.domain}\nPrerequisite lesson: ${task.prerequisiteLesson}\nAchievement criteria: ${task.achievementCriteria}\nEnd task: ${task.endTask}\nRequired evidence: ${task.requiredEvidence}\nGrading prompt: ${task.gradingPrompt}\n\nUser submitted evidence:\n${evidence || '[No evidence provided]'}\n\nInstructions:\n- Grade strictly against the requirements above.\n- Return: Result (Pass/Fail), Findings, Missing Evidence, and Next Actions.\n- Do not assume unstated work was completed.`
}
