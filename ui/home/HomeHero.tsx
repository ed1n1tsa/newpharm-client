'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Flame } from 'lucide-react'
import HomeIcon from './HomeIcon'
import SearchBox from '@/ui/SearchBox'
import { useT } from '@/ui/LocaleProvider'

const POPULAR = ['Парацетамол', 'Витамин D', 'Омега-3', 'Ибупрофен']

const USPS = [
  {
    icon: '/home/icon-truck.png',
    titleKey: 'home.usp.fastOrder',
    textKey: 'home.usp.fastOrderText',
  },
  {
    icon: '/home/icon-shield.png',
    titleKey: 'home.usp.original',
    textKey: 'home.usp.originalText',
  },
  {
    icon: '/home/icon-card.png',
    titleKey: 'home.usp.pay',
    textKey: 'home.usp.payText',
  },
  {
    icon: '/home/icon-headset.png',
    titleKey: 'home.usp.doctors',
    textKey: 'home.usp.doctorsText',
  },
] as const

export default function HomeHero({
  catalogHref,
  initialQuery = '',
  showPopular = true,
}: {
  catalogHref: string
  initialQuery?: string
  showPopular?: boolean
}) {
  const router = useRouter()
  const t = useT()

  function goSearch(term: string) {
    const query = term.trim()
    if (!query) {
      router.push(catalogHref)
      return
    }
    router.push(`${catalogHref}?q=${encodeURIComponent(query)}`)
  }

  return (
    <section className="relative overflow-visible bg-white">
      <div className="relative overflow-visible max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-7 pb-3 md:pb-5">
        <div className="relative">
          {/* Title + mobile image — no min-height so search stays under the headline */}
          <div className="grid grid-cols-[1fr_auto] gap-3 items-start">
            <div className="min-w-0 lg:max-w-xl lg:pt-1">
              <h1 className="text-[22px] leading-[1.2] sm:text-[28px] lg:text-[34px] lg:leading-[1.18] font-extrabold text-[#111827] tracking-[-0.02em] max-w-[18ch] lg:max-w-[16ch]">
                {t('home.heroTitle')}
              </h1>
              <p className="mt-2 lg:mt-2.5 text-[13px] lg:text-[15px] text-[#6b7280] leading-snug max-w-[36ch] hidden sm:block">
                {t('home.heroSubtitle')}
              </p>
            </div>

            <div className="relative w-[158px] sm:w-[220px] lg:hidden">
              <Image
                src="/home/hero-bottles.png"
                alt={t('home.heroAlt')}
                width={1373}
                height={756}
                priority
                className="block w-full h-auto object-contain select-none pointer-events-none"
                unoptimized
              />
            </div>
          </div>

          {/* Search sits under the title (not below the tall illustration) */}
          <div className="relative z-30 mt-3 lg:mt-4 space-y-2.5 max-w-xl">
            <SearchBox catalogHref={catalogHref} initialQuery={initialQuery} />
            {showPopular && (
              <div className="flex flex-nowrap items-center gap-1.5 text-[12px] lg:text-[13px] overflow-x-auto no-scrollbar">
                <span className="inline-flex items-center gap-1 text-[#9ca3af] shrink-0">
                  <Flame size={12} className="text-orange-500" />
                  {t('home.popular')}
                </span>
                {POPULAR.map((term, i) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => goSearch(term)}
                    className={`shrink-0 rounded-full bg-[#f3f4f6] hover:bg-[#e8f8ee] text-[#374151] px-2.5 py-1 transition ${
                      i >= 3 ? 'hidden sm:inline-flex' : 'inline-flex'
                    }`}
                  >
                    {term}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop illustration: out of flow so it doesn't push search/USPs down */}
          <div className="pointer-events-none absolute hidden lg:block top-0 right-0 w-[560px] xl:w-[600px] -translate-y-8 xl:-translate-y-10 translate-x-4 xl:translate-x-6">
            <Image
              src="/home/hero-bottles.png"
              alt={t('home.heroAlt')}
              width={1373}
              height={756}
              priority
              sizes="600px"
              className="block w-full h-auto object-contain select-none"
              unoptimized
            />
          </div>
        </div>

        {/* Desktop USP */}
        <div className="mt-6 lg:mt-8 hidden md:grid grid-cols-4 gap-6 lg:gap-8">
          {USPS.map((u) => (
            <div key={u.titleKey} className="flex items-start gap-2.5">
              <span className="grid place-items-center h-9 w-9 shrink-0">
                <HomeIcon src={u.icon} alt="" size={32} />
              </span>
              <div className="min-w-0">
                <p className="text-[14px] font-bold text-[#111827] leading-tight">
                  {t(u.titleKey)}
                </p>
                <p className="mt-0.5 text-[12px] text-[#9ca3af] leading-snug">{t(u.textKey)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile USP */}
        <div className="mt-4 grid grid-cols-4 gap-1.5 md:hidden">
          {USPS.map((u) => (
            <div
              key={u.titleKey}
              className="rounded-[14px] bg-white ring-1 ring-[#eef2f6] shadow-[0_2px_8px_rgba(15,23,42,0.04)] px-1 py-2.5 flex flex-col items-center text-center gap-1.5"
            >
              <HomeIcon src={u.icon} alt="" size={26} />
              <p className="text-[10px] font-semibold text-[#111827] leading-tight px-0.5">
                {t(u.titleKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
