'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import '@/styles/client.css'
import { supabase } from '@/lib/supabase-browser'
import { LogOut } from 'lucide-react'
import MobileNavClient from './MobileNavClient'
import { navItems } from './navItems'
import FloatingCartButton from './FloatingCartButton'


export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email || null))
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="client-dashboard min-h-screen flex bg-[#f7f8f9] text-gray-800 relative">
      {/* 📁 Левая панель (desktop) */}
      <aside className="hidden md:flex flex-col w-[280px] bg-white border-r shadow-sm">
        {/* 🔰 Логотип */}
        <Link
          href="/"
          className="p-6 border-b flex items-center gap-3 text-emerald-600 font-semibold text-lg"
        >
          <Image
            src="/logoNew.png"
            alt="Нью-Фарм логотип"
            width={36}
            height={36}
            className="rounded-md object-contain"
            priority
          />
          <span className="tracking-wide">Нью-Фарм</span>
        </Link>

        {/* 🔗 Меню */}
        <div className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
          {navItems
            .filter((item) => !item.mobileOnly) // 👈 убираем "Ещё"
            .map((item) => {
              const Icon = item.icon
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-[15px] font-medium transition ${
                    active
                      ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-500'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {item.label}
                </Link>
              )
            })}
        </div>

        {/* 👤 Пользователь + выход */}
        <div className="p-5 border-t text-sm">
          {userEmail && (
            <div className="text-gray-700 font-medium truncate">{userEmail}</div>
          )}
          <button
            onClick={handleLogout}
            className="mt-2 flex items-center gap-2 text-red-500 hover:text-red-600 font-semibold transition"
          >
            <LogOut size={16} />
            Выйти
          </button>
        </div>
      </aside>

      {/* 📦 Контент */}
      <main className="flex-1 p-6 md:p-10 pb-20 md:pb-10">{children}</main>

      {/* 📱 Мобильное меню */}
      <MobileNavClient />
  {/* 🛒 Плавающая кнопка корзины */}
  <FloatingCartButton />
    
      
    </div>
  )
}
