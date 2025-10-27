"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ProductCard from "./ProductCard"
import ProductFilter from "./ProductFilter"
import ProductToolbar from "./ProductToolbar"

type Product = {
  id: string
  name: string
  category: string
  price: number
  image_url: string
  short_desc?: string | null
  full_desc?: string | null
}

type Category = { id: string; name: string }

export default function ProductList({ categories, allProducts }: { categories: Category[]; allProducts: Product[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [filterOpen, setFilterOpen] = useState(false)
  const [sort, setSort] = useState("popular")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(9999999)

  // 🔹 Фильтрация и сортировка
  const filtered = useMemo(() => {
    let result = [...allProducts]

    if (activeCategory) {
      result = result.filter(
        (p) => p.category && p.category.toLowerCase().replace(/\s+/g, "-") === activeCategory
      )
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter((p) => p.name.toLowerCase().includes(q))
    }

    result = result.filter((p) => p.price >= minPrice && p.price <= maxPrice)

    switch (sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        result.sort((a, b) => b.price - a.price)
        break
    }

    return result
  }, [allProducts, activeCategory, search, sort, minPrice, maxPrice])

  return (
    <section className="container mx-auto px-4 mt-8">
      {/* 🔍 Поиск */}
      <div className="mb-6 flex items-center gap-2">
        <input
          placeholder="Поиск по названию товара..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-full border border-slate-200 px-5 py-3 outline-none focus:border-teal-500"
        />
        <button className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-teal-500 text-white">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </button>
      </div>

      {/* Заголовок */}
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">
          Лекарственные средства
        </h1>
      </div>

      <ProductToolbar
        total={filtered.length}
        sort={sort}
        onSortChange={setSort}
        viewMode={viewMode}
        onViewChange={setViewMode}
        onFilterOpen={() => setFilterOpen(true)}
      />

      {/* Фильтр offcanvas */}
      {filterOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
          <div className="bg-white w-full sm:w-[380px] p-6 h-full overflow-y-auto shadow-xl">
            <button
              onClick={() => setFilterOpen(false)}
              className="mb-4 text-slate-600 hover:text-black"
            >
              ✕ Закрыть
            </button>
            <h3 className="font-semibold mb-3 text-slate-800">Фильтр по цене</h3>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                className="w-1/2 border border-slate-300 rounded-md px-3 py-2 text-sm"
                placeholder="от"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-1/2 border border-slate-300 rounded-md px-3 py-2 text-sm"
                placeholder="до"
              />
            </div>
            <ProductFilter
              categories={categories}
              active={activeCategory}
              onChange={setActiveCategory}
              onSearch={setSearch}
            />
          </div>
        </div>
      )}

      {/* Сетка / список */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={`${activeCategory}-${search}-${viewMode}-${sort}-${minPrice}-${maxPrice}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35 }}
          className={
            viewMode === "grid"
              ? "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
              : "grid grid-cols-1 gap-4"
          }
        >
          {filtered.map((p, i) => (
            <ProductCard
              key={`${p.id}-${i}`}
              variant={viewMode === "list" ? "list" : "grid"}
              product={{
                id: p.id,
                title: p.name,
                price: p.price,
                image: p.image_url || "/images/product.png",
                description: p.short_desc || p.full_desc || "",
                category: p.category,
              }}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
