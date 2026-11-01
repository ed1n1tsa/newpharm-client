'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { HomeBanner } from '@/lib/homepage-cms'

function bannerSrc(src: string) {
  if (src.includes('banner-d3')) return '/home/banner-d3.png'
  if (src.includes('banner-doctor')) return '/home/banner-doctor.png'
  return src
}

function BannerCard({ b, compact }: { b: HomeBanner; compact?: boolean }) {
  const isPromo = b.kind === 'promo'
  return (
    <Link
      href={b.href}
      className={`relative overflow-hidden rounded-[22px] flex flex-col justify-center ${
        compact ? 'min-h-[132px] p-4' : 'min-h-[148px] md:min-h-[156px] p-5 md:p-6'
      } ${isPromo ? 'bg-gradient-to-br from-[#16a34a] to-[#22c55e] text-white' : 'bg-[#eef6f1] text-[#111827]'}`}
    >
      <div className="relative z-[1] max-w-[54%]">
        {b.subtitle && (
          <span
            className={`inline-flex text-[10px] font-semibold rounded-full px-2 py-0.5 mb-2 ${
              isPromo ? 'bg-white/20 text-white' : 'bg-white text-[#166534]'
            }`}
          >
            {b.subtitle}
          </span>
        )}
        <h3 className={`font-bold leading-snug tracking-tight ${compact ? 'text-[15px]' : 'text-[16px] md:text-[18px]'}`}>
          {b.title}
        </h3>
        <span
          className={`mt-3 inline-flex items-center rounded-full px-3.5 py-1.5 text-[12px] font-semibold ${
            isPromo ? 'bg-white text-[#15803d]' : 'bg-white text-[#15803d] shadow-sm'
          }`}
        >
          {b.cta} →
        </span>
      </div>
      <div className="pointer-events-none absolute right-0 bottom-0 top-0 w-[48%] flex items-center justify-end pr-1">
        <Image
          src={bannerSrc(b.image)}
          alt=""
          width={320}
          height={220}
          className="w-[95%] h-auto object-contain drop-shadow-md translate-y-1"
          unoptimized
        />
      </div>
    </Link>
  )
}

export default function HomeBanners({ banners }: { banners: HomeBanner[] }) {
  const list = useMemo(
    () => banners.filter((b) => b.active).sort((a, b) => a.sort - b.sort),
    [banners]
  )
  const promos = list.filter((b) => b.kind === 'promo')
  const consults = list.filter((b) => b.kind !== 'promo')
  const [idx, setIdx] = useState(0)
  const mobileSlides = promos.length ? promos : list

  if (!list.length) return null

  return (
    <section id="promos" className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 py-2 md:py-3">
      {/* Desktop: two columns */}
      <div className="hidden md:grid md:grid-cols-2 gap-3">
        {list.map((b) => (
          <BannerCard key={b.id} b={b} />
        ))}
      </div>

      {/* Mobile: promo carousel + separate consult banner */}
      <div className="md:hidden space-y-3">
        {mobileSlides.length > 0 && (
          <div>
            <BannerCard b={mobileSlides[idx % mobileSlides.length]} compact />
            {mobileSlides.length > 1 && (
              <div className="mt-2 flex justify-center gap-1.5">
                {mobileSlides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-label={`Слайд ${i + 1}`}
                    onClick={() => setIdx(i)}
                    className={`h-1.5 rounded-full transition ${
                      i === idx % mobileSlides.length ? 'w-4 bg-[#22c55e]' : 'w-1.5 bg-[#d1d5db]'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export function HomeConsultBanner({ banners }: { banners: HomeBanner[] }) {
  const consult = banners
    .filter((b) => b.active && b.kind !== 'promo')
    .sort((a, b) => a.sort - b.sort)[0]
  if (!consult) return null
  return (
    <section className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 py-2 md:hidden">
      <BannerCard b={consult} compact />
    </section>
  )
}
