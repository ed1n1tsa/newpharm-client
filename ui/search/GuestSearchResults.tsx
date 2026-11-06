'use client'

import { useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import type { CatalogProduct } from '@/lib/catalog-products'
import { brandOf } from '@/lib/product-brand'
import { localeDate } from '@/lib/i18n'
import { useLocale } from '@/ui/LocaleProvider'
import SearchProductCard from './SearchProductCard'

const PAGE_SIZE = 12

type Category = { id: string; name: string }

type Props = {
  query: string
  categories: Category[]
  products: CatalogProduct[]
  hrefBase?: 'guest' | 'client'
}

export default function GuestSearchResults({
  query,
  categories,
  products,
  hrefBase = 'guest',
}: Props) {
  const { locale, t, pluralProducts } = useLocale()
  const loc = localeDate[locale]
  const [activeCategories, setActiveCategories] = useState<string[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sort, setSort] = useState('popular')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(1)
  const [filterOpen, setFilterOpen] = useState(false)
  const [showAllBrands, setShowAllBrands] = useState(false)

  const priceBounds = useMemo(() => {
    if (!products.length) return { min: 0, max: 10000 }
    let min = Infinity
    let max = 0
    for (const p of products) {
      const price = Number(p.price) || 0
      if (price < min) min = price
      if (price > max) max = price
    }
    return {
      min: Math.max(0, Math.floor(min)),
      max: Math.max(1000, Math.ceil(max)),
    }
  }, [products])

  const [minPrice, setMinPrice] = useState(priceBounds.min)
  const [maxPrice, setMaxPrice] = useState(priceBounds.max)

  const brandCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of products) {
      const b = brandOf(p.name, p.category)
      if (!b) continue
      map.set(b, (map.get(b) || 0) + 1)
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], loc))
      .map(([name, count]) => ({ name, count }))
  }, [products, loc])

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>()
    const q = query.trim().toLowerCase()
    const pool = q
      ? products.filter((p) => p.name.toLowerCase().includes(q))
      : products
    for (const p of pool) {
      if (!p.category) continue
      const id = p.category.toLowerCase().replace(/\s+/g, '-')
      map.set(id, (map.get(id) || 0) + 1)
    }
    return categories
      .map((c) => ({ ...c, count: map.get(c.id) || 0 }))
      .filter((c) => c.count > 0)
  }, [categories, products, query])

  const filtered = useMemo(() => {
    let result = [...products]
    const q = query.trim().toLowerCase()
    if (q) result = result.filter((p) => p.name.toLowerCase().includes(q))

    if (activeCategories.length) {
      result = result.filter((p) => {
        if (!p.category) return false
        const id = p.category.toLowerCase().replace(/\s+/g, '-')
        return activeCategories.includes(id)
      })
    }

    if (brands.length) {
      result = result.filter((p) => brands.includes(brandOf(p.name, p.category)))
    }

    result = result.filter((p) => {
      const price = Number(p.price) || 0
      return price >= minPrice && price <= maxPrice
    })

    if (inStockOnly) {
      result = result.filter((p) => (p.stock ?? 0) > 0)
    }

    switch (sort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name, loc))
        break
      default:
        break
    }

    return result
  }, [
    products,
    query,
    activeCategories,
    brands,
    minPrice,
    maxPrice,
    inStockOnly,
    sort,
    loc,
  ])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  function toggleCategory(id: string) {
    setPage(1)
    setActiveCategories((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function toggleBrand(name: string) {
    setPage(1)
    setBrands((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    )
  }

  const visibleBrands = showAllBrands ? brandCounts : brandCounts.slice(0, 6)
  const productWord = (n: number) =>
    t('catalog.productWord', { plural: pluralProducts(n) })

  const filtersPanel = (
    <div className="space-y-6">
      <div>
        <p className="text-[14px] font-bold text-[#111827] mb-2.5">
          {t('catalog.categories')}
        </p>
        <ul className="space-y-2">
          {categoryCounts.map((c) => (
            <li key={c.id}>
              <label className="flex items-center gap-2 text-[13px] text-[#374151] cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeCategories.includes(c.id)}
                  onChange={() => toggleCategory(c.id)}
                  className="size-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="flex-1 min-w-0 truncate">{c.name}</span>
                <span className="text-[#9ca3af] tabular-nums">{c.count}</span>
              </label>
            </li>
          ))}
          {!categoryCounts.length && (
            <li className="text-[13px] text-[#9ca3af]">{t('catalog.noCategories')}</li>
          )}
        </ul>
      </div>

      <div>
        <p className="text-[14px] font-bold text-[#111827] mb-2.5">{t('catalog.price')}</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            value={minPrice}
            min={0}
            onChange={(e) => {
              setPage(1)
              setMinPrice(Number(e.target.value) || 0)
            }}
            className="w-1/2 rounded-xl border border-[#e5e7eb] px-3 py-2 text-[13px] outline-none focus:border-emerald-500"
            aria-label={t('catalog.priceFrom')}
          />
          <span className="text-[#9ca3af]">—</span>
          <input
            type="number"
            inputMode="numeric"
            value={maxPrice}
            min={0}
            onChange={(e) => {
              setPage(1)
              setMaxPrice(Number(e.target.value) || 0)
            }}
            className="w-1/2 rounded-xl border border-[#e5e7eb] px-3 py-2 text-[13px] outline-none focus:border-emerald-500"
            aria-label={t('catalog.priceTo')}
          />
        </div>
        <p className="mt-1.5 text-[11px] text-[#9ca3af]">
          {priceBounds.min.toLocaleString(loc)} —{' '}
          {priceBounds.max.toLocaleString(loc)} ₸
        </p>
      </div>

      {brandCounts.length > 0 && (
        <div>
          <p className="text-[14px] font-bold text-[#111827] mb-2.5">
            {t('catalog.brands')}
          </p>
          <ul className="space-y-2">
            {visibleBrands.map((b) => (
              <li key={b.name}>
                <label className="flex items-center gap-2 text-[13px] text-[#374151] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={brands.includes(b.name)}
                    onChange={() => toggleBrand(b.name)}
                    className="size-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="flex-1 min-w-0 truncate">{b.name}</span>
                  <span className="text-[#9ca3af] tabular-nums">{b.count}</span>
                </label>
              </li>
            ))}
          </ul>
          {brandCounts.length > 6 && (
            <button
              type="button"
              onClick={() => setShowAllBrands((v) => !v)}
              className="mt-2 text-[13px] font-medium text-emerald-600 hover:text-emerald-700"
            >
              {showAllBrands ? t('catalog.collapse') : t('catalog.showAll')}
            </button>
          )}
        </div>
      )}

      <div>
        <p className="text-[14px] font-bold text-[#111827] mb-2.5">
          {t('catalog.availability')}
        </p>
        <label className="inline-flex items-center gap-2.5 text-[13px] text-[#374151] cursor-pointer">
          <span
            role="switch"
            aria-checked={inStockOnly}
            tabIndex={0}
            onClick={() => {
              setPage(1)
              setInStockOnly((v) => !v)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setPage(1)
                setInStockOnly((v) => !v)
              }
            }}
            className={`relative h-6 w-11 rounded-full transition ${
              inStockOnly ? 'bg-[#22c55e]' : 'bg-slate-200'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                inStockOnly ? 'translate-x-5' : ''
              }`}
            />
          </span>
          {t('catalog.inStockOnly')}
        </label>
      </div>
    </div>
  )

  const pageButtons = useMemo(() => {
    const pages: (number | '…')[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
      return pages
    }
    pages.push(1)
    if (currentPage > 3) pages.push('…')
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i)
    }
    if (currentPage < totalPages - 2) pages.push('…')
    pages.push(totalPages)
    return pages
  }, [currentPage, totalPages])

  const sortOptions = (
    <>
      <option value="popular">{t('catalog.sortPopular')}</option>
      <option value="price-asc">{t('catalog.sortPriceAsc')}</option>
      <option value="price-desc">{t('catalog.sortPriceDesc')}</option>
      <option value="name">{t('catalog.sortName')}</option>
    </>
  )

  return (
    <section className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 pb-10 md:pb-14">
      <div className="flex flex-wrap items-end justify-between gap-2 mb-4 md:mb-5">
        <div className="min-w-0">
          <h2 className="text-[18px] sm:text-[22px] font-extrabold text-[#111827] tracking-[-0.02em]">
            {query.trim()
              ? t('catalog.resultsFor', { q: query.trim() })
              : t('catalog.title')}
          </h2>
        </div>
        <span className="shrink-0 rounded-full bg-[#f3f4f6] px-3 py-1 text-[12px] text-[#6b7280]">
          {t('catalog.foundShort', {
            n: filtered.length,
            plural: productWord(filtered.length),
          })}
        </span>
      </div>

      {/* Mobile toolbar */}
      <div className="mb-4 flex items-center gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-[13px] font-medium text-[#374151]"
        >
          <SlidersHorizontal size={15} />
          {t('catalog.filters')}
        </button>
        <label className="flex-1 min-w-0">
          <span className="sr-only">{t('catalog.sort')}</span>
          <select
            value={sort}
            onChange={(e) => {
              setPage(1)
              setSort(e.target.value)
            }}
            className="w-full rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-[13px] text-[#374151] outline-none"
          >
            {sortOptions}
          </select>
        </label>
        <div className="inline-flex rounded-xl border border-[#e5e7eb] overflow-hidden">
          <button
            type="button"
            aria-label={t('catalog.grid')}
            onClick={() => setViewMode('grid')}
            className={`p-2 ${
              viewMode === 'grid'
                ? 'bg-[#22c55e] text-white'
                : 'bg-white text-slate-500'
            }`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            type="button"
            aria-label={t('catalog.list')}
            onClick={() => setViewMode('list')}
            className={`p-2 ${
              viewMode === 'list'
                ? 'bg-[#22c55e] text-white'
                : 'bg-white text-slate-500'
            }`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[240px_minmax(0,1fr)] gap-6 xl:gap-8">
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-2xl border border-[#eef2f6] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            {filtersPanel}
          </div>
        </aside>

        <div className="min-w-0">
          {/* Desktop toolbar */}
          <div className="mb-4 hidden lg:flex items-center justify-end gap-3">
            <label className="inline-flex items-center gap-2 text-[13px] text-[#6b7280]">
              {t('catalog.sort')}:
              <select
                value={sort}
                onChange={(e) => {
                  setPage(1)
                  setSort(e.target.value)
                }}
                className="rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-[13px] text-[#374151] outline-none"
              >
                {sortOptions}
              </select>
            </label>
            <div className="inline-flex rounded-xl border border-[#e5e7eb] overflow-hidden">
              <button
                type="button"
                aria-label={t('catalog.grid')}
                onClick={() => setViewMode('grid')}
                className={`p-2 ${
                  viewMode === 'grid'
                    ? 'bg-[#22c55e] text-white'
                    : 'bg-white text-slate-500'
                }`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                aria-label={t('catalog.list')}
                onClick={() => setViewMode('list')}
                className={`p-2 ${
                  viewMode === 'list'
                    ? 'bg-[#22c55e] text-white'
                    : 'bg-white text-slate-500'
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>

          {pageItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#e5e7eb] bg-[#fafafa] px-4 py-16 text-center">
              <p className="text-[15px] font-semibold text-[#111827]">
                {t('catalog.empty')}
              </p>
              <p className="mt-1 text-[13px] text-[#6b7280]">
                {t('catalog.resetFilters')}
              </p>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4'
                  : 'grid grid-cols-1 sm:grid-cols-2 gap-3'
              }
            >
              {pageItems.map((p) => (
                <SearchProductCard
                  key={p.id}
                  product={p}
                  hrefBase={hrefBase}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav
              className="mt-8 flex items-center justify-center gap-1.5"
              aria-label={t('catalog.pages')}
            >
              <button
                type="button"
                aria-label={t('home.prev')}
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="grid h-9 w-9 place-items-center rounded-full border border-[#e5e7eb] text-slate-600 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              {pageButtons.map((item, idx) =>
                item === '…' ? (
                  <span
                    key={`e-${idx}`}
                    className="px-1 text-[13px] text-[#9ca3af]"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPage(item)}
                    className={`min-w-9 h-9 px-2 rounded-full text-[13px] font-semibold transition ${
                      item === currentPage
                        ? 'bg-[#22c55e] text-white'
                        : 'border border-[#e5e7eb] text-[#374151] hover:bg-[#f9fafb]'
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
              <button
                type="button"
                aria-label={t('home.next')}
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="grid h-9 w-9 place-items-center rounded-full border border-[#e5e7eb] text-slate-600 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </nav>
          )}
        </div>
      </div>

      {filterOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button
            type="button"
            aria-label={t('catalog.closeFilters')}
            className="absolute inset-0 bg-black/40"
            onClick={() => setFilterOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#eef2f6]">
              <p className="text-[15px] font-bold text-[#111827]">{t('catalog.filters')}</p>
              <button
                type="button"
                aria-label={t('nav.close')}
                onClick={() => setFilterOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">{filtersPanel}</div>
            <div className="p-4 border-t border-[#eef2f6]">
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="w-full rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold py-2.5 text-[14px]"
              >
                {t('catalog.apply')} · {filtered.length} {productWord(filtered.length)}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
