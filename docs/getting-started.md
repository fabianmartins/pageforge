# Getting Started

This guide walks you from zero to a running admin console powered by `pageforge`.

> For a complete working example, see the [admin-console](../examples/admin-console/) reference implementation.

## Table of Contents

- [1. Prerequisites](#1-prerequisites)
- [2. Create a Vite + React App](#2-create-a-vite--react-app)
- [3. Install Dependencies](#3-install-dependencies)
- [4. Project Structure](#4-project-structure)
- [5. Create a Page Config](#5-create-a-page-config)
- [6. Create an API Client and Controller](#6-create-an-api-client-and-controller)
- [7. Create a Route](#7-create-a-route)
- [8. Set Up the App Entry](#8-set-up-the-app-entry)
- [9. Build and Deploy](#9-build-and-deploy)

---

## 1. Prerequisites

- **Node.js 18+** and **npm**

## 2. Create a Vite + React App

```bash
npm create vite@latest my-console -- --template react-ts
cd my-console
```

## 3. Install Dependencies

```bash
npm install pageforge @cloudscape-design/components @cloudscape-design/global-styles react-router-dom
```

## 4. Project Structure

Here's how the [admin-console example](../examples/admin-console/) is organized:

```
src/
├── configs/
│   └── projects.ts           # Page configs (list, create, edit)
├── controllers/
│   └── projects.ts           # Controller extending BaseController
├── routes/
│   ├── ProjectList.tsx        # /projects
│   ├── ProjectCreate.tsx      # /projects/create
│   ├── ProjectDetail.tsx      # /projects/:id
│   └── ProjectEdit.tsx        # /projects/:id/edit
├── api.ts                     # APIClient implementation
├── navigation.ts              # Sidebar navigation config
├── App.tsx                    # React Router routes
└── main.tsx                   # Entry point with BrowserRouter + I18nProvider
index.html                     # SPA entry HTML
```

Key conventions:
- **`configs/`** — Page configs that describe layout, columns, fields, and actions.
- **`controllers/`** — One class per resource. Each wraps `APIClient` calls.
- **`routes/`** — One component per page. Each uses a controller for data access.
- **`api.ts`** — Your `APIClient` implementation (swap for SigV4, Bearer, etc.).

## 5. Create a Page Config

Page configs describe what a page looks like — columns, fields, actions — without any rendering code. Here's the project list config from the example:

```typescript
// src/configs/projects.ts
import type { ListPageConfig } from 'pageforge';

export const projectListConfig: ListPageConfig = {
  page: 'projects',
  model: 'project',
  type: 'list',
  layout: {
    title: 'Projects',
    description: 'Manage your projects',
    searchable: true,
    pagination: true,
    columns: [
      { key: 'name', label: 'Name', sortable: true, type: 'link', linkPath: '/projects/{id}' },
      { key: 'owner', label: 'Owner', sortable: true },
      {
        key: 'status', label: 'Status', sortable: true, type: 'badge',
        badgeMap: {
          active: { color: 'success', label: 'Active' },
          planning: { color: 'info', label: 'Planning' },
          completed: { color: 'stopped', label: 'Completed' },
        },
      },
    ],
    actions: [
      { label: 'Create project', variant: 'primary', action: 'create' },
      { label: 'Delete', action: 'delete', requiresSelection: true },
    ],
  },
};
```

See [Page Configs](page-configs.md) for the full schema reference.

## 6. Create an API Client and Controller

`APIClient` is an interface — you provide the implementation that matches your auth strategy. Here's the simple client from the example:

```typescript
// src/api.ts
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

Then create a controller that separates data access from presentation:

```typescript
// src/controllers/projects.ts
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

See [Controllers](controllers.md) for more patterns and auth strategies.

## 7. Create a Route

Each route uses a controller for data and a pageforge component for rendering:

```tsx
// src/routes/ProjectList.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell, ListPage } from 'pageforge';
import { projectListConfig } from '../configs/projects';
import { navigation } from '../navigation';
import { ProjectController } from '../controllers/projects';
import { apiClient } from '../api';

const controller = new ProjectController(apiClient);

export function ProjectList() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    controller.list().then(data => { setItems(data.items); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleAction = (action: string, selected?: any[]) => {
    if (action === 'create') navigate('/projects/create');
    if (action === 'delete' && selected?.length) {
      Promise.all(selected.map(item => controller.delete(item.id)))
        .then(() => load());
    }
  };

  return (
    <AppShell
      navigation={navigation}
      breadcrumbs={[{ text: 'Home', href: '/' }, { text: 'Projects', href: '/projects' }]}
      activeHref="/projects"
    >
      <ListPage config={projectListConfig} items={items} loading={loading} onAction={handleAction} />
    </AppShell>
  );
}
```

## 8. Set Up the App Entry

```tsx
// src/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { I18nProvider } from 'pageforge';
import '@cloudscape-design/global-styles/index.css';
import { App } from './App';

const translations = {
  en: {
    'list.loading': 'Loading resources...',
    'list.emptyTitle': 'No projects',
    'list.emptyDescription': 'Create a project to get started.',
  },
};

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <I18nProvider locale="en" translations={translations}>
      <App />
    </I18nProvider>
  </BrowserRouter>
);
```

```tsx
// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProjectList } from './routes/ProjectList';
import { ProjectCreate } from './routes/ProjectCreate';
import { ProjectDetail } from './routes/ProjectDetail';
import { ProjectEdit } from './routes/ProjectEdit';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/projects" replace />} />
      <Route path="/projects" element={<ProjectList />} />
      <Route path="/projects/create" element={<ProjectCreate />} />
      <Route path="/projects/:id" element={<ProjectDetail />} />
      <Route path="/projects/:id/edit" element={<ProjectEdit />} />
    </Routes>
  );
}
```

## 9. Build and Deploy

```bash
# Development
npm run dev

# Production build
npm run build
```

The `dist/` folder contains static HTML/CSS/JS ready for deployment to S3 + CloudFront, Netlify, or any static host.

---

## Next Steps

- [Page Configs](page-configs.md) — Full JSON schema reference
- [Controllers](controllers.md) — API client and controller patterns
- [Components](components.md) — All framework component props
- [i18n](i18n.md) — Add multi-language support
