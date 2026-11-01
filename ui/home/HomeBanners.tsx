'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { HomeBanner } from '@/lib/homepage-cms'

export default function HomeBanners({ banners }: { banners: HomeBanner[] }) {
  const list = banners.filter((b) => b.active).sort((a, b) => a.sort - b.sort)
  if (!list.length) return null

  return (
    <section id="promos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
      <div className="grid md:grid-cols-2 gap-4">
        {list.map((b) => {
          const isPromo = b.kind === 'promo'
          return (
            <Link
              key={b.id}
              href={b.href}
              className={`relative overflow-hidden rounded-3xl min-h-[168px] md:min-h-[190px] p-6 flex flex-col justify-between ${
                isPromo ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-slate-900'
              }`}
            >
              <div className="relative z-[1] max-w-[58%]">
                {b.subtitle && (
                  <span
                    className={`inline-block text-xs font-semibold rounded-full px-2.5 py-1 mb-2 ${
                      isPromo ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {b.subtitle}
                  </span>
                )}
                <h3 className="text-lg md:text-xl font-bold leading-snug">{b.title}</h3>
                <span
                  className={`mt-4 inline-flex text-sm font-semibold ${
                    isPromo ? 'text-white' : 'text-emerald-700'
                  }`}
                >
                  {b.cta} →
                </span>
              </div>
              <div className="absolute right-0 bottom-0 top-0 w-[45%] flex items-end justify-end pr-2">
                <Image
                  src={b.image}
                  alt=""
                  width={280}
                  height={200}
                  className="object-contain max-h-full w-auto drop-shadow-md"
                  unoptimized
                />
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
