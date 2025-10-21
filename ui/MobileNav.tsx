'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  ShoppingCart,
  User,
  Boxes,
  Stethoscope,
  MapPin
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Главная', icon: Home },
  { href: '/catalog', label: 'Каталог', icon: Boxes },
  { href: '/profile', label: 'Профиль', icon: User }
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-sm md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center text-xs text-gray-600 hover:text-emerald-600 transition"
            >
              <Icon
                size={22}
                className={isActive ? 'text-emerald-600' : 'text-gray-400'}
              />
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
