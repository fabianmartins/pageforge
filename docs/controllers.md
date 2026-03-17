# Controllers

Controllers are the data layer. Each controller wraps an `APIClient` to provide typed methods for a single resource, keeping data access separate from presentation.

> All examples on this page are from the [admin-console](../examples/admin-console/) reference implementation.

## Table of Contents

- [APIClient Interface](#apiclient-interface)
- [Implementing an APIClient](#implementing-an-apiclient)
- [Controller Pattern](#controller-pattern)

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

The admin-console example uses a simple client that calls a local Express server. From `src/api.ts`:

```typescript
import type { APIClient } from 'pageforge';

class LocalAPIClient implements APIClient {
  async call(_api: string, action: string, body: Record<string, any> = {}): Promise<any> {
    const res = await fetch(`http://localhost:3001/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
    return res.json();
  }
}

export const apiClient = new LocalAPIClient();
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

### Example: ProjectController

From `src/controllers/projects.ts`:

```typescript
import { BaseController } from 'pageforge';
import type { APIClient } from 'pageforge';

export class ProjectController extends BaseController {
  constructor(apiClient: APIClient) {
    super(apiClient);
  }

  async list() { return this.apiClient.call('main', 'projects/list'); }
  async get(id: string) { return this.apiClient.call('main', 'projects/get', { id }); }
  async create(data: any) { return this.apiClient.call('main', 'projects/create', data); }
  async update(id: string, data: any) { return this.apiClient.call('main', 'projects/update', { id, ...data }); }
  async delete(id: string) { return this.apiClient.call('main', 'projects/delete', { id }); }
}
```

### Using Controllers in Routes

Instantiate the controller with your `APIClient` and call its methods from route components:

```tsx
// src/routes/ProjectList.tsx
import { ProjectController } from '../controllers/projects';
import { apiClient } from '../api';

const controller = new ProjectController(apiClient);

export function ProjectList() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    controller.list().then(data => setItems(data.items));
  }, []);

  // ... render with ListPage
}
```

This keeps route components focused on presentation while controllers handle all data access. To swap backends (e.g., from a local Express server to API Gateway), you only change the `APIClient` implementation — controllers and routes stay the same.
