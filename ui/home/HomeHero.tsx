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
    text: 'WhatsApp или при получении',
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
    <section className="relative overflow-hidden bg-[#f7fbf8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12 pb-6 md:pb-10">
        {/* Hero row: text left, art right */}
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6 lg:gap-10 items-center">
          <div>
            <div className="flex gap-3 items-start lg:block">
              <div className="min-w-0 flex-1">
                <h1 className="text-[1.65rem] sm:text-[2.35rem] lg:text-[2.75rem] font-extrabold text-[#0f172a] leading-[1.15] tracking-[-0.02em]">
                  Лекарства, товары для здоровья в одном месте
                </h1>
                <p className="mt-3 text-[#64748b] text-sm sm:text-base lg:text-lg max-w-xl leading-relaxed">
                  Найдите нужные лекарства, забронируйте в аптеке и получите консультацию врача
                </p>
              </div>
              <div className="relative w-[38%] max-w-[150px] shrink-0 lg:hidden">
                <div className="absolute inset-[-10%] rounded-full bg-[#86efac]/45 blur-2xl" />
                <Image
                  src="/home/hero-bottles.png"
                  alt=""
                  width={200}
                  height={200}
                  priority
                  className="relative z-[1] w-full h-auto object-contain"
                  unoptimized
                />
              </div>
            </div>

            <form
              onSubmit={onSubmit}
              className="mt-6 flex items-center rounded-[18px] bg-white border border-[#e8eef0] shadow-[0_8px_30px_rgba(15,23,42,0.04)] overflow-hidden"
              role="search"
            >
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Поиск лекарств, товаров, заболеваний…"
                className="flex-1 px-5 py-3.5 text-[15px] text-slate-800 placeholder:text-slate-400 outline-none min-w-0 bg-transparent"
              />
              <button
                type="submit"
                className="shrink-0 m-1.5 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-white px-6 py-2.5 text-sm font-semibold transition"
              >
                Найти
              </button>
            </form>

            <div className="mt-3.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm">
              <span className="inline-flex items-center gap-1 text-slate-500">
                <Flame size={14} className="text-orange-500" />
                Популярное:
              </span>
              {POPULAR.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => goSearch(term)}
                  className="text-slate-700 hover:text-emerald-600 transition"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:flex items-center justify-center min-h-[360px]">
            <div className="absolute w-[78%] aspect-square rounded-full bg-[radial-gradient(circle_at_center,#bbf7d0_0%,#dcfce7_42%,transparent_72%)]" />
            <Image
              src="/home/hero-bottles.png"
              alt="Лекарства NewPharm"
              width={560}
              height={560}
              priority
              className="relative z-[1] w-[88%] max-w-[420px] h-auto object-contain drop-shadow-[0_20px_40px_rgba(22,163,74,0.18)]"
              unoptimized
            />
          </div>
        </div>

        {/* USP — flat, no heavy cards (as in mock) */}
        <div className="mt-10 md:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6">
          {USPS.map((u) => (
            <div key={u.title} className="flex items-start gap-3">
              <span className="mt-0.5 grid place-items-center h-11 w-11 shrink-0">
                <HomeIcon src={u.icon} alt="" size={36} />
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="text-[15px] font-bold text-[#0f172a] leading-snug">{u.title}</p>
                <p className="mt-0.5 text-sm text-[#94a3b8] leading-snug">{u.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
