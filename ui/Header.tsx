'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useEffect, useState, type ComponentType } from 'react'
import { createPortal } from 'react-dom'
import {
  ChevronDown,
  ChevronRight,
  Heart,
  HelpCircle,
  Home,
  Info,
  LayoutGrid,
  MapPin,
  Menu,
  Newspaper,
  Package,
  Phone,
  ShoppingCart,
  Stethoscope,
  Tag,
  User,
  X,
} from 'lucide-react'
import { useCart } from './CartContext'
import { useAuth } from './AuthContext'
import { supabase } from '@/lib/supabase-browser'
import { useCity } from './CityProvider'
import { HOME_CATEGORIES } from './home/HomeCategories'
import { useT } from '@/ui/LocaleProvider'
import LanguageSwitcher from '@/ui/LanguageSwitcher'

const DESKTOP_NAV = [
  { href: '/', key: 'nav.home' },
  { href: '/catalog', key: 'nav.catalog' },
  { href: '/doctors', key: 'nav.doctors' },
  { href: '/branches', key: 'nav.branches' },
  { href: '/#promos', key: 'nav.promos' },
  { href: '/#news', key: 'nav.news' },
] as const

type DrawerItem = {
  href: string
  label: string
  icon: ComponentType<{ size?: number; className?: string }>
  badge?: number
  chevron?: boolean
  activeMatch?: string
}

export default function Header() {
  const pathname = usePathname()
  const { count } = useCart()
  const { openAuth } = useAuth()
  const { city, cities, setCityId } = useCity()
  const t = useT()
  const [loggedIn, setLoggedIn] = useState(false)
  const [cityOpen, setCityOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [drawerCityOpen, setDrawerCityOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setLoggedIn(!!session?.user)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.body.classList.add('np-drawer-open')
    return () => {
      document.body.style.overflow = prev
      document.body.classList.remove('np-drawer-open')
    }
  }, [menuOpen])

  useEffect(() => {
    setMenuOpen(false)
    setCatalogOpen(false)
    setDrawerCityOpen(false)
  }, [pathname])

  // Public guest chrome always uses public routes (even when logged in)
  const catalogHref = '/catalog'
  const authHref = loggedIn ? '/profile' : '#'
  const authLabel = loggedIn ? t('nav.profile') : t('nav.login')
  const ordersHref = loggedIn ? '/orders' : '#'
  const favoritesHref = loggedIn ? '/profile' : '#'

  function requireAuth(e?: React.MouseEvent) {
    e?.preventDefault()
    setMenuOpen(false)
    openAuth('login')
  }

  function navHref(href: string) {
    if (href === '/catalog') return catalogHref
    return href
  }

  function isActive(href: string, activeMatch?: string) {
    const match = activeMatch || href.split('#')[0] || '/'
    if (match === '/') return pathname === '/'
    return pathname === match || pathname.startsWith(match + '/')
  }

  const mainNav: DrawerItem[] = [
    { href: '/', label: t('nav.home'), icon: Home },
    {
      href: catalogHref,
      label: t('nav.catalogProducts'),
      icon: LayoutGrid,
      chevron: true,
      activeMatch: '/catalog',
    },
    { href: '/doctors', label: t('nav.doctorsConsult'), icon: Stethoscope },
    { href: '/branches', label: t('nav.branchesPharmacies'), icon: MapPin },
    { href: '/#promos', label: t('nav.promos'), icon: Tag, activeMatch: '/__none__' },
    { href: '/#news', label: t('nav.news'), icon: Newspaper, activeMatch: '/__none__' },
  ]

  const accountNav: DrawerItem[] = [
    { href: favoritesHref, label: t('nav.favorites'), icon: Heart },
    { href: '/cart', label: t('nav.cart'), icon: ShoppingCart, badge: count },
    { href: ordersHref, label: t('nav.orders'), icon: Package },
  ]

  const infoNav: DrawerItem[] = [
    { href: '/#faq', label: t('nav.helpFaq'), icon: HelpCircle },
    { href: '/branches', label: t('nav.contacts'), icon: Phone, activeMatch: '/__none__' },
    { href: '/', label: t('nav.about'), icon: Info, activeMatch: '/__none__' },
  ]

  function DrawerLink({
    item,
    onClick,
  }: {
    item: DrawerItem
    onClick?: () => void
  }) {
    const Icon = item.icon
    const needsAuth = !loggedIn && (item.href === '#' || item.href === '/login')
    const active = !needsAuth && isActive(item.href, item.activeMatch)
    const className = `relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[14px] transition ${
      active
        ? 'bg-[#e8f8ee] text-[#166534] font-semibold'
        : 'text-[#111827] hover:bg-slate-50'
    }`
    const inner = (
      <>
        <Icon size={18} className={active ? 'text-[#16a34a]' : 'text-slate-500'} />
        <span className="flex-1 min-w-0 text-left">{item.label}</span>
        {typeof item.badge === 'number' && item.badge > 0 && (
          <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#22c55e] text-white text-[11px] font-bold flex items-center justify-center">
            {item.badge > 99 ? '99+' : item.badge}
          </span>
        )}
      </>
    )
    if (needsAuth) {
      return (
        <button
          type="button"
          onClick={() => {
            onClick?.()
            requireAuth()
          }}
          className={`w-full ${className}`}
        >
          {inner}
        </button>
      )
    }
    return (
      <Link href={item.href} onClick={onClick} className={className}>
        {inner}
        {item.chevron && <ChevronRight size={16} className="text-slate-400" />}
      </Link>
    )
  }

  const drawer =
    menuOpen &&
    typeof document !== 'undefined' &&
    createPortal(
      <div className="fixed inset-0 z-[1200] lg:hidden">
        <button
          type="button"
          className="absolute inset-0 bg-black/40"
          aria-label={t('nav.closeMenu')}
          onClick={() => setMenuOpen(false)}
        />
        {/* z-[1200] keeps drawer above Leaflet panes/controls (~400–1000) */}
        <aside className="absolute left-0 top-0 h-full w-[86%] max-w-[340px] bg-white shadow-2xl flex flex-col isolate">
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2"
            >
              <Image
                src="/logo.png"
                alt="NewPharm"
                width={30}
                height={30}
                className="object-contain"
              />
              <span className="text-[16px] font-bold text-[#16a34a]">NewPharm</span>
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label={t('nav.close')}
              className="grid place-items-center h-9 w-9 rounded-full bg-slate-100 text-slate-600"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-4">
            {!loggedIn && (
              <div className="mb-3 rounded-2xl bg-[#e8f8ee] px-3.5 py-3.5">
                <div className="flex items-start gap-2.5">
                  <span className="grid place-items-center h-9 w-9 rounded-full bg-white text-[#16a34a] shrink-0">
                    <User size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold text-[#111827]">{t('nav.loginTitle')}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-[#6b7280]">
                      {t('nav.loginHint')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => requireAuth()}
                  className="mt-3 w-full flex items-center justify-center rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-white text-[13px] font-semibold py-2.5 transition"
                >
                  {t('nav.login')}
                </button>
              </div>
            )}

            {loggedIn && (
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="mb-3 flex items-center gap-2.5 rounded-2xl bg-[#e8f8ee] px-3.5 py-3"
              >
                <span className="grid place-items-center h-9 w-9 rounded-full bg-white text-[#16a34a]">
                  <User size={18} />
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-[#111827]">{t('nav.myProfile')}</p>
                  <p className="text-[11px] text-[#6b7280]">{t('nav.profileHint')}</p>
                </div>
                <ChevronRight size={16} className="ml-auto text-slate-400" />
              </Link>
            )}

            <nav className="space-y-0.5">
              {mainNav.map((item) => {
                if (item.chevron) {
                  const Icon = item.icon
                  const active = isActive(item.href, item.activeMatch)
                  return (
                    <div key={item.href}>
                      <button
                        type="button"
                        onClick={() => setCatalogOpen((v) => !v)}
                        className={`w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[14px] transition ${
                          active
                            ? 'bg-[#e8f8ee] text-[#166534] font-semibold'
                            : 'text-[#111827] hover:bg-slate-50'
                        }`}
                      >
                        <Icon size={18} className={active ? 'text-[#16a34a]' : 'text-slate-500'} />
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronRight
                          size={16}
                          className={`text-slate-400 transition ${catalogOpen ? 'rotate-90' : ''}`}
                        />
                      </button>
                      {catalogOpen && (
                        <div className="ml-4 mt-0.5 mb-1 space-y-0.5 border-l border-[#e8f8ee] pl-2">
                          <Link
                            href={catalogHref}
                            onClick={() => setMenuOpen(false)}
                            className="block rounded-xl px-3 py-2 text-[13px] text-slate-700 hover:bg-emerald-50"
                          >
                            {t('nav.allProducts')}
                          </Link>
                          {HOME_CATEGORIES.map((c) => (
                            <Link
                              key={c.key}
                              href={c.href}
                              onClick={() => setMenuOpen(false)}
                              className="block rounded-xl px-3 py-2 text-[13px] text-slate-700 hover:bg-emerald-50"
                            >
                              {t('home.cat.' + c.key)}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }
                return (
                  <DrawerLink
                    key={item.href + item.label}
                    item={item}
                    onClick={() => setMenuOpen(false)}
                  />
                )
              })}
            </nav>

            <div className="my-3 h-px bg-[#eef2f6]" />

            <nav className="space-y-0.5">
              {accountNav.map((item) => (
                <DrawerLink
                  key={item.href + item.label}
                  item={item}
                  onClick={() => setMenuOpen(false)}
                />
              ))}
            </nav>

            <div className="my-3 h-px bg-[#eef2f6]" />

            <nav className="space-y-0.5">
              {infoNav.map((item) => (
                <DrawerLink
                  key={item.href + item.label}
                  item={item}
                  onClick={() => setMenuOpen(false)}
                />
              ))}
            </nav>
          </div>

          <div className="border-t border-[#eef2f6] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] space-y-2">
            <LanguageSwitcher variant="pill" className="w-full justify-center" />
            <div className="relative">
              <button
                type="button"
                onClick={() => setDrawerCityOpen((v) => !v)}
                className="w-full inline-flex items-center gap-2 rounded-full border border-[#d1fae5] bg-[#f0fdf4] px-3.5 py-2.5 text-[13px] text-[#166534]"
              >
                <MapPin size={14} className="text-[#16a34a]" />
                <span className="flex-1 text-left font-medium">{city.name}</span>
                <ChevronDown size={14} className={drawerCityOpen ? 'rotate-180' : ''} />
              </button>
              {drawerCityOpen && (
                <ul className="absolute bottom-full left-0 right-0 mb-1.5 max-h-48 overflow-y-auto rounded-2xl border border-slate-100 bg-white py-1.5 shadow-lg">
                  {cities.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        className={`w-full px-3.5 py-2 text-left text-[13px] hover:bg-emerald-50 ${
                          c.id === city.id ? 'text-emerald-700 font-semibold' : 'text-slate-700'
                        }`}
                        onClick={() => {
                          setCityId(c.id)
                          setDrawerCityOpen(false)
                        }}
                      >
                        {c.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </aside>
      </div>,
      document.body
    )

  return (
    <header className="w-full bg-white sticky top-0 z-50 border-b border-[#f0f2f5]">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-12 md:h-14 flex items-center gap-2 md:gap-4 relative">
          <button
            type="button"
            className="lg:hidden p-1.5 -ml-1 text-slate-700 z-10"
            aria-label={t('nav.menu')}
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

          <div className="relative hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCityOpen((v) => !v)}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[13px] text-slate-700 hover:bg-emerald-50"
            >
              <MapPin size={13} className="text-emerald-600" />
              <span>{city.name}</span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>
            <LanguageSwitcher />
            {cityOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40 cursor-default"
                  aria-label={t('nav.close')}
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
            {DESKTOP_NAV.map((item) => {
              const href = navHref(item.href)
              const label = t(item.key)
              const active =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.key}
                  href={href}
                  className={`px-2.5 py-1 rounded-full transition ${
                    active
                      ? 'bg-[#e8f8ee] text-[#166534]'
                      : 'hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-0.5 ml-auto text-slate-700">
            {loggedIn ? (
              <Link
                href={favoritesHref}
                className="p-1.5 rounded-full hover:bg-emerald-50"
                aria-label={t('nav.favoritesAria')}
              >
                <Heart size={17} />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openAuth('login')}
                className="p-1.5 rounded-full hover:bg-emerald-50"
                aria-label={t('nav.favoritesAria')}
              >
                <Heart size={17} />
              </button>
            )}
            <Link
              href="/cart"
              className="cart-icon relative p-1.5 rounded-full hover:bg-emerald-50"
              aria-label={t('nav.cartAria')}
            >
              <ShoppingCart size={17} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>
            {loggedIn ? (
              <Link
                href={authHref}
                className="hidden md:inline-flex items-center gap-1 ml-1 rounded-full px-2.5 py-1 text-[13px] hover:bg-emerald-50"
              >
                <User size={15} />
                {authLabel}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openAuth('login')}
                className="hidden md:inline-flex items-center gap-1 ml-1 rounded-full px-2.5 py-1 text-[13px] hover:bg-emerald-50"
              >
                <User size={15} />
                {t('nav.login')}
              </button>
            )}
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
      </div>

      {drawer}
    </header>
  )
}
