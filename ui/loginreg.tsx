'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase-admin'
import { X } from 'lucide-react'

interface Props {
  onClose: () => void
}

export default function LoginRegisterForm({ onClose }: Props) {
  const [isRegister, setIsRegister] = useState(false)

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirm = formData.get('confirm') as string
    const first_name = formData.get('first_name') as string
    const last_name = formData.get('last_name') as string
    const phone = formData.get('phone') as string

    if (password !== confirm) {
      alert('Пароли не совпадают')
      return
    }

    // 1. Создаём аккаунт в Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    })

    if (authError) {
      alert(`Ошибка регистрации: ${authError.message}`)
      return
    }

    const userId = authData.user?.id
    if (!userId) return

    // 2. Добавляем профиль в таблицу directus_users
    const { error: insertError } = await supabase
      .from('directus_users')
      .insert([
        {
          id: userId,
          email,
          first_name,
          last_name,
          phone
        }
      ])

    if (insertError) {
      console.error('Ошибка при создании профиля:', insertError)
    }

    alert('Регистрация успешна! Проверьте почту')
    onClose()
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      alert(`Ошибка входа: ${error.message}`)
    } else {
      alert('Вход выполнен')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
      <div className="relative bg-[#1c1c1c] rounded-xl px-8 py-6 w-full max-w-sm">
        <button onClick={onClose} className="absolute top-4 right-4 text-white">
          <X size={24} />
        </button>

        <h1 className="text-center font-bold text-xl text-white mb-6">
          <span className="text-red-600">PRO</span>
          <span className="text-white">TEL</span>
        </h1>

        <div className="flex mb-6 rounded-full bg-[#2d2d2d] overflow-hidden text-sm">
          <button
            className={`flex-1 py-2 font-medium transition ${!isRegister ? 'bg-red-600 text-white' : 'text-gray-400'}`}
            onClick={() => setIsRegister(false)}
          >
            Вход
          </button>
          <button
            className={`flex-1 py-2 font-medium transition ${isRegister ? 'bg-red-600 text-white' : 'text-gray-400'}`}
            onClick={() => setIsRegister(true)}
          >
            Создать аккаунт
          </button>
        </div>

        {!isRegister ? (
          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            <input
              name="email"
              type="email"
              placeholder="Почта"
              required
              className="bg-[#333] rounded-md px-4 py-2 text-sm text-white placeholder-gray-400"
            />
            <input
              name="password"
              type="password"
              placeholder="Пароль"
              required
              className="bg-[#333] rounded-md px-4 py-2 text-sm text-white placeholder-gray-400"
            />
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-full transition"
            >
              Войти
            </button>
          </form>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleRegister}>
            <input
              name="first_name"
              type="text"
              placeholder="Имя"
              required
              className="bg-[#333] rounded-md px-4 py-2 text-sm text-white placeholder-gray-400"
            />
            <input
              name="last_name"
              type="text"
              placeholder="Фамилия"
              required
              className="bg-[#333] rounded-md px-4 py-2 text-sm text-white placeholder-gray-400"
            />
            <input
              name="email"
              type="email"
              placeholder="Почта"
              required
              className="bg-[#333] rounded-md px-4 py-2 text-sm text-white placeholder-gray-400"
            />
            <input
              name="password"
              type="password"
              placeholder="Пароль"
              required
              className="bg-[#333] rounded-md px-4 py-2 text-sm text-white placeholder-gray-400"
            />
            <input
              name="confirm"
              type="password"
              placeholder="Подтвердите пароль"
              required
              className="bg-[#333] rounded-md px-4 py-2 text-sm text-white placeholder-gray-400"
            />
            <input
              name="phone"
              type="tel"
              placeholder="Номер телефона"
              required
              className="bg-[#333] rounded-md px-4 py-2 text-sm text-white placeholder-gray-400"
            />
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-full transition"
            >
              Создать
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
