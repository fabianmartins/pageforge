# Components

The framework exports React components that render Cloudscape UI from JSON page configs. All components consume the i18n context and translate config labels automatically.

> All examples on this page are from the [admin-console](../examples/admin-console/) reference implementation.

## Table of Contents

- [ListPage](#listpage)
- [FormPage](#formpage)
- [AppShell](#appshell)
- [I18nProvider](#i18nprovider)
- [useI18n](#usei18n)

---

## ListPage

Renders a Cloudscape `Table` from a list-type `PageConfig`. Handles column rendering, text filtering, pagination, row selection, and action buttons.

### Props

```typescript
interface ListPageProps {
  config: ListPageConfig;                                    // Page config with type: 'list'
  items: any[];                                              // Data items to display
  loading?: boolean;                                         // Show loading indicator
  onAction?: (action: string, selectedItems?: any[]) => void; // Called when an action button is clicked
  nextToken?: string;                                        // If present, enables "next page"
  onNextPage?: () => void;                                   // Called when user navigates to next page
}
```

### Usage

From `src/routes/ProjectList.tsx`:

```tsx
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

### Column Rendering

| Type | Renders | Config Required |
|------|---------|-----------------|
| `text` (default) | Plain text value | — |
| `link` | React Router `<Link>` element | `linkPath` with `{key}` placeholders |
| `badge` | Cloudscape `StatusIndicator` | `badgeMap` mapping values to colors |

### Behavior

- **Filtering** — When `layout.searchable` is `true`, a `TextFilter` appears. It filters across all item values (case-insensitive substring match).
- **Pagination** — When `layout.pagination` is `true`, `Pagination` controls appear. Pass `nextToken` and `onNextPage` for server-side pagination.
- **Selection** — Multi-select is enabled when any action has `requiresSelection: true`. Selected items are passed to `onAction`.
- **Sorting** — Columns with `sortable: true` get a sortable header.

---

## FormPage

Renders a Cloudscape `Form` with fields from a form-type `PageConfig`. Manages form state internally and passes the collected data to `onSubmit`.

### Props

```typescript
interface FormPageProps {
  config: FormPageConfig;                  // Page config with type: 'form'
  onSubmit: (data: any) => void;           // Called with form data on submit
  onCancel?: () => void;                   // Called when cancel is clicked
  loading?: boolean;                       // Show loading state on submit button
  initialData?: Record<string, any>;       // Pre-populate fields (for edit forms)
}
```

### Usage: Create Form

From `src/routes/ProjectCreate.tsx`:

```tsx
import { useNavigate } from 'react-router-dom';
import { AppShell, FormPage } from 'pageforge';
import { projectFormConfig } from '../configs/projects';
import { navigation } from '../navigation';
import { ProjectController } from '../controllers/projects';
import { apiClient } from '../api';

const controller = new ProjectController(apiClient);

export function ProjectCreate() {
  const navigate = useNavigate();

  const handleSubmit = async (data: any) => {
    await controller.create(data);
    navigate('/projects');
  };

  return (
    <AppShell navigation={navigation} breadcrumbs={[...]} activeHref="/projects">
      <FormPage config={projectFormConfig} onSubmit={handleSubmit} onCancel={() => navigate('/projects')} />
    </AppShell>
  );
}
```

### Usage: Edit Form with initialData

From `src/routes/ProjectEdit.tsx`:

```tsx
const controller = new ProjectController(apiClient);

export function ProjectEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);

  useEffect(() => { controller.get(id!).then(setProject); }, [id]);

  if (!project) return null;

  const handleSubmit = async (data: any) => {
    await controller.update(id!, data);
    navigate(`/projects/${id}`);
  };

  return (
    <AppShell navigation={navigation} breadcrumbs={[...]} activeHref="/projects">
      <FormPage config={projectEditConfig} initialData={project} onSubmit={handleSubmit} onCancel={() => navigate(`/projects/${id}`)} />
    </AppShell>
  );
}
```

### Field Rendering

| Type | Renders |
|------|---------|
| `text` | Cloudscape `Input` |
| `number` | Cloudscape `Input` with `type="number"` |
| `textarea` | Cloudscape `Textarea` |
| `select` | Cloudscape `Select` with translated option labels |

### Behavior

- **State management** — `FormPage` tracks all field values in internal state, initialized from `initialData` if provided.
- **Cancel** — If `onCancel` is provided, a cancel button appears.
- **Submit label** — Uses `layout.submitLabel` (translated) or falls back to `"Submit"`.

---

## AppShell

Renders a Cloudscape `AppLayout` with `SideNavigation` and `BreadcrumbGroup`. Use this for a consistent app shell across all routes.

### Props

```typescript
interface AppShellProps {
  navigation: NavItem[];                           // Side navigation items
  breadcrumbs: { text: string; href: string }[];   // Breadcrumb trail
  children: React.ReactNode;                       // Page content
  activeHref?: string;                             // Highlights the active nav item
}
```

### NavItem

```typescript
interface NavItem {
  type: 'section' | 'link';
  text: string;
  href?: string;           // Required for 'link' type
  items?: NavItem[];       // Child items for 'section' type
}
```

### Usage

From `src/navigation.ts`:

```typescript
import type { NavItem } from 'pageforge';

export const navigation: NavItem[] = [
  {
    type: 'section',
    text: 'Management',
    items: [
      { type: 'link', text: 'Projects', href: '/projects' },
    ],
  },
];
```

Used in every route:

```tsx
<AppShell
  navigation={navigation}
  breadcrumbs={[{ text: 'Home', href: '/' }, { text: 'Projects', href: '/projects' }]}
  activeHref="/projects"
>
  <ListPage config={projectListConfig} items={items} />
</AppShell>
```

---

## I18nProvider

React context provider that makes translations available to all framework components and the `useI18n` hook.

### Props

```typescript
interface I18nProviderProps {
  locale: string;                                // Current locale key
  translations: Record<string, Translations>;    // Map of locale → translations
  children: React.ReactNode;
}

type Translations = Record<string, string>;
```

### Usage

From `src/main.tsx`:

```tsx
import { I18nProvider } from 'pageforge';

const translations = {
  en: {
    'list.loading': 'Loading resources...',
    'list.emptyTitle': 'No projects',
    'list.emptyDescription': 'Create a project to get started.',
  },
};

<BrowserRouter>
  <I18nProvider locale="en" translations={translations}>
    <App />
  </I18nProvider>
</BrowserRouter>
```

All `ListPage`, `FormPage`, and `AppShell` components nested inside will use these translations. See the [i18n guide](i18n.md) for full details.

---

## useI18n

Hook that returns the translation function and current locale from the nearest `I18nProvider`.

### Return Value

```typescript
const { t, locale } = useI18n();
```

| Property | Type | Description |
|----------|------|-------------|
| `t` | `(key: string, fallback?: string) => string` | Translate a key |
| `locale` | `string` | Current locale (e.g. `'en'`) |

If no `I18nProvider` is present, `t` returns the fallback (or the key itself) and `locale` defaults to `'en'`.
