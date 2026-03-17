# Getting Started

This guide walks you from zero to a running admin console powered by `pageforge`.

> For a complete working example, see the [admin-console](../examples/admin-console/) reference implementation.

## Table of Contents

- [1. Prerequisites](#1-prerequisites)
- [2. Create a Remix App](#2-create-a-remix-app)
- [3. Install Dependencies](#3-install-dependencies)
- [4. Client-Only Rendering (Critical)](#4-client-only-rendering-critical)
- [5. Project Structure](#5-project-structure)
- [6. Create a Controller](#6-create-a-controller)
- [7. Create a Page Config](#7-create-a-page-config)
- [8. Create a Route](#8-create-a-route)
- [9. Set Up the App Layout](#9-set-up-the-app-layout)
- [10. Run It](#10-run-it)

---

## 1. Prerequisites

- **Node.js 18+** and **npm**

## 2. Create a Remix App

```bash
npx create-remix@latest my-console --template remix-run/remix/templates/vite
cd my-console
```

## 3. Install Dependencies

```bash
npm install pageforge @cloudscape-design/components @cloudscape-design/global-styles
```

The framework has peer dependencies on React 18+ and Remix v2, which the template already provides.

## 4. Client-Only Rendering (Critical)

Cloudscape components use `useLayoutEffect` and DOM measurements that produce different output on the server vs the client. This causes **React hydration errors** with Remix's SSR. You must wrap any Cloudscape component usage in a `ClientOnly` wrapper.

Create this component before building any pages:

```tsx
// app/components/client-only.tsx
import { useState, useEffect } from 'react';

export function ClientOnly({ children }: { children: () => React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <>{children()}</> : null;
}
```

You'll use this in your layout and route files — every route that renders Cloudscape components should be wrapped with `<ClientOnly>`.

## 5. Project Structure

Organize your app with these folders:

```
app/
├── config/          # API URLs, navigation items
│   ├── api.ts
│   └── navigation.ts
├── controllers/     # Server-side API controllers (one per resource)
│   └── network.controller.ts
├── i18n/            # Translation files (one per locale)
│   ├── en.ts
│   ├── es.ts
│   └── index.ts
├── lib/             # Shared server utilities
│   └── api-client.server.ts
├── pages/           # JSON page configs
│   └── networks.json
├── routes/          # Remix routes
│   ├── _app.tsx              # App shell layout
│   ├── _app._index.tsx       # Dashboard
│   ├── _app.networks.tsx     # List page
│   ├── _app.networks.create.tsx
│   └── _app.networks.$id.tsx # Detail page
└── root.tsx
```

Key conventions:
- **`config/`** — Static configuration (API endpoints, nav structure).
- **`controllers/`** — One class per resource. Each wraps `APIClient` calls.
- **`pages/`** — JSON files that describe page layout, columns, fields, and actions.
- **`routes/_app.*`** — All routes nested under `_app.tsx` share the app shell (top nav, side nav, layout).

## 6. Create a Controller

Controllers run server-side only. Use the `.server.ts` suffix or only import them in Remix `loader`/`action` functions.

First, create a shared API client instance. `APIClient` is an interface — you provide the implementation that matches your auth strategy:

```typescript
// app/lib/api-client.server.ts
import type { APIClient } from 'pageforge';

// Simple implementation — replace with your own auth (SigV4, Bearer, etc.)
class MyAPIClient implements APIClient {
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

export const apiClient = new MyAPIClient('https://api.example.com');
```

Then create a controller for your resource:

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

## 7. Create a Page Config

```json
// app/pages/networks.json
{
  "page": "Networks",
  "model": "Network",
  "type": "list",
  "layout": {
    "title": "page.networks.title",
    "description": "page.networks.description",
    "searchable": true,
    "pagination": true,
    "columns": [
      { "key": "id", "label": "col.networks.id", "sortable": true, "type": "link", "linkPath": "/networks/{id}" },
      { "key": "name", "label": "col.common.name", "sortable": true },
      { "key": "status", "label": "col.common.status", "sortable": true, "type": "badge", "badgeMap": {
        "ACTIVE": { "color": "success" },
        "PENDING_CREATE": { "color": "in-progress" },
        "CREATE_FAILED": { "color": "error" }
      }},
      { "key": "ipv4Cidr", "label": "col.networks.ipv4Cidr" }
    ],
    "actions": [
      { "label": "action.networks.delete", "action": "delete", "requiresSelection": true },
      { "label": "action.networks.create", "variant": "primary", "action": "create" }
    ]
  }
}
```

Labels like `page.networks.title` are i18n translation keys. They get resolved at render time via the `t()` function. See the [i18n guide](i18n.md).

## 8. Create a Route

```tsx
// app/routes/_app.networks.tsx
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigate, useFetcher } from '@remix-run/react';
import { ListPage } from 'pageforge';
import type { ListPageConfig } from 'pageforge';
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
  const id = formData.get('id') as string;
  await controller.delete(id);
  return json({ success: true });
}

export default function NetworksRoute() {
  const { items } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const fetcher = useFetcher();

  const handleAction = (action: string, selected?: any[]) => {
    if (action === 'create') navigate('/networks/create');
    if (action === 'delete' && selected?.[0]) {
      fetcher.submit({ id: selected[0].id }, { method: 'post' });
    }
  };

  return (
    <ListPage
      config={config as ListPageConfig}
      items={items}
      loading={fetcher.state === 'submitting'}
      onAction={handleAction}
    />
  );
}
```

## 9. Set Up the App Layout

The `_app.tsx` layout route wraps all nested routes with the `AppShell` component from pageforge:

```tsx
// app/routes/_app.tsx
import { Outlet, useLocation } from '@remix-run/react';
import { AppShell, I18nProvider } from 'pageforge';
import type { NavItem } from 'pageforge';
import { ClientOnly } from '~/components/client-only';
import '@cloudscape-design/global-styles/index.css';

const TRANSLATIONS = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.networks': 'Networks',
    'page.networks.title': 'Networks',
    'page.networks.description': 'Manage your networks.',
    'col.networks.id': 'Network ID',
    'col.common.name': 'Name',
    'col.common.status': 'Status',
    'col.networks.ipv4Cidr': 'IPv4 CIDR',
    'action.networks.delete': 'Delete',
    'action.networks.create': 'Create network',
  },
};

const NAV_ITEMS: NavItem[] = [
  { type: 'link', text: 'Dashboard', href: '/' },
  {
    type: 'section',
    text: 'Resources',
    items: [
      { type: 'link', text: 'Networks', href: '/networks' },
    ],
  },
];

export default function AppLayoutRoute() {
  const location = useLocation();

  return (
    <I18nProvider locale="en" translations={TRANSLATIONS}>
      <ClientOnly>{() =>
        <AppShell navigation={NAV_ITEMS} activeHref={location.pathname}>
          <Outlet />
        </AppShell>
      }</ClientOnly>
    </I18nProvider>
  );
}
```

`AppShell` handles the top navigation, side navigation, and Cloudscape `AppLayout` internally. You pass it:
- `navigation` — array of `NavItem` objects for the side nav
- `activeHref` — highlights the current nav item
- `breadcrumbs` (optional) — array of `{ text: string; href: string }`
- `children` — your page content (typically `<Outlet />`)

## 10. Run It

```bash
npm run dev
```

Open [http://localhost:5173/networks](http://localhost:5173/networks). You should see a Cloudscape table rendered from your JSON config, with data loaded from your API.

---

## Remix Route Patterns

Remix nests routes by default. A file named `projects.create.tsx` renders inside `projects.tsx`'s `<Outlet />`. For pageforge, each page (list, create, detail, edit) is a standalone page with its own `AppShell`.

Use the `_` escape to make routes independent:

```
app/routes/
├── projects.tsx              # /projects (list)
├── projects_.create.tsx      # /projects/create (standalone)
├── projects_.$id.tsx         # /projects/:id (standalone detail)
└── projects_.$id_.edit.tsx   # /projects/:id/edit (standalone edit)
```

The `_` after a segment name tells Remix "don't nest inside the parent layout":
- `projects_.create` → independent of `projects.tsx`
- `$id_.edit` → independent of `$id.tsx`

Without the `_`, the create/detail/edit pages would try to render inside the list page's layout, and you'd see a blank area where the `<Outlet />` should be.

---

## Next Steps

- [Page Configs](page-configs.md) — Full JSON schema reference
- [Controllers](controllers.md) — API client and controller patterns
- [Components](components.md) — All framework component props
- [i18n](i18n.md) — Add multi-language support
