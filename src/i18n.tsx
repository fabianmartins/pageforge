import React, { createContext, useContext } from 'react';

export type Translations = Record<string, string>;

interface I18nContextValue { t: (key: string, fallback?: string) => string; locale: string }

const I18nContext = createContext<I18nContextValue>({ t: (key, fallback) => fallback ?? key, locale: 'en' });

interface I18nProviderProps { locale: string; translations: Record<string, Translations>; children: React.ReactNode }

export function I18nProvider({ locale, translations, children }: I18nProviderProps) {
  const t = (key: string, fallback?: string) => translations[locale]?.[key] ?? fallback ?? key;
  return <I18nContext.Provider value={{ t, locale }}>{children}</I18nContext.Provider>;
}

export function useI18n() { return useContext(I18nContext); }
