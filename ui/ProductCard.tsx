"use client"

import { useRef, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { useCart } from "./CartContext"

type Variant = "grid" | "list"

type Props = {
  variant?: Variant
  product: {
    id: string
    title: string
    price: number
    image: string
    description?: string
    category?: string
  }
}

export default function ProductCard({ product, variant = "grid" }: Props) {
  const [fav, setFav] = useState(false)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const { add } = useCart()

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!product?.id) {
      console.error('ProductCard: missing product.id', product)
      return
    }
    try {
      setAdding(true)
      add({
        id: String(product.id),
        name: product.title,
        price: product.price,
        image_url: product.image,
      })
      flyToCart()
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch (err) {
      console.error('ProductCard add failed', err)
    } finally {
      setAdding(false)
    }
  }

  function flyToCart() {
    const img = imgRef.current
    if (!img) return

    const cartIcon = document.querySelector(".cart-icon") as HTMLElement
    if (!cartIcon) return

    const imgRect = img.getBoundingClientRect()
    const cartRect = cartIcon.getBoundingClientRect()

    const clone = img.cloneNode(true) as HTMLImageElement
    clone.style.position = "fixed"
    clone.style.left = imgRect.left + "px"
    clone.style.top = imgRect.top + "px"
    clone.style.width = imgRect.width + "px"
    clone.style.height = imgRect.height + "px"
    clone.style.transition = "all 0.8s cubic-bezier(0.4,0,0.2,1)"
    clone.style.zIndex = "9999"
    clone.style.borderRadius = "12px"
    document.body.appendChild(clone)

    requestAnimationFrame(() => {
      clone.style.left = cartRect.left + "px"
      clone.style.top = cartRect.top + "px"
      clone.style.width = "30px"
      clone.style.height = "30px"
      clone.style.opacity = "0.5"
    })

    setTimeout(() => clone.remove(), 900)
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35 }}
      className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition"
    >
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

      <Link href={`/client/products/${product.id}`}>
        <div className="aspect-[16/9] rounded-xl bg-slate-100 overflow-hidden mb-3">
          <img
            ref={imgRef}
            src={product.image}
            alt={product.title}
            className="h-full w-full object-contain transition-transform hover:scale-105 duration-300"
          />
        </div>
      </Link>

      <div className="mt-2 space-y-1">
        <div className="text-slate-900 font-bold text-base">
          {product.price.toLocaleString("ru-RU")} ₸
        </div>
        <Link
          href={`/client/products/${product.id}`}
          className="text-sm font-medium text-slate-800 hover:text-emerald-600 line-clamp-2"
        >
          {product.title}
        </Link>
      </div>

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
