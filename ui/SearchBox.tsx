'use client'

import Link from 'next/link'
import {
  FormEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'
import { Search, ShoppingCart, X } from 'lucide-react'
import { useCart } from '@/ui/CartContext'

export type SearchHit = {
  id: string
  name: string
  brand?: string
  price: number
  image_url?: string | null
}

function formatPrice(n: number) {
  return `${Math.round(n).toLocaleString('ru-RU')} ₸`
}

function productHref(id: string, catalogHref: string) {
  if (catalogHref.startsWith('/client')) return `/client/products/${id}`
  return `/ProductPage?id=${encodeURIComponent(id)}`
}

type Props = {
  catalogHref: string
  /** Compact = header search strip */
  compact?: boolean
  className?: string
  autoFocus?: boolean
  initialQuery?: string
  onSubmitted?: () => void
}

export default function SearchBox({
  catalogHref,
  compact = false,
  className = '',
  autoFocus = false,
  initialQuery = '',
  onSubmitted,
}: Props) {
  const router = useRouter()
  const { add } = useCart()
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [q, setQ] = useState(initialQuery)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [items, setItems] = useState<SearchHit[]>([])
  const abortRef = useRef<AbortController | null>(null)

  const goAll = useCallback(
    (term?: string) => {
      const query = (term ?? q).trim()
      setOpen(false)
      onSubmitted?.()
      if (!query) {
        router.push(catalogHref)
        return
      }
      router.push(`${catalogHref}?q=${encodeURIComponent(query)}`)
    },
    [q, catalogHref, router, onSubmitted]
  )

  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) {
      setItems([])
      setTotal(0)
      setLoading(false)
      abortRef.current?.abort()
      return
    }

    setLoading(true)
    const t = window.setTimeout(async () => {
      abortRef.current?.abort()
      const ac = new AbortController()
      abortRef.current = ac
      try {
        const res = await fetch(
          `/api/products/search?q=${encodeURIComponent(term)}&limit=5`,
          { signal: ac.signal }
        )
        if (!res.ok) throw new Error('search failed')
        const data = await res.json()
        setItems(Array.isArray(data.items) ? data.items : [])
        setTotal(Number(data.total) || 0)
        setOpen(true)
      } catch (e: any) {
        if (e?.name === 'AbortError') return
        setItems([])
        setTotal(0)
      } finally {
        if (!ac.signal.aborted) setLoading(false)
      }
    }, 220)

    return () => {
      window.clearTimeout(t)
    }
  }, [q])

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    goAll()
  }

  function onAdd(p: SearchHit, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    add({
      id: p.id,
      name: p.name,
      price: p.price,
      image_url: p.image_url,
    })
  }

  const showPanel = open && q.trim().length >= 2

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <form
        onSubmit={onSubmit}
        className={`flex items-center rounded-full bg-white border overflow-hidden ${
          compact
            ? 'border-slate-200 bg-slate-50 focus-within:border-emerald-500 focus-within:bg-white'
            : showPanel
              ? 'border-[#22c55e] shadow-[0_4px_18px_rgba(34,197,94,0.12)]'
              : 'border-[#e5e7eb] shadow-[0_4px_18px_rgba(17,24,39,0.05)]'
        }`}
        role="search"
        aria-expanded={showPanel}
        aria-controls={listId}
      >
        {!compact && (
          <span className="pl-3.5 text-[#22c55e] shrink-0 hidden sm:grid place-items-center">
            <Search size={16} />
          </span>
        )}
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            if (e.target.value.trim().length >= 2) setOpen(true)
          }}
          onFocus={() => {
            if (q.trim().length >= 2) setOpen(true)
          }}
          autoFocus={autoFocus}
          placeholder="Поиск лекарств, товаров, заболеваний…"
          className={`flex-1 min-w-0 outline-none bg-transparent text-slate-800 placeholder:text-slate-400 ${
            compact
              ? 'px-4 py-2 text-[13px]'
              : 'px-3 sm:px-2 lg:px-3 py-2.5 lg:py-3 text-[13px] lg:text-[14px]'
          }`}
          autoComplete="off"
        />
        {q && (
          <button
            type="button"
            aria-label="Очистить"
            onClick={() => {
              setQ('')
              setItems([])
              setTotal(0)
              setOpen(false)
            }}
            className="shrink-0 p-1.5 mr-0.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={15} />
          </button>
        )}
        <button
          type="submit"
          className={`shrink-0 m-1 rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold transition ${
            compact ? 'px-4 py-1.5 text-[13px]' : 'px-4 lg:px-5 py-2 text-[13px]'
          }`}
        >
          Найти
        </button>
      </form>

      {showPanel && (
        <div
          id={listId}
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-[70] rounded-2xl bg-white border border-[#eef2f6] shadow-[0_12px_40px_rgba(15,23,42,0.12)] overflow-hidden"
        >
          <p className="px-3.5 pt-2.5 pb-1.5 text-[11px] text-[#9ca3af]">
            {loading
              ? 'Ищем…'
              : total > 0
                ? `Найдено ${total} товар${plural(total)} по запросу «${q.trim()}»`
                : `Ничего не найдено по запросу «${q.trim()}»`}
          </p>

          {items.length > 0 && (
            <ul className="max-h-[min(360px,50vh)] overflow-y-auto divide-y divide-[#f3f4f6]">
              {items.map((p) => (
                <li key={p.id}>
                  <Link
                    href={productHref(p.id, catalogHref)}
                    onClick={() => {
                      setOpen(false)
                      onSubmitted?.()
                    }}
                    className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-[#f8fafc] transition"
                  >
                    <span className="h-11 w-11 shrink-0 rounded-xl bg-[#f3f4f6] overflow-hidden grid place-items-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.image_url || '/images/product.png'}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[13px] font-semibold text-[#111827] leading-snug line-clamp-2">
                        {p.name}
                      </span>
                      {p.brand && (
                        <span className="block text-[11px] text-[#9ca3af] mt-0.5 truncate">
                          {p.brand}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 text-[13px] font-bold text-[#111827] tabular-nums">
                      {formatPrice(p.price)}
                    </span>
                    <button
                      type="button"
                      aria-label="В корзину"
                      onClick={(e) => onAdd(p, e)}
                      className="shrink-0 grid place-items-center h-8 w-8 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-white transition"
                    >
                      <ShoppingCart size={14} />
                    </button>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            onClick={() => goAll()}
            className="w-full px-3.5 py-2.5 text-[13px] font-semibold text-[#16a34a] bg-[#e8f8ee] hover:bg-[#dcfce7] transition text-left sm:text-center"
          >
            Все результаты по запросу «{q.trim()}» →
          </button>
        </div>
      )}
    </div>
  )
}

function plural(n: number) {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return ''
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return 'а'
  return 'ов'
}
