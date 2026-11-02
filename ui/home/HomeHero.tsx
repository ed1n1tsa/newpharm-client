'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Flame } from 'lucide-react'
import HomeIcon from './HomeIcon'
import SearchBox from '@/ui/SearchBox'

const POPULAR = ['Парацетамол', 'Витамин D', 'Омега-3', 'Ибупрофен']

const USPS = [
  {
    icon: '/home/icon-truck.png',
    title: 'Быстрый заказ',
    text: 'Бронь в ближайшей аптеке',
  },
  {
    icon: '/home/icon-shield.png',
    title: 'Оригинальные товары',
    text: 'Только сертифицированные',
  },
  {
    icon: '/home/icon-card.png',
    title: 'Удобная оплата',
    text: 'Онлайн или при получении',
  },
  {
    icon: '/home/icon-headset.png',
    title: 'Консультации с врачами',
    text: 'Онлайн и офлайн',
  },
]

export default function HomeHero({ catalogHref }: { catalogHref: string }) {
  const router = useRouter()

  function goSearch(term: string) {
    const query = term.trim()
    if (!query) {
      router.push(catalogHref)
      return
    }
    router.push(`${catalogHref}?q=${encodeURIComponent(query)}`)
  }

  return (
    <section className="relative bg-white">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-7 pb-3 md:pb-5">
        {/* Title + illustration */}
        <div className="grid grid-cols-[1fr_auto] lg:grid-cols-[1fr_1fr] gap-3 lg:gap-8 items-center">
          <div className="min-w-0">
            <h1 className="text-[22px] leading-[1.2] sm:text-[28px] lg:text-[34px] lg:leading-[1.18] font-extrabold text-[#111827] tracking-[-0.02em] max-w-[18ch] lg:max-w-[16ch]">
              Лекарства, товары для здоровья в одном месте
            </h1>
            <p className="mt-2 lg:mt-2.5 text-[13px] lg:text-[15px] text-[#6b7280] leading-snug max-w-[36ch] hidden sm:block">
              Найдите нужные лекарства, забронируйте в аптеке и получите консультацию врача
            </p>
          </div>

          <div className="relative overflow-hidden w-[158px] sm:w-[220px] lg:w-full lg:max-w-[520px] lg:justify-self-end flex items-center justify-center -mr-1 lg:-mr-2">
            <Image
              src="/home/hero-bottles.png"
              alt="Лекарства NewPharm"
              width={1373}
              height={756}
              priority
              className="relative z-[1] w-full h-auto object-contain scale-[1.08] lg:scale-[1.12] origin-center"
              unoptimized
            />
          </div>
        </div>

        {/* One search for all breakpoints — avoids mobile duplicate */}
        <div className="relative z-30 mt-3 lg:mt-4 space-y-2.5 max-w-xl">
          <SearchBox catalogHref={catalogHref} />
          <div className="flex flex-nowrap items-center gap-1.5 text-[12px] lg:text-[13px] overflow-x-auto no-scrollbar">
            <span className="inline-flex items-center gap-1 text-[#9ca3af] shrink-0">
              <Flame size={12} className="text-orange-500" />
              Популярное:
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
        </div>

        {/* Desktop USP */}
        <div className="mt-6 lg:mt-8 hidden md:grid grid-cols-4 gap-6 lg:gap-8">
          {USPS.map((u) => (
            <div key={u.title} className="flex items-start gap-2.5">
              <span className="grid place-items-center h-9 w-9 shrink-0">
                <HomeIcon src={u.icon} alt="" size={32} />
              </span>
              <div className="min-w-0">
                <p className="text-[14px] font-bold text-[#111827] leading-tight">{u.title}</p>
                <p className="mt-0.5 text-[12px] text-[#9ca3af] leading-snug">{u.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile USP */}
        <div className="mt-4 grid grid-cols-4 gap-1.5 md:hidden">
          {USPS.map((u) => (
            <div
              key={u.title}
              className="rounded-[14px] bg-white ring-1 ring-[#eef2f6] shadow-[0_2px_8px_rgba(15,23,42,0.04)] px-1 py-2.5 flex flex-col items-center text-center gap-1.5"
            >
              <HomeIcon src={u.icon} alt="" size={26} />
              <p className="text-[10px] font-semibold text-[#111827] leading-tight px-0.5">
                {u.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
