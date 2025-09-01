// ui/ProductList.tsx
"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Category, Product } from "@/lib/mockData";
import ProductCard from "./ProductCard";
import ProductFilter from "./ProductFilter";

type Props = {
  categories: Category[];
  allProducts: Product[];
};

export default function ProductList({ categories, allProducts }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const byCat = activeCategory
      ? allProducts.filter((p) => p.categoryId === activeCategory)
      : allProducts;

    const bySearch = search.trim()
      ? byCat.filter((p) =>
          p.title.toLowerCase().includes(search.trim().toLowerCase())
        )
      : byCat;

    // На странице каталога показываем по 6 шт на категорию (как в ТЗ).
    if (!activeCategory) {
      const map = new Map<string, number>();
      return bySearch.filter((p) => {
        const used = map.get(p.categoryId) || 0;
        if (used >= 6) return false;
        map.set(p.categoryId, used + 1);
        return true;
      });
    }
    return bySearch;
  }, [activeCategory, allProducts, search]);

  return (
    <section className="container mx-auto px-4 mt-8">
      {/* Только на мобильном — быстрый фильтр */}
      <div className="md:hidden mb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button
            className={`shrink-0 rounded-full border px-4 py-2 text-sm ${
              activeCategory === null
                ? "bg-teal-500 text-white border-teal-500"
                : "border-slate-200 text-slate-700"
            }`}
            onClick={() => setActiveCategory(null)}
          >
            Все категории
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm ${
                activeCategory === c.id
                  ? "bg-teal-500 text-white border-teal-500"
                  : "border-slate-200 text-slate-700"
              }`}
              onClick={() => setActiveCategory(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Мобильный поиск */}
        <input
          placeholder="Поиск…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-2 focus:border-teal-500 outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
        {/* Левый фильтр (десктоп) */}
        <aside className="hidden md:block">
          <ProductFilter
            categories={categories}
            active={activeCategory}
            onChange={setActiveCategory}
            onSearch={setSearch}
          />
        </aside>

        {/* Сетка карточек */}
        <div>
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`${activeCategory ?? "all"}-${search}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
            >
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
