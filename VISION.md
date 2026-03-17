# PageForge Vision

PageForge aims to become a full-stack, config-driven framework for building admin consoles and internal portals. It targets both web and mobile surfaces, letting teams ship production-grade admin UIs by declaring pages, forms, and data flows in configuration — while still allowing escape hatches into custom code when the need arises.

## Today

PageForge v1 is a focused foundation built on Remix and Cloudscape. It supports config-driven list pages, form pages with validation, internationalization (i18n), and a controller pattern for connecting pages to backend APIs. It is usable today for straightforward CRUD admin consoles.

## Roadmap

### Near-term

- **DetailPage component** — a dedicated read-only detail view to complement list and form pages
- **Authentication adapters** — pluggable auth with built-in support for Cognito, Okta, and custom providers
- **Advanced form validation** — async validators, cross-field rules, and API-driven validation
- **CLI scaffolding** — a `create-pageforge` CLI to generate projects, pages, and controllers from templates

### Medium-term

- **Theming and design tokens** — a token-based theming system with dark mode support
- **Permissions and authorization** — backend-driven RBAC/ABAC integrated into page and field visibility
- **GraphQL support** — first-class GraphQL transport alongside the existing REST controller pattern
- **More components** — tabs, modals, toasts, and chart widgets available as config-driven building blocks

### Long-term

- **React Native / mobile** — share page definitions across web and native mobile surfaces
- **Offline support** — local-first data and sync for mobile use cases
- **Multi-tenancy** — tenant-aware routing, data isolation, and per-tenant configuration
- **Real-time updates** — live data via WebSockets or server-sent events for dashboards and monitoring views

## Design Principles

- **Config-driven by default, custom code when needed.** Pages, forms, and data flows are declared in configuration. When configuration isn't enough, drop into React components and standard code.
- **Bring your own auth and API transport.** PageForge provides adapter interfaces, not vendor lock-in. Swap authentication providers or switch between REST and GraphQL without rewriting pages.
- **Zero runtime opinions on styling.** Styling is delegated to the underlying design system (currently Cloudscape). PageForge controls layout and composition, not pixels.
- **Server-first with progressive enhancement.** Leverage SSR and Remix loaders/actions by default. Client-side interactivity is layered on where it adds value, not as a baseline requirement.

## Contributing

PageForge is early-stage and evolving quickly. Contributions are welcome — if you're considering a large feature or architectural change, please open an issue to discuss the approach before submitting a pull request. Bug fixes, documentation improvements, and small enhancements can go straight to a PR.
