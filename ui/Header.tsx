'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

export default function Header() {
  const pathname = usePathname()
  const isClientArea = pathname.startsWith('/client')

  return (
    <header className="w-full border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* 🔰 Логотип */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logoNew.png"
            alt="Нью-Фарм логотип"
            width={40}  // 🔧 можно увеличить
            height={40}
            className="rounded-md object-contain"
            priority
          />
          <span className="text-sm font-semibold text-green-600 tracking-wide whitespace-nowrap">
            НЬЮ - ФАРМ
          </span>
        </Link>

        {/* 🔗 Навигация */}
        <nav className="hidden md:flex gap-6 text-sm font-medium text-black">
          {isClientArea ? (
            <>
              <Link href="/client" className="hover:text-emerald-600 transition">Каталог</Link>
              <Link href="/client/cart" className="hover:text-emerald-600 transition">Корзина</Link>
              <Link href="/client/orders" className="hover:text-emerald-600 transition">Мои заказы</Link>
              <Link href="/client/profile" className="hover:text-emerald-600 transition">Профиль</Link>
            </>
          ) : (
            <>
              <Link href="/" className="hover:text-emerald-600 transition">Главная</Link>
              <Link href="/catalog" className="hover:text-emerald-600 transition">Каталог</Link>
              <Link href="/doctors" className="hover:text-emerald-600 transition">Врачи</Link>
              <Link href="/branches" className="hover:text-emerald-600 transition">Филиалы</Link>
            </>
          )}
        </nav>

        {/* 🌐 Язык и вход/профиль */}
        <div className="flex gap-4 text-sm font-medium text-black items-center">
          <button className="hover:text-emerald-600 transition">RU</button>

          {isClientArea ? (
            <Link
              href="/client/profile"
              className="hover:text-emerald-600 transition"
            >
              Профиль
            </Link>
          ) : (
            <Link
              href="/login"
              className="hover:text-emerald-600 transition"
            >
              Вход
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
