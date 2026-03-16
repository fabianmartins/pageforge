import type { APIClient } from 'pageforge';

/**
 * Simple APIClient that calls a local Express server with no auth.
 * For production with AWS API Gateway + SigV4, see server/sigv4-client.ts.
 */
export class LocalAPIClient implements APIClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async call(_api: string, action: string, body: Record<string, any> = {}): Promise<any> {
    const res = await fetch(`${this.baseUrl}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
    return res.json();
  }
}
