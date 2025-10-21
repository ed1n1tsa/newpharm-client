'use client'
import { useState, useMemo } from 'react'

type Product = {
  id: string | number
  name: string
  category?: string
  price?: number
  stock?: number
  image_url?: string
}

type Props = {
  products: Product[]
  categories: string[]
}

export default function ProductsTable({ products, categories }: Props) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Все')

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchName = p.name?.toLowerCase().includes(search.toLowerCase())
      const matchCategory =
        category === 'Все' ||
        p.category === category ||
        (!p.category && category === 'Без категории')
      return matchName && matchCategory
    })
  }, [products, search, category])

  return (
    <div className="bg-white border rounded-xl shadow-sm p-5">
      {/* 🔍 Панель поиска и фильтра */}
      <div className="flex flex-col md:flex-row justify-between gap-3 mb-5">
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option>Все</option>
          {categories.map((c, i) => (
            <option key={i}>{c}</option>
          ))}
        </select>
      </div>

      {/* 🧩 ПК-версия — таблица */}
      <div className="hidden md:block overflow-x-auto rounded-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100 border-b">
            <tr className="text-left text-gray-600 text-sm font-medium">
              <th className="p-3 w-14">#</th>
              <th className="p-3">Название</th>
              <th className="p-3">Категория</th>
              <th className="p-3 text-right">Цена</th>
              <th className="p-3 text-right">Остаток</th>
              <th className="p-3 text-center">Фото</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length > 0 ? (
              filtered.map((p, i) => (
                <tr
                  key={p.id}
                  className="border-b hover:bg-teal-50 transition text-sm"
                >
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3 font-medium text-gray-800">{p.name}</td>
                  <td className="p-3">{p.category || '—'}</td>
                  <td className="p-3 text-right font-semibold">
                    {p.price?.toLocaleString() ?? '—'} ₸
                  </td>
                  <td className="p-3 text-right">{p.stock ?? 0}</td>
                  <td className="p-3 text-center">
                    <img
                      src={p.image_url || '/images/product.png'}
                      alt={p.name}
                      className="w-12 h-12 object-contain mx-auto rounded"
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center text-gray-400 py-8 text-sm"
                >
                  Нет товаров для отображения
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 📱 Мобильная версия — карточки */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {filtered.length > 0 ? (
          filtered.map((p, i) => (
            <div
              key={p.id}
              className="border rounded-lg p-4 flex items-center gap-4 shadow-sm"
            >
              <img
                src={p.image_url || '/images/product.png'}
                alt={p.name}
                className="w-16 h-16 object-cover rounded-md"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 text-sm mb-1">
                  {i + 1}. {p.name}
                </h3>
                <p className="text-xs text-gray-500 mb-1">
                  {p.category || 'Без категории'}
                </p>
                <p className="text-sm font-medium text-teal-600">
                  {p.price?.toLocaleString() ?? '—'} ₸
                </p>
              </div>
              <div className="text-xs text-gray-600">{p.stock ?? 0} шт</div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 text-sm">
            Нет товаров для отображения
          </p>
        )}
      </div>
    </div>
  )
}
