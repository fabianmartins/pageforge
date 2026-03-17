import type { APIClient } from 'pageforge';

const API_BASE = 'http://localhost:3001';

class LocalAPIClient implements APIClient {
  async call(_api: string, action: string, body: Record<string, any> = {}): Promise<any> {
    const res = await fetch(`${API_BASE}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
    return res.json();
  }
}

export const apiClient = new LocalAPIClient();
