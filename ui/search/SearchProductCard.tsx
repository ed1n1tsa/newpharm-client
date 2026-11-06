'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, ShoppingCart } from 'lucide-react'
import { useCart } from '@/ui/CartContext'
import { brandOf } from '@/lib/product-brand'

type Props = {
  product: {
    id: string
    name: string
    price: number
    image_url?: string | null
    category?: string | null
  }
  hrefBase?: 'guest' | 'client'
}

export default function SearchProductCard({ product, hrefBase = 'guest' }: Props) {
  const { add } = useCart()
  const [fav, setFav] = useState(false)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const brand = brandOf(product.name, product.category)
  const href =
    hrefBase === 'client'
      ? `/client/products/${product.id}`
      : `/ProductPage?id=${encodeURIComponent(product.id)}`

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (adding) return
    setAdding(true)
    try {
      add(
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url || undefined,
        },
        1
      )
      setAdded(true)
      setTimeout(() => setAdded(false), 1600)
    } finally {
      setTimeout(() => setAdding(false), 300)
    }
  }

  return (
    <article className="relative flex flex-col rounded-2xl border border-[#eef2f6] bg-white p-3 sm:p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition">
      <button
        type="button"
        aria-label="В избранное"
        onClick={() => setFav((v) => !v)}
        className="absolute right-2.5 top-2.5 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-slate-400 hover:text-emerald-600 ring-1 ring-[#eef2f6]"
      >
        <Heart size={15} className={fav ? 'fill-emerald-500 text-emerald-500' : ''} />
      </button>

      <Link href={href} className="block">
        <div className="aspect-square rounded-xl bg-[#f9fafb] grid place-items-center overflow-hidden mb-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image_url || '/images/product.png'}
            alt={product.name}
            className="max-h-full max-w-full object-contain p-2"
          />
        </div>
        <h3 className="text-[13px] sm:text-[14px] font-semibold text-[#111827] leading-snug line-clamp-2 min-h-[2.5em]">
          {product.name}
        </h3>
        {brand ? (
          <p className="mt-1 text-[12px] text-[#9ca3af] truncate">{brand}</p>
        ) : (
          <p className="mt-1 text-[12px] text-transparent select-none">.</p>
        )}
      </Link>

      <div className="mt-auto pt-2.5 flex items-end justify-between gap-2">
        <p className="text-[15px] sm:text-[16px] font-bold text-[#111827] leading-none">
          {Math.round(product.price).toLocaleString('ru-RU')} ₸
        </p>
        <button
          type="button"
          aria-label="В корзину"
          disabled={adding}
          onClick={handleAdd}
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white transition ${
            added
              ? 'bg-emerald-600'
              : adding
                ? 'bg-slate-300'
                : 'bg-[#22c55e] hover:bg-[#16a34a]'
          }`}
        >
          <ShoppingCart size={16} />
        </button>
      </div>
    </article>
  )
}
