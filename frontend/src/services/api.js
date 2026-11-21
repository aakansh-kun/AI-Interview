const BASE_URL = '/api';

export async function fetchInterviewers() {
  const res = await fetch(`${BASE_URL}/interview/interviewers`);
  if (!res.ok) throw new Error('Failed to load interviewers');
  return res.json();
}

export async function createInterview(data) {
  const res = await fetch(`${BASE_URL}/interview/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to start interview');
  }
  return res.json();
}

export async function getInterview(sessionId) {
  const res = await fetch(`${BASE_URL}/interview/${sessionId}`);
  if (!res.ok) throw new Error('Interview not found');
  return res.json();
}

export async function submitAnswer(sessionId, answerText, timeTakenSeconds = 0) {
  const res = await fetch(`${BASE_URL}/interview/${sessionId}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answerText, timeTakenSeconds }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to submit answer');
  }
  return res.json();
}

export async function completeInterview(sessionId) {
  const res = await fetch(`${BASE_URL}/interview/${sessionId}/complete`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to complete interview');
  return res.json();
}

export async function getEvaluation(sessionId) {
  const res = await fetch(`${BASE_URL}/interview/${sessionId}/evaluation`);
  if (!res.ok) throw new Error('Failed to retrieve evaluation report');
  return res.json();
}

export async function uploadResume(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${BASE_URL}/resume/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Resume upload failed');
  }
  return res.json();
}

export async function getVoicePreview(interviewerId) {
  const res = await fetch(`${BASE_URL}/audio/preview/${interviewerId}`);
  if (!res.ok) throw new Error('Failed to get voice preview');
  return res.json();
}

export async function checkHealth() {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) return { status: 'offline', gemini_connected: false };
  return res.json();
}
