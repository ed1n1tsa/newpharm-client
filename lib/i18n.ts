export const locales = ['kk', 'ru'] as const;

export const defaultLocale = 'ru';

export type Locale = (typeof locales)[number];
