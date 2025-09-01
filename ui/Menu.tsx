'use client'

import Link from 'next/link'
import { X } from 'lucide-react'
import { useState } from 'react'
import dynamic from 'next/dynamic'

// Динамически импортируем /ui/loginreg.tsx
const LoginRegisterForm = dynamic(() => import('@/ui/loginreg'), {
  ssr: false
})

interface Props {
  onClose: () => void
}

export default function Menu({ onClose }: Props) {
  const [showLogin, setShowLogin] = useState(false)

  return (
    <div className="fixed inset-0 bg-[#303030b3] z-50 flex">
      <div className="w-[260px] bg-[#111] text-white p-6 flex flex-col gap-6 relative">
        <button
          className="absolute right-4 top-4 text-red-500"
          onClick={onClose}
        >
          <X size={24} />
        </button>

        <div className="text-2xl font-bold font-inter tracking-wide">
          <span className="text-[#FF0000]">PRO</span>
          <span className="text-white">TEL</span> МЕНЮ
        </div>

        <nav className="flex flex-col gap-4 text-sm font-medium">

          <Link href="/faq" className="border-b border-red-500 pb-1">
            FAQ
          </Link>
          <Link href="/category" className="border-b border-red-500 pb-1">
            КАТЕГОРИИ ТОВАРОВ
          </Link>
          <Link href="/branches" className="border-b border-red-500 pb-1">
            ФИЛИАЛЫ
          </Link>
          <Link href="/profile" className="border-b border-red-500 pb-1">
            ПРОФИЛЬ
          </Link>
          {/* 👉 ВХОД вызывает логин */}
          <button
            onClick={() => setShowLogin(true)}
            className="text-left border-b border-red-500 pb-1"
          >
            ВХОД
          </button>
        </nav>
      </div>

      {/* Логин-попап */}
      {showLogin && (
        <>
        <LoginRegisterForm onClose={() => setShowLogin(false)} />

          <button
            onClick={() => setShowLogin(false)}
            className="fixed top-4 right-4 z-[999] text-white"
          >
            <X size={28} />
          </button>
        </>
      )}
    </div>
  )
}
