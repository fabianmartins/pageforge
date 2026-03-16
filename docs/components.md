# Components

The framework exports React components that render Cloudscape UI from JSON page configs. All components consume the i18n context and translate config labels automatically.

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
  config: PageConfig;                                        // Page config with type: 'list'
  items: any[];                                              // Data items to display
  loading?: boolean;                                         // Show loading indicator
  onAction?: (action: string, selectedItems?: any[]) => void; // Called when an action button is clicked
  nextToken?: string;                                        // If present, enables "next page"
  onNextPage?: () => void;                                   // Called when user navigates to next page
}
```

### Column Rendering

Columns render based on their `type`:

| Type | Renders | Config Required |
|------|---------|-----------------|
| `text` (default) | Plain text value | — |
| `link` | Remix `<Link>` element | `linkPath` with `{key}` placeholders |
| `badge` | Cloudscape `StatusIndicator` | `badgeMap` mapping values to colors |

### Usage

```tsx
import { ListPage } from 'pageforge';
import config from '~/pages/networks.json';

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
  config: PageConfig;                  // Page config with type: 'form'
  onSubmit: (data: any) => void;       // Called with form data on submit
  onCancel?: () => void;               // Called when cancel is clicked
  loading?: boolean;                   // Show loading state on submit button
}
```

### Field Rendering

| Type | Renders |
|------|---------|
| `text` | Cloudscape `Input` |
| `number` | Cloudscape `Input` with `type="number"` |
| `textarea` | Cloudscape `Textarea` |
| `select` | Cloudscape `Select` with translated option labels |

### Usage

```tsx
import { FormPage } from 'pageforge';
import config from '~/pages/create-profile.json';

export default function CreateProfileRoute() {
  const navigate = useNavigate();
  const fetcher = useFetcher();

  const handleSubmit = (data: Record<string, unknown>) => {
    fetcher.submit(data, { method: 'post' });
  };

  return (
    <FormPage
      config={config}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/profiles')}
      loading={fetcher.state === 'submitting'}
    />
  );
}
```

### Behavior

- **State management** — `FormPage` tracks all field values in internal state. The `onSubmit` callback receives a `Record<string, any>` with keys matching `FieldConfig.key`.
- **Cancel** — If `onCancel` is provided, a cancel button appears. The `cancelPath` in the config is informational; the component delegates navigation to your callback.
- **Submit label** — Uses `layout.submitLabel` (translated) or falls back to `"Submit"`.
- **Select options** — Option labels are passed through `t()` for translation.

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

```tsx
import { AppShell } from 'pageforge';
import type { NavItem } from 'pageforge';

const NAV: NavItem[] = [
  { type: 'link', text: 'Dashboard', href: '/' },
  {
    type: 'section',
    text: 'Resources',
    items: [
      { type: 'link', text: 'Networks', href: '/networks' },
      { type: 'link', text: 'Subnets', href: '/subnets' },
    ],
  },
];

export default function Layout() {
  const location = useLocation();
  return (
    <AppShell
      navigation={NAV}
      breadcrumbs={[
        { text: 'Home', href: '/' },
        { text: 'Networks', href: '/networks' },
      ]}
      activeHref={location.pathname}
    >
      <Outlet />
    </AppShell>
  );
}
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

```tsx
import { I18nProvider } from 'pageforge';

const TRANSLATIONS = {
  en: { 'page.title': 'Networks' },
  es: { 'page.title': 'Redes' },
};

<I18nProvider locale="en" translations={TRANSLATIONS}>
  <App />
</I18nProvider>
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

### Usage

```tsx
import { useI18n } from 'pageforge';

function PageHeader() {
  const { t, locale } = useI18n();
  return (
    <header>
      <h1>{t('page.networks.title', 'Networks')}</h1>
      <span>Locale: {locale}</span>
    </header>
  );
}
```

If no `I18nProvider` is present, `t` returns the fallback (or the key itself) and `locale` defaults to `'en'`.
