# PageForge Reference Implementation — Admin Console

A working example of a pageforge-powered admin console backed by DynamoDB Local and Express.

## Architecture

```
Browser → Remix (port 3000) → Express API (port 3001) → DynamoDB Local (port 8000)
```

- **Remix frontend** uses pageforge components (`AppShell`, `ListPage`, `FormPage`) driven by JSON page configs
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

This starts both the Express API (port 3001) and Remix dev server (port 3000) concurrently.

Open http://localhost:3000/projects to see the admin console.

## What This Demonstrates

| PageForge Feature | Where |
|---|---|
| `ListPage` with search, badges, links | `app/routes/projects.tsx` |
| `FormPage` with text, select, textarea | `app/routes/projects.create.tsx` |
| `AppShell` with navigation + breadcrumbs | Both routes |
| `I18nProvider` | `app/root.tsx` |
| `BaseController` subclass | `app/controllers/projects.ts` |
| JSON page configs | `app/configs/projects.ts` |
