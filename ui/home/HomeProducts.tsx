'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Heart, ShoppingCart } from 'lucide-react'
import { useCart } from '@/ui/CartContext'
import type { FeaturedProduct } from '@/lib/homepage-cms'

export type HomeProduct = {
  id: string
  name: string
  price: number
  image_url: string | null
  volume?: string | null
}

type Tab = 'popular' | 'new' | 'discount'

function extractVolume(name: string) {
  const m = name.match(/(\d+[\.,]?\d*\s?(мл|мг|г|шт|таб|капс|№\d+).*)/i)
  return m?.[0]?.slice(0, 24) || null
}

export default function HomeProducts({
  products,
  featured,
  catalogHref,
}: {
  products: HomeProduct[]
  featured: FeaturedProduct[]
  catalogHref: string
}) {
  const { add } = useCart()
  const [tab, setTab] = useState<Tab>('popular')
  const [fav, setFav] = useState<Record<string, boolean>>({})
  const scroller = useRef<HTMLDivElement>(null)

  const list = useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p]))
    const fromCms = featured
      .filter((f) => !f.label || f.label === tab || (tab === 'popular' && !f.label))
      .sort((a, b) => a.sort - b.sort)
      .map((f) => byId.get(f.productId))
      .filter(Boolean) as HomeProduct[]
    if (fromCms.length) return fromCms.slice(0, 12)
    return products.slice(0, 10)
  }, [products, featured, tab])

  const tabs: { id: Tab; label: string }[] = [
    { id: 'popular', label: 'Популярные' },
    { id: 'new', label: 'Новинки' },
    { id: 'discount', label: 'Со скидкой' },
  ]

  function scrollBy(dir: number) {
    const el = scroller.current
    if (!el) return
    el.scrollBy({ left: dir * Math.max(280, el.clientWidth * 0.75), behavior: 'smooth' })
  }

  return (
    <section className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-5 relative">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
        <h2 className="text-[18px] md:text-[22px] font-bold text-[#111827]">Популярные товары</h2>
        <div className="flex flex-wrap items-center gap-1.5 sm:ml-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-full px-3 py-1 text-[12px] font-semibold transition ${
                tab === t.id
                  ? 'bg-[#22c55e] text-white'
                  : 'bg-[#f3f4f6] text-[#6b7280]'
              }`}
            >
              {t.label}
            </button>
          ))}
          <Link href={catalogHref} className="text-[13px] font-semibold text-[#22c55e] ml-1">
            Все товары →
          </Link>
        </div>
      </div>

      <div className="relative">
        <button
          type="button"
          aria-label="Назад"
          onClick={() => scrollBy(-1)}
          className="hidden md:grid absolute -left-3 top-1/2 -translate-y-1/2 z-10 place-items-center h-9 w-9 rounded-full bg-white shadow ring-1 ring-[#e5e7eb] text-slate-600"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          aria-label="Вперёд"
          onClick={() => scrollBy(1)}
          className="hidden md:grid absolute -right-3 top-1/2 -translate-y-1/2 z-10 place-items-center h-9 w-9 rounded-full bg-white shadow ring-1 ring-[#e5e7eb] text-slate-600"
        >
          <ChevronRight size={18} />
        </button>

        <div
          ref={scroller}
          className="flex gap-2.5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1"
        >
          {list.map((p) => {
            const volume = p.volume || extractVolume(p.name)
            return (
              <article
                key={p.id}
                className="snap-start shrink-0 w-[calc(50%-5px)] sm:w-[160px] md:w-[168px] rounded-[18px] bg-white p-2.5 ring-1 ring-[#eef2f6] shadow-[0_1px_3px_rgba(15,23,42,0.04)] relative"
              >
                <button
                  type="button"
                  aria-label="В избранное"
                  onClick={() => setFav((s) => ({ ...s, [p.id]: !s[p.id] }))}
                  className="absolute right-2.5 top-2.5 z-[1] text-slate-300 hover:text-rose-500"
                >
                  <Heart size={15} className={fav[p.id] ? 'fill-rose-500 text-rose-500' : ''} />
                </button>
                <Link href={`/ProductPage?id=${p.id}`} className="block">
                  <div className="aspect-square rounded-xl bg-[#f9fafb] grid place-items-center overflow-hidden mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image_url || '/fallback-image.png'}
                      alt={p.name}
                      className="max-h-[90%] max-w-[90%] object-contain"
                    />
                  </div>
                  <h3 className="text-[12px] font-semibold text-[#111827] line-clamp-2 min-h-[2.2rem] leading-snug">
                    {p.name}
                  </h3>
                  {volume && <p className="mt-0.5 text-[11px] text-[#9ca3af]">{volume}</p>}
                </Link>
                <div className="mt-2 flex items-center justify-between gap-1">
                  <span className="font-bold text-[#111827] text-[13px]">
                    {Number(p.price || 0).toLocaleString('ru-RU')} ₸
                  </span>
                  <button
                    type="button"
                    aria-label="В корзину"
                    onClick={() =>
                      add(
                        {
                          id: p.id,
                          name: p.name,
                          price: Number(p.price) || 0,
                          image_url: p.image_url,
                        },
                        1
                      )
                    }
                    className="grid place-items-center h-8 w-8 rounded-[10px] bg-[#22c55e] text-white"
                  >
                    <ShoppingCart size={14} />
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
