/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { en } from './en';
import type { BilingualText, Dictionary, Locale, TrailerMediaAsset } from './types';
import { vi } from './vi';

export const LOCALE_STORAGE_KEY = 'boomopen-locale';
const DEFAULT_LOCALE: Locale = 'en';

export const DICTIONARIES: Readonly<Record<Locale, Dictionary>> = {
  en,
  vi,
};

export interface LanguageContextValue {
  readonly locale: Locale;
  readonly setLocale: (next: Locale) => void;
  readonly toggleLocale: () => void;
  readonly t: Dictionary;
  readonly pick: (b: { readonly en: string; readonly vi: string }) => string;
}

function isSupportedLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'vi';
}

function detectNavigatorLocale(): Locale {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }
  try {
    const primaryLanguage =
      window.navigator?.language ?? window.navigator?.languages?.[0] ?? '';
    if (typeof primaryLanguage === 'string' && primaryLanguage.toLowerCase().startsWith('vi')) {
      return 'vi';
    }
  } catch {
    return DEFAULT_LOCALE;
  }
  return DEFAULT_LOCALE;
}

export function resolveInitialLocale(): Locale {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isSupportedLocale(stored)) {
      return stored;
    }
  } catch {
    // Storage access can throw in restricted private browsing or sandboxed iframes.
  }
  return detectNavigatorLocale();
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export interface LanguageProviderProps {
  readonly children: ReactNode;
  readonly initialLocale?: Locale;
}

export function LanguageProvider({ children, initialLocale }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => initialLocale ?? resolveInitialLocale());

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
      }
    } catch {
      // Keep active in-memory locale when localStorage writes are blocked.
    }
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((current) => (current === 'en' ? 'vi' : 'en'));
  }, []);

  const pick = useCallback(
    (bilingual: { readonly en: string; readonly vi: string }): string =>
      locale === 'vi' ? bilingual.vi : bilingual.en,
    [locale],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      t: DICTIONARIES[locale],
      pick,
    }),
    [locale, setLocale, toggleLocale, pick],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (context === null) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export type { BilingualText, Dictionary, Locale, TrailerMediaAsset };
