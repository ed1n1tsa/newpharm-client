'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-browser'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // 🔐 Авторизация
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // ⏳ Небольшая задержка для установки сессии
    await new Promise((r) => setTimeout(r, 800))

    // 🔍 Проверяем пользователя
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('Ошибка: пользователь не найден')
      setLoading(false)
      return
    }

    // 📦 Загружаем профиль (роль)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      setError('Ошибка загрузки профиля')
      setLoading(false)
      return
    }

    const role = profile.role

    // 🔁 Обновляем серверный рендер
    router.refresh()

    // 🎯 Перенаправляем по ролям
    switch (role) {
      case 'director':
        router.push('/admin/director')
        break
      case 'doctor':
        router.push('/admin/doctor')
        break
      case 'accountant':
        router.push('/admin/accountant')
        break
      case 'developer':
        router.push('/admin')
        break
      case 'client':
        router.push('/client/profile')
        break
      default:
        router.push('/')
        break
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm p-6 rounded-xl border bg-white shadow-sm"
      >
        <h1 className="text-xl font-bold mb-4 text-center">Вход в систему</h1>

        <input
          type="email"
          className="w-full border rounded px-3 py-2 mb-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          className="w-full border rounded px-3 py-2 mb-3"
          placeholder="Пароль"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          required
        />

        {error && <p className="text-red-600 text-sm mb-2 text-center">{error}</p>}

        <button
          disabled={loading}
          type="submit"
          className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded py-2 transition"
        >
          {loading ? 'Входим...' : 'Войти'}
        </button>

        <p className="text-center text-sm text-gray-500 mt-3">
          Нет аккаунта?{' '}
          <a href="/register" className="text-teal-600 hover:underline font-medium">
            Зарегистрироваться
          </a>
        </p>
      </form>
    </main>
  )
}
