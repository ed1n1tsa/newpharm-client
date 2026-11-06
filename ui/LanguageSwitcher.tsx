'use client'

import { locales, localeLabels, type Locale } from '@/lib/i18n'
import { useLocale } from '@/ui/LocaleProvider'

type Props = {
  /** Compact for header; pill for drawer/footer */
  variant?: 'inline' | 'pill'
  /** Light = guest chrome; dark = footer on green */
  tone?: 'light' | 'dark'
  className?: string
}

export default function LanguageSwitcher({
  variant = 'inline',
  tone = 'light',
  className = '',
}: Props) {
  const { locale, setLocale, t } = useLocale()

  if (variant === 'pill') {
    return (
      <div
        className={`inline-flex items-center gap-0.5 rounded-full p-0.5 ${
          tone === 'dark'
            ? 'border border-white/20 bg-white/10'
            : 'border border-[#d1fae5] bg-[#f0fdf4]'
        } ${className}`}
        role="group"
        aria-label={t('lang.label')}
      >
        {locales.map((code) => (
          <LangButton
            key={code}
            code={code}
            active={locale === code}
            onSelect={setLocale}
            pill
            tone={tone}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={`inline-flex items-center gap-0.5 text-[12px] font-semibold ${className}`}
      role="group"
      aria-label={t('lang.label')}
    >
      {locales.map((code, i) => (
        <span key={code} className="inline-flex items-center">
          {i > 0 && (
            <span
              className={`mx-0.5 ${
                tone === 'dark' ? 'text-white/30' : 'text-slate-300'
              }`}
            >
              ·
            </span>
          )}
          <LangButton
            code={code}
            active={locale === code}
            onSelect={setLocale}
            tone={tone}
          />
        </span>
      ))}
    </div>
  )
}

function LangButton({
  code,
  active,
  onSelect,
  pill = false,
  tone = 'light',
}: {
  code: Locale
  active: boolean
  onSelect: (locale: Locale) => void
  pill?: boolean
  tone?: 'light' | 'dark'
}) {
  if (pill) {
    return (
      <button
        type="button"
        onClick={() => onSelect(code)}
        className={`min-w-[36px] rounded-full px-2 py-1 text-[11px] font-bold transition ${
          active
            ? 'bg-[#22c55e] text-white'
            : tone === 'dark'
              ? 'text-emerald-50/80 hover:bg-white/10'
              : 'text-[#166534] hover:bg-white/80'
        }`}
        aria-pressed={active}
      >
        {localeLabels[code]}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(code)}
      className={`rounded px-1 py-0.5 transition ${
        active
          ? tone === 'dark'
            ? 'text-white'
            : 'text-[#16a34a]'
          : tone === 'dark'
            ? 'text-emerald-100/50 hover:text-white'
            : 'text-slate-400 hover:text-slate-600'
      }`}
      aria-pressed={active}
    >
      {localeLabels[code]}
    </button>
  )
}
