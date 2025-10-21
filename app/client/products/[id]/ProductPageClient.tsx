"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { supabase } from "@/lib/supabase-browser"
import ReactMarkdown from "react-markdown"

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

  async function handleAddToCart() {
    try {
      setAdding(true)
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user

      if (!user) {
        alert("Для добавления в корзину необходимо войти в аккаунт.")
        window.location.href = "/login"
        return
      }

      let { data: cart } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (!cart) {
        const { data: newCart, error: createError } = await supabase
          .from("carts")
          .insert({ user_id: user.id })
          .select()
          .single()
        if (createError) throw createError
        cart = newCart
      }

      const { error } = await supabase.from("cart_items").insert({
        cart_id: cart!.id,
        product_id: product.id,
        quantity: 1,
        price: product.price,
      })

      if (error) throw error
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch (err: any) {
      console.error("Ошибка добавления:", err.message)
      alert("Ошибка при добавлении в корзину.")
    } finally {
      setAdding(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Фото */}
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

          {/* Описание */}
          <div className="flex-1 space-y-4">
            <Link
              href="/client/products"
              className="text-sm text-gray-500 hover:text-emerald-600 transition"
            >
              ← Назад в аптеку
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
          </div>
        </div>
      </section>
    </main>
  )
}
