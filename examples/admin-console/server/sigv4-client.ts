import { SignatureV4 } from '@smithy/signature-v4';
import { HttpRequest } from '@smithy/protocol-http';
import { Sha256 } from '@aws-crypto/sha256-js';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import type { APIClient } from 'pageforge';

/**
 * APIClient implementation that signs requests with AWS SigV4.
 * Use this when your backend is behind AWS API Gateway with IAM auth.
 *
 * Required dependencies (install in your project):
 *   npm install @smithy/signature-v4 @smithy/protocol-http @aws-crypto/sha256-js @aws-sdk/credential-provider-node
 */
export class SigV4APIClient implements APIClient {
  private region: string;
  private apiUrls: Record<string, string>;

  constructor(config: { region: string; apiUrls: Record<string, string> }) {
    this.region = config.region;
    this.apiUrls = config.apiUrls;
  }

  async call(api: string, action: string, body: Record<string, any> = {}): Promise<any> {
    const baseUrl = this.apiUrls[api];
    if (!baseUrl) throw new Error(`Unknown API: "${api}"`);

    const url = new URL(`${baseUrl}/${action}`);
    const payload = JSON.stringify(body);

    const signer = new SignatureV4({
      service: 'execute-api',
      region: this.region,
      credentials: defaultProvider(),
      sha256: Sha256,
    });

    const request = new HttpRequest({
      method: 'POST',
      hostname: url.hostname,
      path: url.pathname,
      headers: { 'Content-Type': 'application/json', host: url.hostname },
      body: payload,
    });

    const signed = await signer.sign(request);

    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: signed.headers as Record<string, string>,
      body: payload,
    });

    if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
    return res.json();
  }
}
