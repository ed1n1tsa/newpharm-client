'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Home, LayoutGrid, Stethoscope, Tag, User } from 'lucide-react'
import { supabase } from '@/lib/supabase-browser'

export default function MobileNav() {
  const pathname = usePathname()
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
    { href: catalogHref, label: 'Каталог', icon: LayoutGrid },
    { href: '/doctors', label: 'Врачи', icon: Stethoscope },
    { href: '/#promos', label: 'Акции', icon: Tag },
    {
      href: loggedIn ? '/client/profile' : '/login',
      label: loggedIn ? 'Профиль' : 'Войти',
      icon: User,
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-[#eef2f6] md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-14">
        {navItems.map(({ href, label, icon: Icon }) => {
          const pathOnly = href.split('#')[0] || '/'
          const isActive =
            pathOnly === '/'
              ? pathname === '/'
              : pathname === pathOnly || pathname.startsWith(pathOnly + '/')
          return (
            <Link
              key={label}
              href={href}
              className="relative flex flex-col items-center gap-0.5 text-[10px] min-w-[56px]"
            >
              <span
                className={`grid place-items-center h-7 w-7 rounded-full ${
                  isActive ? 'bg-[#e8f8ee] text-[#16a34a]' : 'text-slate-400'
                }`}
              >
                <Icon size={18} />
              </span>
              <span className={isActive ? 'text-[#16a34a] font-semibold' : 'text-slate-500'}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
