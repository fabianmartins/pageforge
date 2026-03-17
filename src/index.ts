export type {
  PageConfig,
  ListPageConfig,
  DetailPageConfig,
  FormPageConfig,
  ListLayout,
  DetailLayout,
  FormLayout,
  ColumnConfig,
  ActionConfig,
  FieldConfig,
  SectionConfig,
  NavItem,
} from './types.js';

export type { APIClient } from './api-client.js';
export { BaseController } from './controller.js';
export { ListPage } from './components/ListPage.js';
export { FormPage } from './components/FormPage.js';
export { AppShell } from './components/AppLayout.js';
export { I18nProvider, useI18n } from './i18n.js';
export type { Translations } from './i18n.js';
