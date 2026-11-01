'use client'

import Link from 'next/link'
import { User } from 'lucide-react'

export default function HomeLoginBanner({ loggedIn }: { loggedIn: boolean }) {
  if (loggedIn) return null
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 md:hidden">
      <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-emerald-100/80 px-4 py-3 flex items-center gap-3">
        <span className="grid place-items-center h-10 w-10 rounded-full bg-white text-emerald-600 shrink-0">
          <User size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900">Войдите в аккаунт</p>
          <p className="text-xs text-slate-600 line-clamp-2">
            Сохраняйте избранное, отслеживайте заказы и получайте персональные акции
          </p>
        </div>
        <Link
          href="/login"
          className="shrink-0 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-4 py-2"
        >
          Войти
        </Link>
      </div>
    </section>
  )
}
