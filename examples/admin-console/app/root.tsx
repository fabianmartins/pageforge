import { Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import { I18nProvider } from 'pageforge';
import '@cloudscape-design/global-styles/index.css';

const translations = {
  en: {
    'list.loading': 'Loading resources...',
    'list.emptyTitle': 'No projects',
    'list.emptyDescription': 'Create a project to get started.',
  },
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <I18nProvider locale="en" translations={translations}>
          <Outlet />
        </I18nProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
