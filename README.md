# pageforge

A JSON-driven page framework for building admin consoles with React, Cloudscape Design System, and AWS API Gateway.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://react.dev/)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](LICENSE)

## Features

- **JSON page configs** — Define list, form, and detail pages as declarative JSON. No hand-wiring Cloudscape components.
- **Cloudscape components** — Renders [Cloudscape Design System](https://cloudscape.design/) tables, forms, app layouts, and navigation out of the box.
- **SigV4 API client** — Built-in HTTP client that signs requests with AWS Signature V4 for API Gateway integration.
- **i18n support** — First-class internationalization with translation keys in JSON configs, a React context provider, and a `useI18n` hook.
- **TypeScript** — Fully typed interfaces for every config shape, component prop, and API method.

## Quick Install

```bash
npm install pageforge @cloudscape-design/components @cloudscape-design/global-styles
```

## Minimal Example

Define a page config:

```json
{
  "page": "Users",
  "model": "User",
  "type": "list",
  "layout": {
    "title": "Users",
    "searchable": true,
    "columns": [
      { "key": "id", "label": "ID", "sortable": true, "type": "link", "linkPath": "/users/{id}" },
      { "key": "name", "label": "Name", "sortable": true },
      { "key": "status", "label": "Status", "type": "badge", "badgeMap": { "ACTIVE": { "color": "success" }, "INACTIVE": { "color": "stopped" } } }
    ],
    "actions": [
      { "label": "Delete", "action": "delete", "requiresSelection": true },
      { "label": "Create user", "variant": "primary", "action": "create" }
    ]
  }
}
```

Render it in a Remix route:

```tsx
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { ListPage } from "pageforge";
import config from "~/pages/users.json";

export async function loader() {
  // fetch items server-side via your controller
  return json({ items: [{ id: "u-1", name: "Alice", status: "ACTIVE" }] });
}

export default function UsersRoute() {
  const { items } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <ListPage
      config={config}
      items={items}
      onAction={(action) => {
        if (action === "create") navigate("/users/create");
      }}
    />
  );
}
```

## Documentation

| Guide | Description |
|-------|-------------|
| [Getting Started](docs/getting-started.md) | Zero to running app in 10 steps |
| [Page Configs](docs/page-configs.md) | JSON schema reference for list, form, and detail pages |
| [Controllers](docs/controllers.md) | API client and controller pattern |
| [Components](docs/components.md) | Framework component props and usage |
| [i18n](docs/i18n.md) | Internationalization setup and translation guide |

## Requirements

- **React 18+**
- **Remix v2** (or React Router v6+)
- **AWS credentials** configured for API calls (`~/.aws/credentials` or environment variables)
- **Node.js 18+**

## License

Apache-2.0
