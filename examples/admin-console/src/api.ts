const API_BASE = 'http://localhost:3001';

export async function api(action: string, body: Record<string, any> = {}) {
  const res = await fetch(`${API_BASE}/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json();
}
