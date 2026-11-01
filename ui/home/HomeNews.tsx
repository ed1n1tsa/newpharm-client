'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { HomeNews } from '@/lib/homepage-cms'

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export default function HomeNewsSection({ news }: { news: HomeNews[] }) {
  const list = news.filter((n) => n.active).sort((a, b) => a.sort - b.sort)
  if (!list.length) return null

  return (
    <section id="news" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-end justify-between mb-5">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900">Новости и акции</h2>
        <Link href="/#news" className="text-sm font-semibold text-emerald-600">
          Все новости →
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((n) => (
          <Link
            key={n.id}
            href={n.href}
            className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm hover:shadow-md transition"
          >
            <div className="relative h-20 w-24 shrink-0 rounded-xl overflow-hidden bg-slate-100">
              <Image src={n.image} alt="" fill className="object-cover" unoptimized />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">{n.title}</h3>
              <p className="mt-2 text-xs text-slate-500">{formatDate(n.date)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
