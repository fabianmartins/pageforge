# PageForge Reference Implementation — Admin Console

A working example of a pageforge-powered admin console. Built as a static SPA with Vite + React Router, backed by DynamoDB Local and Express for development.

The built output (`dist/`) is plain HTML/JS/CSS that can be deployed to S3 + CloudFront or any static hosting.

## Architecture

```
Browser (SPA) → Express API (port 3001) → DynamoDB Local (port 8000)
     ↑
  Vite dev server (port 3000) or S3 + CloudFront (production)
```

- **Vite SPA** uses pageforge components (`AppShell`, `ListPage`, `FormPage`) driven by JSON page configs
- **Express API** provides a simple REST-like backend (mimics API Gateway)
- **DynamoDB Local** stores data without needing an AWS account

## Prerequisites

- Node.js 22+
- Java 21+ (for DynamoDB Local)

### Start DynamoDB Local

Download and run:

```bash
mkdir -p /tmp/dynamodb-local && cd /tmp/dynamodb-local
curl -sL https://d1ni2b6xgvw0s0.cloudfront.net/v2.x/dynamodb_local_latest.tar.gz | tar xz
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
```

Or with Docker/Podman:

```bash
docker run -p 8000:8000 amazon/dynamodb-local
```

## Setup

```bash
cd examples/admin-console
npm install
npm run db:setup
npm run db:seed
```

## Run

```bash
npm run dev
```

This starts both the Express API (port 3001) and Vite dev server (port 3000) concurrently.

Open http://localhost:3000/projects to see the admin console.

## Build for Production

```bash
npm run build
```

The `dist/` folder contains static assets ready for deployment to S3, CloudFront, Netlify, or any static host. You'll need to configure your API URL for production (see `src/api.ts`).

## What This Demonstrates

| PageForge Feature | Where |
|---|---|
| `ListPage` with search, badges, links, delete | `src/routes/ProjectList.tsx` |
| `FormPage` for creating resources | `src/routes/ProjectCreate.tsx` |
| `FormPage` with `initialData` for editing | `src/routes/ProjectEdit.tsx` |
| `AppShell` with navigation + breadcrumbs | All routes |
| `I18nProvider` | `src/main.tsx` |
| JSON page configs (list, create, edit) | `src/configs/projects.ts` |
| React Router with standard route paths | `src/App.tsx` |

## Ideas to Extend This Example

### Grouped Actions with ButtonDropdown

As the number of actions grows, individual buttons become cluttered. Cloudscape's `ButtonDropdown` component lets you group related actions into a single dropdown. You could extend `ActionConfig` to support this:

```typescript
actions: [
  { label: 'Create project', variant: 'primary', action: 'create' },
  {
    label: 'Actions',
    type: 'dropdown',
    items: [
      { label: 'Edit', action: 'edit', requiresSelection: true },
      { label: 'Clone', action: 'clone', requiresSelection: true },
      { label: 'Delete', action: 'delete', requiresSelection: true },
    ],
  },
]
```

### APIClient Implementations

The example uses a simple `fetch` wrapper (`src/api.ts`). For production, implement the `APIClient` interface with your auth strategy:

- **AWS SigV4** — see `server/sigv4-client.ts` (reference)
- **Bearer token** (Okta, Azure AD) — add an `Authorization` header
- **No auth** — use the simple client as-is for internal tools
