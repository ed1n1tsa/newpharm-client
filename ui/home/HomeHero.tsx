'use client'

import Image from 'next/image'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Flame } from 'lucide-react'
import HomeIcon from './HomeIcon'

const POPULAR = ['Парацетамол', 'Витамин D', 'Омега-3', 'Ибупрофен']

const USPS = [
  { icon: '/home/icon-truck.png', title: 'Быстрый заказ' },
  { icon: '/home/icon-shield.png', title: 'Оригинальные товары' },
  { icon: '/home/icon-card.png', title: 'Удобная оплата' },
  { icon: '/home/icon-headset.png', title: 'Консультации с врачами' },
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
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white">
      <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="pointer-events-none absolute left-10 top-40 h-40 w-40 rounded-full bg-emerald-100/80 blur-2xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-14 pb-8">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">
          <div className="order-1">
            <div className="grid grid-cols-[1.2fr_0.9fr] gap-3 items-center lg:block">
              <h1 className="text-[1.55rem] sm:text-4xl lg:text-[2.75rem] font-extrabold text-slate-900 leading-tight tracking-tight col-start-1">
                Лекарства, товары для здоровья в одном месте
              </h1>
              <div className="relative lg:hidden col-start-2 row-span-2">
                <div className="absolute inset-0 rounded-full bg-emerald-300/40 blur-xl" />
                <Image
                  src="/home/hero-bottles.png"
                  alt=""
                  width={280}
                  height={280}
                  priority
                  className="relative z-[1] w-full h-auto object-contain"
                  unoptimized
                />
              </div>
              <p className="mt-2 lg:mt-3 text-slate-600 text-sm sm:text-lg max-w-xl col-start-1 hidden sm:block lg:block">
                Найдите нужные лекарства, забронируйте в аптеке и получите консультацию врача
              </p>
            </div>

            <form
              onSubmit={onSubmit}
              className="mt-5 lg:mt-6 flex items-stretch rounded-full border border-slate-200 bg-white shadow-sm overflow-hidden focus-within:border-emerald-400"
              role="search"
            >
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Поиск лекарств, товаров, заболеваний…"
                className="flex-1 px-4 sm:px-5 py-3 sm:py-3.5 text-sm outline-none min-w-0"
              />
              <button
                type="submit"
                className="shrink-0 m-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 sm:px-5 text-sm font-semibold"
              >
                Найти
              </button>
            </form>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1 text-slate-500">
                <Flame size={14} className="text-orange-500" />
                Популярное:
              </span>
              {POPULAR.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => goSearch(term)}
                  className="rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 px-3 py-1 text-slate-700"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md aspect-square hidden lg:block">
            <div className="absolute inset-6 rounded-full bg-gradient-to-br from-emerald-300/70 via-emerald-200/50 to-transparent blur-2xl" />
            <div className="absolute inset-10 rounded-full bg-emerald-400/25" />
            <Image
              src="/home/hero-bottles.png"
              alt="Лекарства NewPharm"
              width={640}
              height={640}
              priority
              className="relative z-[1] w-full h-full object-contain drop-shadow-xl"
              unoptimized
            />
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {USPS.map((u) => (
            <div
              key={u.title}
              className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/80 px-3 py-3 shadow-sm"
            >
              <span className="grid place-items-center h-11 w-11 rounded-xl bg-emerald-50">
                <HomeIcon src={u.icon} alt="" size={28} />
              </span>
              <span className="text-sm font-semibold text-slate-800 leading-snug">{u.title}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
