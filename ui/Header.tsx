'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { FormEvent, useState } from 'react'
import { Search, ShoppingCart, User } from 'lucide-react'
import { useCart } from './CartContext'
import { supabase } from '@/lib/supabase-browser'
import { useEffect } from 'react'

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { count } = useCart()
  const isClientArea = pathname.startsWith('/client')
  const [q, setQ] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setLoggedIn(!!session?.user)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  function onSearch(e: FormEvent) {
    e.preventDefault()
    const query = q.trim()
    if (!query) {
      router.push('/catalog')
      return
    }
    router.push(`/catalog?q=${encodeURIComponent(query)}`)
  }

  return (
    <header className="w-full border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3 md:gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo.png"
            alt="NewPharm"
            width={40}
            height={40}
            className="object-contain"
            priority
          />
          <span className="text-sm font-semibold text-emerald-700 tracking-wide whitespace-nowrap">
            NewPharm
          </span>
        </Link>

        <form
          onSubmit={onSearch}
          className="hidden sm:flex flex-1 max-w-xl items-center gap-2"
          role="search"
        >
          <div className="relative w-full">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Поиск лекарств и товаров…"
              className="w-full rounded-full border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-sm outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            className="shrink-0 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-medium"
          >
            Найти
          </button>
        </form>

        <nav className="hidden lg:flex gap-5 text-sm font-medium text-black ml-auto">
          {isClientArea ? (
            <>
              <Link href="/catalog" className="hover:text-emerald-600 transition">Каталог</Link>
              <Link href="/cart" className="hover:text-emerald-600 transition">Корзина</Link>
              <Link href="/client/orders" className="hover:text-emerald-600 transition">Мои заказы</Link>
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

        <div className="flex gap-3 text-sm font-medium text-black items-center ml-auto lg:ml-0">
          <Link
            href="/cart"
            className="cart-icon relative inline-flex items-center justify-center rounded-full border border-slate-200 p-2 hover:border-emerald-500 hover:text-emerald-600 transition"
            aria-label="Корзина"
          >
            <ShoppingCart size={18} />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </Link>

          <Link
            href={loggedIn ? '/client/profile' : '/login'}
            className="inline-flex items-center gap-1.5 hover:text-emerald-600 transition"
          >
            <User size={18} />
            <span className="hidden md:inline">{loggedIn ? 'Профиль' : 'Вход'}</span>
          </Link>
        </div>
      </div>

      {/* Mobile search under header bar */}
      <form
        onSubmit={onSearch}
        className="sm:hidden px-4 pb-3"
        role="search"
      >
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск лекарств…"
            className="w-full rounded-full border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-sm outline-none focus:border-emerald-500"
          />
        </div>
      </form>
    </header>
  )
}
