'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Home, ShoppingCart, User, Boxes } from 'lucide-react'
import { useCart } from './CartContext'
import { supabase } from '@/lib/supabase-browser'

export default function MobileNav() {
  const pathname = usePathname()
  const { count } = useCart()
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setLoggedIn(!!session?.user)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const catalogHref = loggedIn ? '/client/products' : '/catalog'
  const navItems = [
    { href: '/', label: 'Главная', icon: Home },
    { href: catalogHref, label: 'Каталог', icon: Boxes },
    { href: '/cart', label: 'Корзина', icon: ShoppingCart, cart: true },
    { href: loggedIn ? '/client/profile' : '/profile', label: 'Профиль', icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-sm md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ href, label, icon: Icon, cart }) => {
          const isActive =
            pathname === href ||
            (href !== '/' && pathname.startsWith(href.split('?')[0]))
          return (
            <Link
              key={label}
              href={href}
              className="relative flex flex-col items-center text-xs text-gray-600 hover:text-emerald-600 transition"
            >
              <Icon
                size={22}
                className={isActive ? 'text-emerald-600' : 'text-gray-400'}
              />
              {cart && count > 0 && (
                <span className="absolute -top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {count > 99 ? '99+' : count}
                </span>
              )}
              <span className={isActive ? 'text-emerald-600 font-medium' : ''}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
