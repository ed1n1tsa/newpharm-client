'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { HomeNews } from '@/lib/homepage-cms'
import { localeDate } from '@/lib/i18n'
import { useLocale, useT } from '@/ui/LocaleProvider'

function formatDate(iso: string, locale: string) {
  try {
    return new Date(iso).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export default function HomeNewsSection({ news }: { news: HomeNews[] }) {
  const t = useT()
  const { locale } = useLocale()
  const list = news.filter((n) => n.active).sort((a, b) => a.sort - b.sort)
  if (!list.length) return null

  return (
    <section id="news" className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-5">
      <div className="flex items-end justify-between mb-3">
        <h2 className="text-[18px] md:text-[22px] font-bold text-[#111827]">
          {t('home.newsTitle')}
        </h2>
        <Link href="/#news" className="text-[13px] font-semibold text-[#22c55e]">
          {t('home.allNews')}
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {list.map((n) => (
          <Link
            key={n.id}
            href={n.href}
            className="flex gap-3 rounded-[16px] bg-white p-2.5 ring-1 ring-[#eef2f6] shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:shadow-md transition"
          >
            <div className="relative h-[72px] w-[88px] shrink-0 rounded-[12px] overflow-hidden bg-[#f3f4f6]">
              <Image src={n.image} alt="" fill className="object-cover" unoptimized />
            </div>
            <div className="min-w-0 py-0.5">
              <h3 className="text-[13px] font-semibold text-[#111827] line-clamp-2 leading-snug">
                {n.title}
              </h3>
              <p className="mt-1.5 text-[11px] text-[#9ca3af]">
                {formatDate(n.date, localeDate[locale])}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
