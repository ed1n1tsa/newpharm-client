'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  defaultLocale,
  isLocale,
  localeHtmlLang,
  LOCALE_COOKIE,
  LOCALE_STORAGE_KEY,
  type Locale,
} from '@/lib/i18n'
import { productPlural, translate } from '@/lib/i18n/messages'

type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, vars?: Record<string, string | number>) => string
  pluralProducts: (n: number) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

function persistLocale(locale: Locale) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
    document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;samesite=lax`
  } catch {
    /* ignore */
  }
}

export function LocaleProvider({
  children,
  initialLocale = defaultLocale,
}: {
  children: ReactNode
  initialLocale?: Locale
}) {
  const [locale, setLocaleState] = useState<Locale>(
    isLocale(initialLocale) ? initialLocale : defaultLocale
  )

  useEffect(() => {
    document.documentElement.lang = localeHtmlLang[locale]
  }, [locale])

  // Sync from localStorage if cookie was missing but storage has a value
  useEffect(() => {
    try {
      const fromStorage = localStorage.getItem(LOCALE_STORAGE_KEY)
      if (isLocale(fromStorage) && fromStorage !== locale) {
        setLocaleState(fromStorage)
        persistLocale(fromStorage)
      } else if (isLocale(locale)) {
        // ensure cookie mirrors current locale
        persistLocale(locale)
      }
    } catch {
      /* ignore */
    }
    // only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    persistLocale(next)
  }, [])

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      translate(locale, key, vars),
    [locale]
  )

  const pluralProducts = useCallback(
    (n: number) => productPlural(locale, n),
    [locale]
  )

  const value = useMemo(
    () => ({ locale, setLocale, t, pluralProducts }),
    [locale, setLocale, t, pluralProducts]
  )

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used inside <LocaleProvider/>')
  return ctx
}

export function useT() {
  return useLocale().t
}
