"use client"

import { SlidersHorizontal, LayoutGrid, List } from "lucide-react"

type Props = {
  total: number
  sort: string
  onSortChange: (v: string) => void
  viewMode: "grid" | "list"
  onViewChange: (v: "grid" | "list") => void
  onFilterOpen: () => void
}

export default function ProductToolbar({
  total,
  sort,
  onSortChange,
  viewMode,
  onViewChange,
  onFilterOpen,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div className="text-sm text-slate-600">
        Найдено: <span className="font-semibold text-slate-800">{total}</span> товаров
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onFilterOpen}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm flex items-center gap-2 hover:bg-slate-50 transition"
        >
          <SlidersHorizontal className="size-4" /> Фильтры
        </button>

        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-teal-500"
        >
          <option value="popular">по популярности</option>
          <option value="price-asc">по цене ↑</option>
          <option value="price-desc">по цене ↓</option>
        </select>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewChange("grid")}
            className={`p-2 border rounded-md transition ${
              viewMode === "grid" ? "bg-slate-100 border-slate-400" : "hover:bg-slate-50"
            }`}
            title="Плитка"
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            onClick={() => onViewChange("list")}
            className={`p-2 border rounded-md transition ${
              viewMode === "list" ? "bg-slate-100 border-slate-400" : "hover:bg-slate-50"
            }`}
            title="Список"
          >
            <List className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
