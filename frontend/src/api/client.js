const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`);
  return res.json();
}

export async function analyzePrompt(formData) {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    throw new Error('Analysis failed');
  }
  return res.json();
}

export async function compareModels(prompt, dolaAlpha = 0.5) {
  const res = await fetch(`${API_BASE}/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, dola_alpha: dolaAlpha }),
  });
  if (!res.ok) {
    throw new Error('Model comparison failed');
  }
  return res.json();
}

export async function checkMedicalGuard(patientId, modality, findingPrompt) {
  const res = await fetch(`${API_BASE}/medical-guard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patient_id: patientId,
      modality,
      finding_prompt: findingPrompt,
    }),
  });
  if (!res.ok) {
    throw new Error('Medical guard evaluation failed');
  }
  return res.json();
}

export async function fetchMedicalReviews() {
  const res = await fetch(`${API_BASE}/medical-reviews`);
  return res.json();
}

export async function fetchSessions() {
  const res = await fetch(`${API_BASE}/sessions`);
  return res.json();
}

export async function fetchSessionDetail(id) {
  const res = await fetch(`${API_BASE}/sessions/${id}`);
  return res.json();
}

export async function deleteSession(id) {
  const res = await fetch(`${API_BASE}/sessions/${id}`, { method: 'DELETE' });
  return res.json();
}

export async function clearSessions() {
  const res = await fetch(`${API_BASE}/clear-sessions`, { method: 'DELETE' });
  return res.json();
}

export async function fetchTrainingSamples() {
  const res = await fetch(`${API_BASE}/training-samples`);
  return res.json();
}

export async function seedDemoData() {
  const res = await fetch(`${API_BASE}/seed-demo`, { method: 'POST' });
  return res.json();
}

export function getExportDatasetUrl() {
  return `${API_BASE}/export-dataset`;
}

