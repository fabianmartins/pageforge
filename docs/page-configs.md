# Page Configs

Page configs are JSON files that declaratively describe the structure of list, form, and detail pages. The framework reads these configs at render time and produces Cloudscape components automatically.

## Table of Contents

- [PageConfig (Top-Level)](#pageconfig-top-level)
- [List Pages](#list-pages)
  - [ListLayout](#listlayout)
  - [ColumnConfig](#columnconfig)
  - [ActionConfig](#actionconfig)
- [Form Pages](#form-pages)
  - [FormLayout](#formlayout)
  - [FieldConfig](#fieldconfig)
- [Detail Pages](#detail-pages)
  - [DetailLayout](#detaillayout)
  - [SectionConfig](#sectionconfig)
- [i18n in Configs](#i18n-in-configs)

---

## PageConfig (Top-Level)

Every page config file shares this top-level structure:

```typescript
interface PageConfig {
  page: string;                              // Human-readable page name
  model: string;                             // Resource model name
  type: 'list' | 'form' | 'detail';         // Page type
  layout: ListLayout | FormLayout | DetailLayout;  // Type-specific layout
}
```

The `type` field determines which layout shape is expected and which component renders it (`ListPage`, `FormPage`, or a custom detail view).

---

## List Pages

### ListLayout

```typescript
interface ListLayout {
  title: string;            // Page heading (can be a translation key)
  description?: string;     // Subheading text (can be a translation key)
  searchable?: boolean;     // Show a text filter above the table
  pagination?: boolean;     // Show pagination controls
  columns: ColumnConfig[];  // Table column definitions
  actions?: ActionConfig[]; // Header action buttons
}
```

### ColumnConfig

```typescript
interface ColumnConfig {
  key: string;              // Property name on the data item
  label: string;            // Column header text (can be a translation key)
  sortable?: boolean;       // Enable sorting on this column
  type?: 'text' | 'link' | 'badge';  // Render type (default: 'text')
  linkPath?: string;        // URL template for 'link' type, e.g. "/networks/{id}"
  badgeMap?: Record<string, { color: string; label?: string }>;  // Status-to-badge mapping for 'badge' type
}
```

Column types:
- **`text`** (default) — Renders the raw value as text.
- **`link`** — Renders a clickable link. `linkPath` supports `{key}` placeholders replaced with item values.
- **`badge`** — Renders a `StatusIndicator`. `badgeMap` maps data values to Cloudscape status types (`success`, `error`, `in-progress`, `stopped`).

### ActionConfig

```typescript
interface ActionConfig {
  label: string;                    // Button text (can be a translation key)
  action: string;                   // Action identifier passed to onAction callback
  variant?: 'primary' | 'normal';   // Cloudscape button variant (default: 'normal')
  requiresSelection?: boolean;      // Disable button when no rows are selected
}
```

### Complete List Example

```json
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
      {
        "key": "id",
        "label": "col.networks.id",
        "sortable": true,
        "type": "link",
        "linkPath": "/networks/{id}"
      },
      {
        "key": "name",
        "label": "col.common.name",
        "sortable": true
      },
      {
        "key": "status",
        "label": "col.common.status",
        "sortable": true,
        "type": "badge",
        "badgeMap": {
          "ACTIVE": { "color": "success" },
          "PENDING_CREATE": { "color": "in-progress" },
          "PENDING_DELETE": { "color": "in-progress" },
          "CREATE_FAILED": { "color": "error" },
          "DELETE_FAILED": { "color": "error" },
          "DELETED": { "color": "stopped" }
        }
      },
      { "key": "ipv4Cidr", "label": "col.networks.ipv4Cidr" },
      { "key": "ipv6Cidr", "label": "col.networks.ipv6Cidr" }
    ],
    "actions": [
      { "label": "action.networks.delete", "action": "delete", "requiresSelection": true },
      { "label": "action.networks.create", "variant": "primary", "action": "create" }
    ]
  }
}
```

---

## Form Pages

### FormLayout

```typescript
interface FormLayout {
  title: string;          // Form heading (can be a translation key)
  description?: string;   // Subheading text (can be a translation key)
  fields: FieldConfig[];  // Form field definitions
  submitLabel?: string;   // Submit button text (can be a translation key, default: "Submit")
  cancelPath?: string;    // Navigation path for the cancel button
}
```

### FieldConfig

```typescript
interface FieldConfig {
  key: string;            // Form data key
  label: string;          // Field label (can be a translation key)
  description?: string;   // Help text below the label (can be a translation key)
  type: 'text' | 'select' | 'textarea' | 'number';  // Input type
  required?: boolean;     // Mark field as required
  placeholder?: string;   // Placeholder text (can be a translation key)
  options?: { label: string; value: string }[];  // Options for 'select' type
}
```

Field types:
- **`text`** — Standard text input.
- **`number`** — Numeric input.
- **`textarea`** — Multi-line text input.
- **`select`** — Dropdown select. Requires `options` array.

### Complete Form Example

```json
{
  "page": "CreateProfile",
  "model": "Profile",
  "type": "form",
  "layout": {
    "title": "page.createProfile.title",
    "description": "page.createProfile.description",
    "submitLabel": "form.createProfile.submit",
    "cancelPath": "/profiles",
    "fields": [
      {
        "key": "country",
        "label": "field.profile.country",
        "type": "select",
        "required": true,
        "options": [
          { "label": "option.profile.country.US", "value": "US" },
          { "label": "option.profile.country.BR", "value": "BR" },
          { "label": "option.profile.country.DE", "value": "DE" },
          { "label": "option.profile.country.JP", "value": "JP" }
        ]
      },
      {
        "key": "name",
        "label": "field.profile.name",
        "description": "field.profile.name.description",
        "type": "text",
        "required": true,
        "placeholder": "field.profile.name.placeholder"
      }
    ]
  }
}
```

---

## Detail Pages

### DetailLayout

```typescript
interface DetailLayout {
  title: string;              // Page heading (can be a translation key)
  sections: SectionConfig[];  // Grouped field sections
}
```

### SectionConfig

```typescript
interface SectionConfig {
  title: string;                            // Section heading
  fields: { key: string; label: string }[]; // Key-value pairs to display
}
```

### Complete Detail Example

```json
{
  "page": "NetworkDetail",
  "model": "Network",
  "type": "detail",
  "layout": {
    "title": "detail.network.title",
    "sections": [
      {
        "title": "detail.network.general",
        "fields": [
          { "key": "id", "label": "col.networks.id" },
          { "key": "name", "label": "col.common.name" },
          { "key": "status", "label": "col.common.status" }
        ]
      },
      {
        "title": "detail.network.addressing",
        "fields": [
          { "key": "ipv4Cidr", "label": "col.networks.ipv4Cidr" },
          { "key": "ipv6Cidr", "label": "col.networks.ipv6Cidr" },
          { "key": "attachedGateway", "label": "col.networks.attachedGateway" }
        ]
      }
    ]
  }
}
```

---

## i18n in Configs

All string fields that appear in the UI (`title`, `description`, `label`, `submitLabel`, `placeholder`, and option `label` values) can be **translation keys** instead of literal text.

At render time, framework components call `t(key, fallback)` from the i18n context. If a translation exists for the current locale, it's used. Otherwise, the key itself is displayed as the fallback.

```json
{ "label": "col.networks.id" }
```

With this English translation file:

```typescript
export const en: Record<string, string> = {
  'col.networks.id': 'Network ID',
};
```

The column header renders as **"Network ID"** in English. Add the same key to other locale files for multi-language support.

See the [i18n guide](i18n.md) for full setup instructions.
