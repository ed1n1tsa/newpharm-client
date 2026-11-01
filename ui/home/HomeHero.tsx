'use client'

import Image from 'next/image'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Flame } from 'lucide-react'
import HomeIcon from './HomeIcon'

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
  const [q, setQ] = useState('')

  function goSearch(term?: string) {
    const query = (term ?? q).trim()
    if (!query) {
      router.push(catalogHref)
      return
    }
    router.push(`${catalogHref}?q=${encodeURIComponent(query)}`)
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    goSearch()
  }

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-7 pb-3 md:pb-5">
        {/* ===== Hero ===== */}
        <div className="grid grid-cols-[1fr_auto] lg:grid-cols-[1fr_1fr] gap-3 lg:gap-8 items-center">
          {/* Copy */}
          <div className="min-w-0">
            <h1 className="text-[22px] leading-[1.2] sm:text-[28px] lg:text-[34px] lg:leading-[1.18] font-extrabold text-[#111827] tracking-[-0.02em] max-w-[18ch] lg:max-w-[16ch]">
              Лекарства, товары для здоровья в одном месте
            </h1>
            <p className="mt-2 lg:mt-2.5 text-[13px] lg:text-[15px] text-[#6b7280] leading-snug max-w-[36ch] hidden sm:block">
              Найдите нужные лекарства, забронируйте в аптеке и получите консультацию врача
            </p>

            {/* Search — under title on all breakpoints */}
            <form
              onSubmit={onSubmit}
              className="mt-3 lg:mt-4 flex items-center rounded-full bg-white border border-[#e5e7eb] shadow-[0_4px_18px_rgba(17,24,39,0.05)] overflow-hidden max-w-xl"
              role="search"
            >
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Поиск лекарств, товаров, заболеваний…"
                className="flex-1 px-4 lg:px-5 py-2.5 lg:py-3 text-[13px] lg:text-[14px] text-slate-800 placeholder:text-slate-400 outline-none min-w-0 bg-transparent"
              />
              <button
                type="submit"
                className="shrink-0 m-1 rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-white px-4 lg:px-5 py-2 text-[13px] font-semibold transition"
              >
                Найти
              </button>
            </form>

            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[12px] lg:text-[13px]">
              <span className="inline-flex items-center gap-1 text-[#9ca3af] mr-0.5">
                <Flame size={12} className="text-orange-500" />
                Популярное:
              </span>
              {POPULAR.map((term, i) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => goSearch(term)}
                  className={`rounded-full bg-[#f3f4f6] hover:bg-[#e8f8ee] text-[#374151] px-2.5 py-1 transition ${
                    i >= 3 ? 'hidden sm:inline-flex' : 'inline-flex'
                  }`}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Illustration — large, with soft green blob */}
          <div className="relative w-[148px] sm:w-[200px] lg:w-full lg:max-w-[480px] lg:justify-self-end aspect-square flex items-center justify-center -mr-1">
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[125%] h-[125%] rounded-[42%] bg-[radial-gradient(ellipse_at_center,#c6f0d4_0%,#e8f8ee_45%,transparent_72%)]"
            />
            <div
              aria-hidden
              className="absolute left-[4%] top-[14%] w-[84%] h-[74%] rounded-[48%_42%_55%_40%] bg-[#b8ebc8]/60 blur-[1px]"
            />
            <Image
              src="/home/hero-bottles.png"
              alt="Лекарства NewPharm"
              width={560}
              height={560}
              priority
              className="relative z-[1] w-[115%] max-w-none h-auto object-contain drop-shadow-[0_12px_28px_rgba(22,163,74,0.16)] scale-[1.15] lg:scale-[1.28] origin-center"
              unoptimized
            />
          </div>
        </div>

        {/* ===== USP ===== */}
        {/* Desktop: flat row with captions */}
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

        {/* Mobile: 4 compact white cards in one row */}
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
