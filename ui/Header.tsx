'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { FormEvent, useEffect, useState } from 'react'
import { ChevronDown, Heart, MapPin, Menu, Search, ShoppingCart, User, X } from 'lucide-react'
import { useCart } from './CartContext'
import { supabase } from '@/lib/supabase-browser'
import { useCity } from './CityProvider'

const NAV = [
  { href: '/', label: 'Главная' },
  { href: '/catalog', label: 'Каталог' },
  { href: '/doctors', label: 'Врачи' },
  { href: '/branches', label: 'Филиалы' },
  { href: '/#promos', label: 'Акции' },
  { href: '/#news', label: 'Новости' },
]

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { count } = useCart()
  const { city, cities, setCityId } = useCity()
  const isClientArea = pathname.startsWith('/client')
  const [q, setQ] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [cityOpen, setCityOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setLoggedIn(!!session?.user)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const catalogHref = loggedIn || isClientArea ? '/client/products' : '/catalog'
  const authHref = loggedIn ? '/client/profile' : '/login'
  const authLabel = loggedIn ? 'Профиль' : 'Войти'

  function onSearch(e: FormEvent) {
    e.preventDefault()
    const query = q.trim()
    setSearchOpen(false)
    if (!query) {
      router.push(catalogHref)
      return
    }
    router.push(
      loggedIn || isClientArea
        ? `/client/products?q=${encodeURIComponent(query)}`
        : `/catalog?q=${encodeURIComponent(query)}`
    )
  }

  function navHref(href: string) {
    if (href === '/catalog') return catalogHref
    return href
  }

  return (
    <header className="w-full bg-white sticky top-0 z-50 border-b border-[#f0f2f5]">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-12 md:h-14 flex items-center gap-2 md:gap-4 relative">
          <button
            type="button"
            className="lg:hidden p-1.5 -ml-1 text-slate-700 z-10"
            aria-label="Меню"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={20} />
          </button>

          <Link
            href="/"
            className="flex items-center gap-1.5 shrink-0 absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0"
          >
            <Image
              src="/logo.png"
              alt="NewPharm"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
            <span className="text-[15px] font-bold text-[#111827] tracking-tight">NewPharm</span>
          </Link>

          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setCityOpen((v) => !v)}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[13px] text-slate-700 hover:bg-emerald-50"
            >
              <MapPin size={13} className="text-emerald-600" />
              <span>{city.name}</span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>
            {cityOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40 cursor-default"
                  aria-label="Закрыть"
                  onClick={() => setCityOpen(false)}
                />
                <ul className="absolute left-0 top-full mt-1.5 z-50 min-w-[150px] rounded-xl border border-slate-100 bg-white py-1.5 shadow-lg">
                  {cities.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        className={`w-full px-3 py-1.5 text-left text-[13px] hover:bg-emerald-50 ${
                          c.id === city.id ? 'text-emerald-700 font-semibold' : 'text-slate-700'
                        }`}
                        onClick={() => {
                          setCityId(c.id)
                          setCityOpen(false)
                        }}
                      >
                        {c.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <nav className="hidden lg:flex items-center gap-0.5 text-[13px] font-medium text-slate-700 ml-1">
            {NAV.map((item) => {
              const href = navHref(item.href)
              const active =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.label}
                  href={href}
                  className={`px-2.5 py-1 rounded-full transition ${
                    active
                      ? 'bg-[#e8f8ee] text-[#166534]'
                      : 'hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-0.5 ml-auto text-slate-700">
            <button
              type="button"
              className="p-1.5 rounded-full hover:bg-emerald-50"
              aria-label="Поиск"
              onClick={() => setSearchOpen((v) => !v)}
            >
              <Search size={17} />
            </button>
            <Link
              href={authHref}
              className="p-1.5 rounded-full hover:bg-emerald-50"
              aria-label="Избранное"
            >
              <Heart size={17} />
            </Link>
            <Link
              href="/cart"
              className="cart-icon relative p-1.5 rounded-full hover:bg-emerald-50"
              aria-label="Корзина"
            >
              <ShoppingCart size={17} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>
            <Link
              href={authHref}
              className="hidden md:inline-flex items-center gap-1 ml-1 rounded-full px-2.5 py-1 text-[13px] hover:bg-emerald-50"
            >
              <User size={15} />
              {authLabel}
            </Link>
          </div>
        </div>

        <div className="sm:hidden pb-2.5">
          <button
            type="button"
            onClick={() => setCityOpen((v) => !v)}
            className="inline-flex items-center gap-1 rounded-full border border-[#d1fae5] px-2.5 py-1 text-[12px] text-[#166534]"
          >
            <MapPin size={12} className="text-emerald-600" />
            {city.name}
            <ChevronDown size={12} />
          </button>
          {cityOpen && (
            <ul className="mt-1.5 rounded-xl border border-slate-100 bg-white py-1.5 shadow-md">
              {cities.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className="w-full px-3 py-1.5 text-left text-[13px]"
                    onClick={() => {
                      setCityId(c.id)
                      setCityOpen(false)
                    }}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {searchOpen && (
          <form onSubmit={onSearch} className="pb-2.5" role="search">
            <div className="flex gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                autoFocus
                placeholder="Поиск лекарств, товаров, заболеваний…"
                className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[13px] outline-none focus:border-emerald-500 focus:bg-white"
              />
              <button
                type="submit"
                className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 text-[13px] font-semibold"
              >
                Найти
              </button>
            </div>
          </form>
        )}
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Закрыть меню"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[80%] max-w-xs bg-white shadow-xl p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-[#166534]">Меню</span>
              <button type="button" onClick={() => setMenuOpen(false)} aria-label="Закрыть">
                <X size={18} />
              </button>
            </div>
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={navHref(item.href)}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-[14px] text-slate-800 hover:bg-emerald-50"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={authHref}
              onClick={() => setMenuOpen(false)}
              className="mt-auto rounded-xl bg-emerald-500 text-white text-center py-2.5 font-semibold text-[14px]"
            >
              {authLabel}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
