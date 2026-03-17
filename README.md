# pageforge

A TypeScript framework for building config-driven admin consoles with React, Remix, and [Cloudscape Design System](https://cloudscape.design/).

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://react.dev/)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](LICENSE)

## Features

- **Declarative page configs** — Define list and form pages as typed config objects. No hand-wiring Cloudscape components.
- **Cloudscape rendering** — Renders [Cloudscape Design System](https://cloudscape.design/) tables, forms, app layouts, and navigation out of the box.
- **Discriminated union configs** — `PageConfig` is a union of `ListPageConfig | DetailPageConfig | FormPageConfig`, giving you type-safe config authoring with autocomplete.
- **Pluggable API client** — `APIClient` is an interface you implement yourself — use SigV4, plain fetch, or anything else.
- **Built-in i18n** — `I18nProvider` + `useI18n` hook. Translation keys in configs are auto-resolved.
- **TypeScript-first** — Fully typed configs, components, and hooks.

## Quick Install

```bash
npm install pageforge @cloudscape-design/components @cloudscape-design/global-styles
```

## Quick Example

```tsx
import type { ListPageConfig } from "pageforge";
import { ListPage } from "pageforge";
import { useLoaderData } from "@remix-run/react";

const config: ListPageConfig = {
  type: "list",
  page: "Users",
  model: "User",
  layout: {
    title: "Users",
    searchable: true,
    columns: [
      { key: "id", label: "ID", sortable: true, type: "link", linkPath: "/users/{id}" },
      { key: "name", label: "Name", sortable: true },
      { key: "status", label: "Status", type: "badge" },
    ],
    actions: [
      { label: "Create user", variant: "primary", action: "create" },
    ],
  },
};

export default function UsersRoute() {
  const { items } = useLoaderData<typeof loader>();
  return <ListPage config={config} items={items} onAction={(action) => {}} />;
}
```

## Exports

| Export | Kind | Description |
|--------|------|-------------|
| `PageConfig` | Type | Discriminated union: `ListPageConfig \| DetailPageConfig \| FormPageConfig` |
| `ListPageConfig` | Type | Config for list/table pages |
| `DetailPageConfig` | Type | Config for detail pages (type only — no rendering component yet) |
| `FormPageConfig` | Type | Config for form pages |
| `ListLayout`, `DetailLayout`, `FormLayout` | Types | Layout definitions for each page type |
| `ColumnConfig`, `ActionConfig`, `FieldConfig`, `SectionConfig` | Types | Config building blocks |
| `NavItem` | Type | Navigation item definition |
| `APIClient` | Interface | Implement this to connect your own API layer |
| `Translations` | Type | i18n translation map |
| `ListPage` | Component | Renders a list/table page from `ListPageConfig` |
| `FormPage` | Component | Renders a form page from `FormPageConfig`. Supports `initialData` prop for edit forms |
| `AppShell` | Component | Top-level app layout with navigation |
| `I18nProvider` | Component | React context provider for translations |
| `useI18n` | Hook | Access translation functions |
| `BaseController` | Class | Base class for building API controllers |

## Requirements

- **Node.js 18+**
- **React 18+**
- **Remix v2** (uses `@remix-run/react` internally)
- **Cloudscape Design System** (peer dependency)

> **Note:** Cloudscape has SSR hydration issues with Remix. You'll need a `ClientOnly` wrapper for Cloudscape components. See [Getting Started](docs/getting-started.md) for details.

## Getting Started

See [docs/getting-started.md](docs/getting-started.md) for a step-by-step setup guide.

Full documentation is in the [docs/](docs/) directory. A reference implementation is available in [examples/admin-console/](examples/admin-console/).

## License

[Apache-2.0](LICENSE)
