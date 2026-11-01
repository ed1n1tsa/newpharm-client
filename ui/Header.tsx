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
    <header className="w-full bg-white/95 backdrop-blur sticky top-0 z-50 border-b border-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center gap-3 md:gap-5">
          <button
            type="button"
            className="lg:hidden p-2 -ml-2 text-slate-700"
            aria-label="Меню"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={22} />
          </button>

          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/logo.png"
              alt="NewPharm"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
            <span className="text-base font-bold text-emerald-600 tracking-tight">
              NewPharm
            </span>
          </Link>

          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setCityOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50/60 px-3 py-1.5 text-sm text-slate-700 hover:border-emerald-300"
            >
              <MapPin size={14} className="text-emerald-600" />
              <span>{city.name}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>
            {cityOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40 cursor-default"
                  aria-label="Закрыть"
                  onClick={() => setCityOpen(false)}
                />
                <ul className="absolute left-0 top-full mt-2 z-50 min-w-[160px] rounded-2xl border border-slate-100 bg-white py-2 shadow-lg">
                  {cities.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-emerald-50 ${
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

          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-700 ml-2">
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
                  className={`px-3 py-1.5 rounded-full transition ${
                    active
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto text-slate-700">
            <button
              type="button"
              className="p-2 rounded-full hover:bg-emerald-50"
              aria-label="Поиск"
              onClick={() => setSearchOpen((v) => !v)}
            >
              <Search size={18} />
            </button>
            <Link
              href={loggedIn ? '/client/profile' : '/login'}
              className="p-2 rounded-full hover:bg-emerald-50 hidden sm:inline-flex"
              aria-label="Избранное"
            >
              <Heart size={18} />
            </Link>
            <Link
              href="/cart"
              className="cart-icon relative p-2 rounded-full hover:bg-emerald-50"
              aria-label="Корзина"
            >
              <ShoppingCart size={18} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>
            <Link
              href={loggedIn ? '/client/profile' : '/login'}
              className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-emerald-100 px-3 py-1.5 text-sm hover:border-emerald-300 hover:text-emerald-700"
            >
              <User size={16} />
              {loggedIn ? 'Профиль' : 'Войти'}
            </Link>
          </div>
        </div>

        {/* mobile city chip */}
        <div className="sm:hidden pb-3">
          <button
            type="button"
            onClick={() => setCityOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 px-3 py-1 text-sm text-emerald-800"
          >
            <MapPin size={14} className="text-emerald-600" />
            {city.name}
            <ChevronDown size={14} />
          </button>
          {cityOpen && (
            <ul className="mt-2 rounded-2xl border border-slate-100 bg-white py-2 shadow-md">
              {cities.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className="w-full px-4 py-2 text-left text-sm"
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
          <form onSubmit={onSearch} className="pb-3" role="search">
            <div className="flex gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                autoFocus
                placeholder="Поиск лекарств, товаров, заболеваний…"
                className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white"
              />
              <button
                type="submit"
                className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white px-5 text-sm font-semibold"
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
          <div className="absolute left-0 top-0 h-full w-[80%] max-w-xs bg-white shadow-xl p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-emerald-600">Меню</span>
              <button type="button" onClick={() => setMenuOpen(false)} aria-label="Закрыть">
                <X size={20} />
              </button>
            </div>
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={navHref(item.href)}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-3 text-slate-800 hover:bg-emerald-50"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={loggedIn ? '/client/profile' : '/login'}
              onClick={() => setMenuOpen(false)}
              className="mt-auto rounded-xl bg-emerald-500 text-white text-center py-3 font-semibold"
            >
              {loggedIn ? 'Профиль' : 'Войти'}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
