export interface ColumnConfig {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'link' | 'badge' | 'text';
  linkPath?: string;
  badgeMap?: Record<string, { color: string; label?: string }>;
}

export interface ActionConfig {
  label: string;
  variant?: 'primary' | 'normal';
  action: string;
  requiresSelection?: boolean;
}

export interface ListLayout {
  title: string;
  description?: string;
  columns: ColumnConfig[];
  actions?: ActionConfig[];
  searchable?: boolean;
  pagination?: boolean;
}

export interface FieldConfig {
  key: string;
  label: string;
  description?: string;
  type: 'text' | 'select' | 'textarea' | 'number';
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
}

export interface FormLayout {
  title: string;
  description?: string;
  fields: FieldConfig[];
  submitLabel?: string;
  cancelPath?: string;
}

export interface SectionConfig {
  title: string;
  fields: { key: string; label: string }[];
}

export interface DetailLayout {
  title: string;
  sections: SectionConfig[];
}

export interface ListPageConfig {
  page: string;
  model: string;
  type: 'list';
  layout: ListLayout;
}

export interface DetailPageConfig {
  page: string;
  model: string;
  type: 'detail';
  layout: DetailLayout;
}

export interface FormPageConfig {
  page: string;
  model: string;
  type: 'form';
  layout: FormLayout;
}

export type PageConfig = ListPageConfig | DetailPageConfig | FormPageConfig;

export interface NavItem {
  type: 'section' | 'link';
  text: string;
  href?: string;
  items?: NavItem[];
}
