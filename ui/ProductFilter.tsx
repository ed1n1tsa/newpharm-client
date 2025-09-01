// ui/ProductFilter.tsx
"use client";

import type { Category } from "@/lib/mockData";
import { useMemo, useState } from "react";

type Props = {
  categories: Category[];
  active: string | null;
  onChange: (id: string | null) => void;
  onSearch?: (q: string) => void;
};

export default function ProductFilter({
  categories,
  active,
  onChange,
  onSearch,
}: Props) {
  const [priceFrom, setPriceFrom] = useState<string>("");
  const [priceTo, setPriceTo] = useState<string>("");

  const priceInfo = useMemo(() => {
    const from = priceFrom ? Number(priceFrom) : undefined;
    const to = priceTo ? Number(priceTo) : undefined;
    return { from, to };
  }, [priceFrom, priceTo]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 sticky top-4">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Фильтр</h3>

      {/* Поиск */}
      <label className="block text-sm mb-2 text-slate-600">Поиск</label>
      <input
        placeholder="Название товара…"
        onChange={(e) => onSearch?.(e.target.value)}
        className="mb-5 w-full rounded-xl border border-slate-200 px-4 py-2 focus:border-teal-500 outline-none"
      />

      {/* Категории */}
      <div className="mb-5">
        <p className="block text-sm mb-2 text-slate-600">Категории</p>
        <div className="flex flex-col gap-2">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              checked={active === null}
              onChange={() => onChange(null)}
            />
            <span>Все</span>
          </label>
          {categories.map((c) => (
            <label key={c.id} className="inline-flex items-center gap-2">
              <input
                type="radio"
                checked={active === c.id}
                onChange={() => onChange(c.id)}
              />
              <span>{c.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Цена */}
      <div>
        <p className="block text-sm mb-2 text-slate-600">Цена</p>
        <div className="flex items-center gap-2">
          <input
            inputMode="numeric"
            placeholder="От"
            value={priceFrom}
            onChange={(e) => setPriceFrom(e.target.value)}
            className="w-1/2 rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-teal-500"
          />
          <span className="text-slate-400">—</span>
          <input
            inputMode="numeric"
            placeholder="До"
            value={priceTo}
            onChange={(e) => setPriceTo(e.target.value)}
            className="w-1/2 rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-teal-500"
          />
        </div>

        {/* Подсказка-заглушка — реальную фильтрацию по цене можно легко добавить на уровне ProductList */}
        {priceInfo.from || priceInfo.to ? (
          <p className="text-xs text-slate-500 mt-2">
            Диапазон цены применится при подключении БД / фильтра на клиенте.
          </p>
        ) : null}
      </div>
    </div>
  );
}
