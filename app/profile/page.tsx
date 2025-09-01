'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export default function ProfilePage() {
  const isLoggedIn = false // Измени на true для авторизованного отображения

  const user = {
    name: 'Айбек М.',
    phone: '+7 777 123 4567',
    email: 'aibek@example.com',
    registeredAt: '12.08.2024',
    avatar: '/images/avatar.png',
  }

  return (
    <section className="min-h-screen bg-white text-[#001759] py-16 px-4">
      <div className="max-w-xl mx-auto">
        {isLoggedIn ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-slate-50 p-6 rounded-2xl shadow-md flex flex-col items-center text-center"
          >
            <div className="w-28 h-28 rounded-full overflow-hidden mb-4">
              <Image
                src={user.avatar}
                alt="Аватар"
                width={112}
                height={112}
                className="object-cover w-full h-full"
              />
            </div>

            <h1 className="text-2xl font-bold mb-1">{user.name}</h1>
            <p className="text-sm text-slate-600 mb-4">{user.email}</p>

            <div className="text-sm w-full text-left space-y-2">
              <div>
                <span className="font-semibold">📞 Телефон: </span>
                {user.phone}
              </div>
              <div>
                <span className="font-semibold">📅 Регистрация: </span>
                {user.registeredAt}
              </div>
            </div>

            <button
              className="mt-6 px-5 py-2 bg-[#20B0B1] hover:bg-[#1a9d9d] text-white rounded-xl font-semibold transition"
            >
              Редактировать профиль
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-slate-50 p-8 rounded-2xl shadow-md flex flex-col items-center text-center"
          >
            <video
              src="/videos/sad-face.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-40 h-40 mb-4 rounded-xl"
            />
            <h2 className="text-xl font-semibold mb-2">Вы не вошли в аккаунт</h2>
            <p className="text-sm text-slate-600 mb-4">Чтобы просмотреть профиль, выполните вход</p>
            <a
              href="/login"
              className="px-5 py-2 bg-[#20B0B1] hover:bg-[#1a9d9d] text-white rounded-xl font-semibold transition"
            >
              Войти
            </a>
          </motion.div>
        )}
      </div>
    </section>
  )
}
