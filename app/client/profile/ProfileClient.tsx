'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { LogOut, HelpCircle, MessageCircle } from 'lucide-react'
import Link from 'next/link'

type Props = {
  fullName: string
  email: string
  phone: string
  registeredAt: string
}

export default function ProfileClient({ fullName, email, phone, registeredAt }: Props) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(fullName)
  const [newPhone, setNewPhone] = useState(phone)
  const [newEmail, setNewEmail] = useState(email)
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setMessage('Пользователь не найден.')
      setLoading(false)
      return
    }

    // Обновление профиля
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ full_name: name, phone: newPhone })
      .eq('id', user.id)

    if (updateError) {
      setMessage('Ошибка при сохранении профиля.')
      setLoading(false)
      return
    }

    // Email
    if (newEmail !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({ email: newEmail })
      if (emailError) {
        setMessage('Ошибка при обновлении email: ' + emailError.message)
        setLoading(false)
        return
      }
    }

    // Пароль
    if (newPassword.trim().length >= 6) {
      const { error: passError } = await supabase.auth.updateUser({
        password: newPassword,
      })
      if (passError) {
        setMessage('Ошибка при обновлении пароля: ' + passError.message)
        setLoading(false)
        return
      }
    }

    setEditing(false)
    setLoading(false)
    setMessage('✅ Изменения сохранены!')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  // 📱 WhatsApp ссылка
  const whatsappUrl = `https://wa.me/77001234040?text=${encodeURIComponent(
    'Здравствуйте, пишу с сайта NewPharm'
  )}`

  return (
    <section className="min-h-screen bg-[#f9fafb] py-10 px-4">
      <div className="max-w-md mx-auto space-y-5">
        {/* Профильная карточка */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-md rounded-2xl p-4 flex items-center gap-4"
        >
          <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
            <Image
              src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${email}`}
              alt="Аватар"
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <h1 className="font-semibold text-gray-800">{fullName}</h1>
            <p className="text-sm text-gray-500">{email}</p>
          </div>
        </motion.div>

        {/* Меню */}
        {!editing ? (
          <>
            <div className="bg-white rounded-2xl shadow-sm divide-y text-gray-700">
              <button
                onClick={() => setEditing(true)}
                className="block w-full text-left px-5 py-3 hover:bg-gray-50 transition"
              >
                Изменить данные
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 hover:bg-gray-50 transition"
              >
                <MessageCircle size={18} className="text-emerald-500" />
                Служба поддержки (WhatsApp)
              </a>

              <Link
                href="/client/faq"
                className="flex items-center gap-2 px-5 py-3 hover:bg-gray-50 transition"
              >
                <HelpCircle size={18} className="text-emerald-500" />
                Часто задаваемые вопросы (FAQ)
              </Link>
            </div>

            <button
              onClick={handleLogout}
              className="w-full mt-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg flex items-center justify-center gap-2 transition"
            >
              <LogOut size={18} />
              Выйти
            </button>
          </>
        ) : (
          <>
            {/* Режим редактирования */}
            <div className="bg-white shadow-sm rounded-2xl p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Имя</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Телефон</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Новый Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Новый пароль</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Оставьте пустым, если не меняете"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              {message && (
                <p className="text-sm text-emerald-600 text-center mt-2">{message}</p>
              )}

              <div className="flex gap-3 mt-5">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition"
                >
                  {loading ? 'Сохранение...' : 'Сохранить'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition"
                >
                  Отмена
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
