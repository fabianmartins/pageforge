# Controllers

Controllers are the server-side data layer. Each controller wraps an `APIClient` to provide typed methods for a single resource.

## Table of Contents

- [APIClient Interface](#apiclient-interface)
- [Implementing an APIClient](#implementing-an-apiclient)
- [Controller Pattern](#controller-pattern)
- [Server-Only Usage](#server-only-usage)
- [Complete Example](#complete-example)

---

## APIClient Interface

`APIClient` is an interface — the framework does not provide an implementation. You bring your own HTTP client with whatever auth strategy your backend requires.

```typescript
interface APIClient {
  call(api: string, action: string, body?: Record<string, any>): Promise<any>;
}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `api` | `string` | Named API identifier (e.g., `'main'`, `'internal'`) |
| `action` | `string` | Action or path to call (appended to the base URL) |
| `body` | `Record<string, any>` | Optional request body |

---

## Implementing an APIClient

### Simple (no auth)

```typescript
import type { APIClient } from 'pageforge';

export class SimpleAPIClient implements APIClient {
  constructor(private baseUrl: string) {}

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
```

### Bearer token (Okta, Azure AD, etc.)

```typescript
import type { APIClient } from 'pageforge';

export class BearerAPIClient implements APIClient {
  constructor(private apiUrls: Record<string, string>, private getToken: () => Promise<string>) {}

  async call(api: string, action: string, body: Record<string, any> = {}): Promise<any> {
    const baseUrl = this.apiUrls[api];
    if (!baseUrl) throw new Error(`Unknown API: "${api}"`);
    const token = await this.getToken();
    const res = await fetch(`${baseUrl}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
    return res.json();
  }
}
```

### AWS SigV4

See the [reference implementation](../examples/admin-console/server/sigv4-client.ts) for a complete SigV4 client using `@smithy/signature-v4`.

---

## Controller Pattern

Create one controller per resource. Each controller receives an `APIClient` instance and exposes domain-specific methods.

### BaseController

The framework exports an abstract `BaseController` you can extend:

```typescript
import { BaseController } from 'pageforge';
import type { APIClient } from 'pageforge';

abstract class BaseController {
  protected apiClient: APIClient;
  constructor(apiClient: APIClient);

  abstract list(params?: any): Promise<{ items: any[]; nextToken?: string }>;
  abstract get(id: string): Promise<any>;

  // Optional
  create?(data: any): Promise<any>;
  delete?(id: string): Promise<void>;
}
```

In practice, most controllers skip `BaseController` and implement a plain class directly — the pattern is the same either way:

```typescript
export class NetworkController {
  constructor(private apiClient: APIClient) {}

  async list() { return this.apiClient.call('main', 'listNetworks'); }
  async get(id: string) { return this.apiClient.call('main', 'getNetwork', { networkId: id }); }
  async create(data: Record<string, unknown>) { return this.apiClient.call('main', 'createNetwork', data); }
  async delete(id: string) { return this.apiClient.call('main', 'deleteNetwork', { networkId: id }); }
}
```

---

## Server-Only Usage

Controllers and `APIClient` implementations that use Node.js-only dependencies must never run in the browser.

### Rules

1. **Use `.server.ts` suffix** for the API client singleton:
   ```
   app/lib/api-client.server.ts   ← Remix excludes this from client bundles
   ```

2. **Import controllers only in `loader`/`action` functions** — these run server-side in Remix:
   ```tsx
   // ✅ Correct — loader runs on the server
   export async function loader() {
     const controller = new NetworkController(apiClient);
     const data = await controller.list();
     return json({ items: data.networks ?? [] });
   }
   ```

3. **Never import your APIClient implementation in a React component**:
   ```tsx
   // ❌ Wrong — this would bundle server code into the client
   import { apiClient } from '~/lib/api-client.server';
   export default function MyComponent() { /* ... */ }
   ```

---

## Complete Example

### API Client Singleton

```typescript
// app/lib/api-client.server.ts
import { SimpleAPIClient } from './simple-client';

export const apiClient = new SimpleAPIClient('http://localhost:3001');
```

### Controller

```typescript
// app/controllers/network.controller.ts
import type { APIClient } from 'pageforge';

export class NetworkController {
  constructor(private apiClient: APIClient) {}

  async list() {
    return this.apiClient.call('main', 'listNetworks');
  }

  async get(id: string) {
    return this.apiClient.call('main', 'getNetwork', { networkId: id });
  }

  async create(data: Record<string, unknown>) {
    return this.apiClient.call('main', 'createNetwork', data);
  }

  async delete(id: string) {
    return this.apiClient.call('main', 'deleteNetwork', { networkId: id });
  }
}
```

### Route Using the Controller

```tsx
// app/routes/_app.networks.tsx
import { json, type ActionFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigate, useFetcher } from '@remix-run/react';
import { ListPage } from 'pageforge';
import { apiClient } from '~/lib/api-client.server';
import { NetworkController } from '~/controllers/network.controller';
import config from '~/pages/networks.json';

const controller = new NetworkController(apiClient);

export async function loader() {
  const data = await controller.list();
  return json({ items: data.networks ?? [] });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  await controller.delete(formData.get('id') as string);
  return json({ success: true });
}

export default function NetworksRoute() {
  const { items } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const fetcher = useFetcher();

  return (
    <ListPage
      config={config}
      items={items}
      loading={fetcher.state === 'submitting'}
      onAction={(action, selected) => {
        if (action === 'create') navigate('/networks/create');
        if (action === 'delete' && selected?.[0]) {
          fetcher.submit({ id: selected[0].id }, { method: 'post' });
        }
      }}
    />
  );
}
```
