'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { HomeBanner } from '@/lib/homepage-cms'

/** Full-bleed mock backgrounds (photo 2 / photo 3). */
function bannerBg(b: HomeBanner) {
  if (b.kind === 'promo' || b.id.includes('d3') || (b.image || '').includes('d3')) {
    return '/home/banner-d3-bg.png'
  }
  if (
    b.kind === 'consult' ||
    b.id.includes('doctor') ||
    (b.image || '').includes('doctor')
  ) {
    return '/home/banner-doctor-bg.png'
  }
  return b.image || '/home/banner-d3-bg.png'
}

function BannerCard({ b, compact }: { b: HomeBanner; compact?: boolean }) {
  const isPromo = b.kind === 'promo'
  const bg = bannerBg(b)

  return (
    <Link
      href={b.href}
      className={`relative overflow-hidden rounded-[22px] flex flex-col justify-center ${
        compact ? 'min-h-[132px] p-4' : 'min-h-[152px] md:min-h-[168px] p-5 md:p-6'
      } ${isPromo ? 'text-white' : 'text-[#111827]'}`}
      style={{
        // Edge color of mock art — fills any subpixel gaps under the photo
        backgroundColor: isPromo ? '#035630' : '#f2fbf1',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${bg}?v=4`}
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-center select-none"
      />
      <div className="relative z-[1] max-w-[58%] sm:max-w-[52%]">
        {b.subtitle && (
          <span
            className={`inline-flex text-[10px] font-semibold rounded-full px-2 py-0.5 mb-2 ${
              isPromo ? 'bg-white/20 text-white' : 'bg-white/90 text-[#166534] shadow-sm'
            }`}
          >
            {b.subtitle}
          </span>
        )}
        <h3
          className={`font-bold leading-snug tracking-tight ${
            compact ? 'text-[15px]' : 'text-[16px] md:text-[18px]'
          }`}
        >
          {b.title}
        </h3>
        <span
          className={`mt-3 inline-flex items-center rounded-full px-3.5 py-1.5 text-[12px] font-semibold shadow-sm ${
            isPromo ? 'bg-white text-[#15803d]' : 'bg-white text-[#15803d]'
          }`}
        >
          {b.cta} →
        </span>
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
  const [idx, setIdx] = useState(0)
  const mobileSlides = promos.length ? promos : list

  if (!list.length) return null

  return (
    <section id="promos" className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 py-2 md:py-3">
      <div className="hidden md:grid md:grid-cols-2 gap-3">
        {list.map((b) => (
          <BannerCard key={b.id} b={b} />
        ))}
      </div>

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
