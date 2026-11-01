"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { useCart } from "@/ui/CartContext"

type Product = {
  id: string
  name: string
  full_desc?: string
  short_desc?: string
  price: number
  image_url?: string
  category?: string
  stock?: number
}

export default function ProductPageClient({ product }: { product: Product }) {
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const { add } = useCart()

  async function handleAddToCart() {
    try {
      setAdding(true)
      add({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
      })
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } finally {
      setAdding(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-10">
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-[280px] h-[280px] md:w-[340px] md:h-[340px] bg-gray-50 rounded-2xl overflow-hidden">
              <Image
                src={product.image_url || "/images/product.png"}
                alt={product.name}
                fill
                className="object-contain p-4"
              />
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <Link
              href="/catalog"
              className="text-sm text-gray-500 hover:text-emerald-600 transition"
            >
              ← Назад в каталог
            </Link>

            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-sm text-gray-500">Категория: {product.category}</p>

            <div className="prose prose-sm sm:prose-base text-gray-800 max-w-none leading-relaxed">
              <ReactMarkdown>
                {product.full_desc || product.short_desc || "Описание временно отсутствует."}
              </ReactMarkdown>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <p className="text-2xl font-bold text-emerald-600">
                  {product.price?.toLocaleString("ru-RU")} ₸
                </p>
                <p className="text-sm text-gray-500">
                  {product.stock && product.stock > 0 ? "В наличии" : "Нет в наличии"}
                </p>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding}
                type="button"
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-white font-medium transition ${
                  added
                    ? "bg-emerald-600"
                    : adding
                    ? "bg-gray-400"
                    : "bg-emerald-500 hover:bg-emerald-600"
                }`}
              >
                <ShoppingCart size={18} />
                {added ? "Добавлено!" : adding ? "Добавление..." : "Добавить в корзину"}
              </button>
            </div>

            <Link
              href="/cart"
              className="inline-block text-sm text-emerald-600 hover:underline"
            >
              Перейти в корзину →
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
