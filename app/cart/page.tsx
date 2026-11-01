'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { useCart } from '@/ui/CartContext'

export default function PublicCartPage() {
  const { items, total, setQty, remove, ready } = useCart()

  if (!ready) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-500">
        Загрузка корзины…
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <section className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <ShoppingCart className="w-12 h-12 mb-4 text-gray-400" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Корзина пуста</h1>
        <p className="text-slate-500 mb-6">Добавьте товары из каталога</p>
        <Link
          href="/catalog"
          className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 font-semibold"
        >
          В каталог
        </Link>
      </section>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 pb-28 md:pb-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Корзина</h1>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
              <Image
                src={item.image_url || '/images/product.png'}
                alt={item.name}
                width={80}
                height={80}
                className="object-contain w-full h-full"
              />
            </div>
            <div className="flex-1 min-w-0">
              <Link
                href={`/client/products/${item.productId}`}
                className="font-medium text-slate-900 hover:text-emerald-600 line-clamp-2"
              >
                {item.name}
              </Link>
              <p className="text-sm text-gray-500 mt-0.5">
                {(item.price ?? 0).toLocaleString('ru-RU')} ₸
              </p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setQty(item.productId, item.qty - 1)}
                  className="p-1 rounded border border-gray-300"
                  aria-label="Уменьшить"
                >
                  <Minus size={14} />
                </button>
                <span className="min-w-[24px] text-center">{item.qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(item.productId, item.qty + 1)}
                  className="p-1 rounded border border-gray-300"
                  aria-label="Увеличить"
                >
                  <Plus size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(item.productId)}
                  className="ml-3 text-red-500 text-sm inline-flex items-center gap-1"
                >
                  <Trash2 size={14} /> Удалить
                </button>
              </div>
            </div>
            <p className="font-semibold text-emerald-600 shrink-0">
              {((item.price ?? 0) * item.qty).toLocaleString('ru-RU')} ₸
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-xl font-bold text-emerald-700">
          Итого: {total.toLocaleString('ru-RU')} ₸
        </p>
        <Link
          href="/checkout"
          className="inline-flex justify-center rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 font-semibold"
        >
          Оформить заказ
        </Link>
      </div>
    </main>
  )
}
