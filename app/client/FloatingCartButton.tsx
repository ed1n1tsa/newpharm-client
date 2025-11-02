/* eslint-disable @typescript-eslint/ban-ts-comment */


'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'

export default function FloatingCartButton() {
  const [count, setCount] = useState(0)

  // Функция, чтобы другие компоненты могли увеличить счётчик
  if (typeof window !== 'undefined') {
    // @ts-ignore
    window.incrementCartCount = () => setCount((c) => c + 1)
  }

  return (
    <Link
      href="/client/cart"
      className="cart-icon fixed bottom-24 right-6 z-50 bg-emerald-500 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center hover:bg-emerald-600 transition"
      aria-label="Корзина"
    >
      <ShoppingCart className="w-6 h-6" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full px-1.5 py-0.5 shadow-md">
          {count}
        </span>
      )}
    </Link>
  )
}
