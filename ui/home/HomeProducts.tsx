'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Heart, ShoppingCart } from 'lucide-react'
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

  const list = useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p]))
    const fromCms = featured
      .filter((f) => !f.label || f.label === tab || (tab === 'popular' && !f.label))
      .sort((a, b) => a.sort - b.sort)
      .map((f) => byId.get(f.productId))
      .filter(Boolean) as HomeProduct[]

    if (fromCms.length) return fromCms.slice(0, 10)
    // fallback: first products
    return products.slice(0, 8)
  }, [products, featured, tab])

  const tabs: { id: Tab; label: string }[] = [
    { id: 'popular', label: 'Популярные' },
    { id: 'new', label: 'Новинки' },
    { id: 'discount', label: 'Со скидкой' },
  ]

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-5">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900">Популярные товары</h2>
        <div className="flex flex-wrap items-center gap-2 md:ml-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                tab === t.id
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-emerald-50'
              }`}
            >
              {t.label}
            </button>
          ))}
          <Link href={catalogHref} className="text-sm font-semibold text-emerald-600 ml-1">
            Все товары →
          </Link>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {list.map((p) => {
          const volume = p.volume || extractVolume(p.name)
          return (
            <article
              key={p.id}
              className="shrink-0 w-[180px] sm:w-[200px] rounded-2xl border border-slate-100 bg-white p-3 shadow-sm hover:shadow-md transition relative"
            >
              <button
                type="button"
                aria-label="В избранное"
                onClick={() => setFav((s) => ({ ...s, [p.id]: !s[p.id] }))}
                className="absolute right-3 top-3 z-[1] rounded-full bg-white/90 p-1.5 border border-slate-100"
              >
                <Heart
                  size={16}
                  className={fav[p.id] ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}
                />
              </button>
              <Link href={`/ProductPage?id=${p.id}`} className="block">
                <div className="aspect-square rounded-xl bg-slate-50 grid place-items-center overflow-hidden mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image_url || '/fallback-image.png'}
                    alt={p.name}
                    className="max-h-full max-w-full object-contain p-2"
                  />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 min-h-[2.5rem]">
                  {p.name}
                </h3>
                {volume && <p className="mt-1 text-xs text-slate-500">{volume}</p>}
              </Link>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="font-bold text-slate-900">
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
                  className="grid place-items-center h-9 w-9 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  <ShoppingCart size={16} />
                </button>
              </div>
            </article>
          )
        })}
        {!list.length && (
          <p className="text-slate-500 text-sm py-8">Товары скоро появятся — добавьте их в админке.</p>
        )}
      </div>
    </section>
  )
}
