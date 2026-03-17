import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { I18nProvider } from 'pageforge';
import '@cloudscape-design/global-styles/index.css';
import { App } from './App';

const translations = {
  en: {
    'list.loading': 'Loading resources...',
    'list.emptyTitle': 'No projects',
    'list.emptyDescription': 'Create a project to get started.',
  },
};

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <I18nProvider locale="en" translations={translations}>
        <App />
      </I18nProvider>
    </BrowserRouter>
  </React.StrictMode>
);
