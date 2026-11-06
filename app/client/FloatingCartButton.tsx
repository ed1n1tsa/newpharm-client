'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/ui/CartContext'

export default function FloatingCartButton() {
  const { count } = useCart()

  return (
    <Link
      href="/cart"
      className="cart-icon fixed bottom-24 right-6 z-50 bg-emerald-500 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center hover:bg-emerald-600 transition"
      aria-label="Корзина"
    >
      <ShoppingCart className="w-6 h-6" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full px-1.5 py-0.5 shadow-md">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
