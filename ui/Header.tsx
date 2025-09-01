'use client'

import Link from 'next/link'

export default function Header() {
  return (
    <header className="w-full border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Логотип */}
        <div className="text-sm font-semibold text-green-600 tracking-wide whitespace-nowrap">
          НЬЮ - ФАРМ
        </div>

        {/* Навигация */}
        <nav className="hidden md:flex gap-6 text-sm font-medium text-black">
          <Link href="/" className="hover:text-emerald-600 transition">Главная</Link>
          <Link href="/catalog" className="hover:text-emerald-600 transition">Каталог</Link>
          <Link href="/cart" className="hover:text-emerald-600 transition">Корзина</Link>
          <Link href="/doctors" className="hover:text-emerald-600 transition">Врачи</Link>
          <Link href="/branches" className="hover:text-emerald-600 transition">Филиалы</Link>
        </nav>

        {/* Язык и вход */}
        <div className="flex gap-4 text-sm font-medium text-black items-center">
          <button className="hover:text-emerald-600 transition">RU</button>
          <Link
            href="/login"
            className="hover:text-emerald-600 transition"
          >
            Вход
          </Link>
        </div>
      </div>
    </header>
  )
}
