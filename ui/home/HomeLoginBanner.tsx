'use client'

import Link from 'next/link'
import { User } from 'lucide-react'

export default function HomeLoginBanner({ loggedIn }: { loggedIn: boolean }) {
  if (loggedIn) return null
  return (
    <section className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 py-2 md:py-3">
      <div className="rounded-[18px] md:rounded-[20px] bg-[#e8f8ee] px-3.5 py-3 md:px-5 md:py-3.5 flex items-center gap-3">
        <span className="grid place-items-center h-10 w-10 md:h-11 md:w-11 rounded-full bg-white text-[#22c55e] shrink-0 shadow-sm">
          <User size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] md:text-[15px] font-bold text-[#111827]">Войдите в аккаунт</p>
          <p className="text-[11px] md:text-[12px] text-[#6b7280] line-clamp-2 leading-snug">
            Сохраняйте избранное, отслеживайте заказы и получайте персональные акции
          </p>
        </div>
        <Link
          href="/login"
          className="shrink-0 rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-white text-[13px] font-semibold px-4 py-2 md:px-5"
        >
          Войти
        </Link>
      </div>
    </section>
  )
}
