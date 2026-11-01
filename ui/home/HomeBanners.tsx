'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { HomeBanner } from '@/lib/homepage-cms'

function bannerSrc(src: string) {
  if (src.endsWith('.jpg') && src.includes('banner-d3')) return '/home/banner-d3.png'
  if (src.includes('banner-doctor')) return '/home/banner-doctor.png'
  if (src.includes('banner-d3')) return '/home/banner-d3.png'
  return src
}

export default function HomeBanners({ banners }: { banners: HomeBanner[] }) {
  const list = banners.filter((b) => b.active).sort((a, b) => a.sort - b.sort)
  if (!list.length) return null

  return (
    <section id="promos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 md:py-4">
      <div className="grid md:grid-cols-2 gap-4">
        {list.map((b) => {
          const isPromo = b.kind === 'promo'
          return (
            <Link
              key={b.id}
              href={b.href}
              className={`relative overflow-hidden rounded-[28px] min-h-[180px] md:min-h-[200px] p-6 md:p-7 flex flex-col justify-center ${
                isPromo
                  ? 'bg-[#22c55e] text-white'
                  : 'bg-[#eef6f1] text-[#0f172a]'
              }`}
            >
              <div className="relative z-[1] max-w-[55%] sm:max-w-[58%]">
                {b.subtitle && (
                  <span
                    className={`inline-flex text-[11px] font-semibold rounded-full px-2.5 py-1 mb-3 ${
                      isPromo
                        ? 'bg-white/20 text-white'
                        : 'bg-white text-[#166534]'
                    }`}
                  >
                    {b.subtitle}
                  </span>
                )}
                <h3 className="text-lg md:text-[1.35rem] font-bold leading-snug tracking-tight">
                  {b.title}
                </h3>
                <span
                  className={`mt-5 inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold shadow-sm ${
                    isPromo
                      ? 'bg-white text-[#15803d]'
                      : 'bg-white text-[#15803d] ring-1 ring-black/5'
                  }`}
                >
                  {b.cta} →
                </span>
              </div>

              <div className="pointer-events-none absolute right-[-4%] bottom-[-6%] top-auto w-[48%] sm:w-[44%] flex items-end justify-center">
                <Image
                  src={bannerSrc(b.image)}
                  alt=""
                  width={360}
                  height={240}
                  className="w-full h-auto object-contain drop-shadow-lg"
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
