"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { supabase } from "@/lib/supabase-browser"

type Props = {
  product: {
    id: string
    title: string
    price: number
    image: string
    description?: string
    category?: string
  }
}

export default function ProductCard({ product }: Props) {
  const [fav, setFav] = useState(false)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  async function handleAddToCart() {
    try {
      setAdding(true)
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) {
        alert("Для добавления в корзину необходимо войти в аккаунт")
        window.location.href = "/login"
        return
      }

      // Получаем корзину пользователя (или создаем новую)
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

      // Проверяем, есть ли уже этот товар в корзине
      const { data: existing } = await supabase
  .from("cart_items")
  .select("id, quantity")
  .eq("cart_id", cart!.id) // ✅ добавили "!"
  .eq("product_id", product.id)
  .maybeSingle()


      if (existing) {
        // 🔹 Если товар уже есть — увеличиваем количество
        const newQty = existing.quantity + 1
        await supabase
          .from("cart_items")
          .update({
            quantity: newQty,
          })
          .eq("id", existing.id)
      } else {
        // 🔹 Если товара нет — добавляем новый
        const { error } = await supabase.from("cart_items").insert({
          cart_id: cart!.id,
          product_id: product.id,
          quantity: 1,
          price: product.price,
        })
        if (error) throw error
      }

      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch (err: any) {
      console.error("Ошибка добавления в корзину:", err.message)
      alert("Ошибка при добавлении в корзину.")
    } finally {
      setAdding(false)
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35 }}
      className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition"
    >
      {/* ❤️ Избранное */}
      <button
        aria-label="В избранное"
        onClick={() => setFav(!fav)}
        className={`absolute right-3 top-3 grid place-items-center rounded-full border p-2 transition ${
          fav
            ? "border-emerald-500 bg-emerald-50"
            : "border-slate-200 bg-white/70 hover:bg-white"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="size-5"
          fill={fav ? "#10B981" : "none"}
          stroke={fav ? "#10B981" : "currentColor"}
          strokeWidth="2"
        >
          <path d="M20.8 11.6c0 4.1-8.8 9.2-8.8 9.2S3.2 15.7 3.2 11.6C3.2 8.4 5.8 6 8.6 6c1.7 0 3.2.9 3.4 2.5C12.2 6.9 13.7 6 15.4 6c2.8 0 5.4 2.4 5.4 5.6Z" />
        </svg>
      </button>

      {/* 🖼 Фото */}
      <Link href={`/client/products/${product.id}`}>
        <div className="aspect-[16/9] rounded-xl bg-slate-100 overflow-hidden mb-3">
          <img
            src={product.image}
            alt={product.title}
            className="h-full w-full object-contain transition-transform hover:scale-105 duration-300"
          />
        </div>
      </Link>

      {/* 🧾 Инфо */}
      <div className="space-y-1">
        <div className="text-slate-900 font-bold">{product.price.toLocaleString("ru-RU")} ₸</div>
        <Link
          href={`/client/products/${product.id}`}
          className="text-sm text-slate-800 line-clamp-2 hover:text-emerald-600"
        >
          {product.title}
        </Link>
      </div>

      {/* 🛒 Кнопка */}
      <button
        disabled={adding}
        onClick={handleAddToCart}
        className={`mt-4 w-full rounded-full px-5 py-2.5 text-white font-semibold transition inline-flex items-center justify-center gap-2 ${
          added
            ? "bg-emerald-600"
            : adding
            ? "bg-gray-400"
            : "bg-emerald-500 hover:bg-emerald-600"
        }`}
      >
        <ShoppingCart className="size-5" />
        {added ? "Добавлено!" : adding ? "Добавление..." : "В корзину"}
      </button>
    </motion.article>
  )
}
