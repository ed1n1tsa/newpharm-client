'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutBtn from './_logout'
import '@/styles/admin.css'

// 🎨 Иконки
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  UserCog,
  FileText,
  Stethoscope,
  Droplets,
  ActivitySquare,
  RefreshCcw,
  ShoppingCart,
} from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => setOpen(false), [pathname])

  const nav = [
    { href: '/admin', label: 'Обзор', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Товары', icon: Package },
    { href: '/admin/procedures', label: 'Процедуры', icon: ClipboardList },
    { href: '/admin/doctors', label: 'Врачи', icon: Stethoscope },
    { href: '/admin/certificates', label: 'Справки', icon: FileText },
    { href: '/admin/nurses', label: 'Медсёстры', icon: UserCog },
    { href: '/admin/iv-therapy', label: 'IV-терапия', icon: Droplets },
    { href: '/admin/orders', label: 'Заказы', icon: ShoppingCart },
    { href: '/admin/integration', label: 'Интеграция 1С', icon: RefreshCcw },
    { href: '/admin/director', label: 'Аналитика', icon: ActivitySquare },
  ]

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900 font-inter relative">
      {/* затемнение при открытом меню (моб.) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Боковое меню */}
      <aside
        className={`fixed md:static z-40 bg-white border-r shadow-sm w-[280px] flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 font-semibold text-xl border-b text-teal-600">
          Нью-Фарм • Админ
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-[15px] font-medium transition ${
                  active
                    ? 'bg-teal-50 text-teal-700 border-l-4 border-teal-500'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-5 border-t text-sm">
          <div className="text-gray-700 font-medium truncate">director@test.kz</div>
          <div className="uppercase text-xs text-gray-500 mb-2">DIRECTOR</div>
          <LogoutBtn />
        </div>
      </aside>

      {/* Основной контент */}
      <div className="flex-1 flex flex-col">
        {/* Мобильный хедер */}
        <header className="md:hidden flex items-center justify-between p-4 bg-teal-500 text-white shadow-sm">
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-md border border-white/30 hover:bg-teal-600 focus:outline-none transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="font-semibold text-base">Админ-панель</div>
        </header>

        <main className="flex-1 p-8 md:p-10">{children}</main>
      </div>
    </div>
  )
}
