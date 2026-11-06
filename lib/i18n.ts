export const locales = ['ru', 'kk', 'en'] as const

export const defaultLocale = 'ru' as const

export type Locale = (typeof locales)[number]

export const LOCALE_COOKIE = 'newpharm_locale'
export const LOCALE_STORAGE_KEY = 'newpharm_locale'

export const localeLabels: Record<Locale, string> = {
  ru: 'RU',
  kk: 'KK',
  en: 'EN',
}

export const localeHtmlLang: Record<Locale, string> = {
  ru: 'ru',
  kk: 'kk',
  en: 'en',
}

export const localeDate: Record<Locale, string> = {
  ru: 'ru-RU',
  kk: 'kk-KZ',
  en: 'en-US',
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value)
}

export function normalizeLocale(value: unknown): Locale {
  if (isLocale(value)) return value
  return defaultLocale
}
