'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase-browser'

const therapies = [
  {
    id: 1,
    name: '💧 Витаминная капельница',
    description: 'Иммунитет, энергия, восстановление организма.',
    price: 9000,
    category: 'иммунитет',
    details:
      'Комплекс витаминов группы B, C и микроэлементов для поддержания тонуса и энергии.',
  },
  {
    id: 2,
    name: '🧘 Антистресс',
    description: 'Снимает тревожность, улучшает сон и концентрацию.',
    price: 10500,
    category: 'антистресс',
    details:
      'Магний, витамины группы B, глицин и электролиты для восстановления нервной системы.',
  },
  {
    id: 3,
    name: '🌿 Детокс',
    description: 'После праздников и для очищения организма.',
    price: 10000,
    category: 'детокс',
    details:
      'L-карнитин, глутатион, витамины C и B12 для очищения и ускорения метаболизма.',
  },
  {
    id: 4,
    name: '✨ Красивая кожа',
    description: 'Для упругости кожи, сияния и молодости.',
    price: 11000,
    category: 'омоложение',
    details:
      'Коллаген, гиалуроновая кислота, витамин E и цинк для красоты и упругости кожи.',
  },
]

export default function IvTherapyPage() {
  const [selectedCategory, setSelectedCategory] = useState('все')
  const [selected, setSelected] = useState<any>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    type: 'offline',
    datetime: '',
    comment: '',
  })
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const filtered =
    selectedCategory === 'все'
      ? therapies
      : therapies.filter((t) => t.category === selectedCategory)

  // 🧾 Отправка формы в Supabase
  // 🧾 Отправка формы в Supabase
async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
  
    setLoading(true)
  
    const { error } = await supabase.from('appointments').insert({
      patient_name: formData.full_name,
      patient_phone: formData.phone,
      consultation_type: formData.type,
      appointment_time: formData.datetime,
      comment: formData.comment,
      service_name: selected.name,
      service_price: selected.price,
      status: 'pending',
      source: 'iv_therapy',
    })
  
    if (error) {
      console.error('Ошибка записи:', error.message)
      setLoading(false)
      alert('Ошибка при записи. Попробуйте позже.')
    } else {
      setLoading(false)
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setSelected(null)
        setFormData({
          full_name: '',
          phone: '',
          type: 'offline',
          datetime: '',
          comment: '',
        })
      }, 3000)
    }
  }
  
  return (
    <main className="max-w-5xl mx-auto px-4 py-8 text-[#001759] font-[Inter]">
      <h1 className="text-3xl font-bold mb-6">
        IV-терапия (витаминные капельницы)
      </h1>

      {/* 🔹 Информационный блок */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-2">Что такое Айви-терапия?</h2>
        <p className="text-slate-700 mb-3">
          Айви-терапия — это внутривенное введение витаминов и микроэлементов
          для восстановления, укрепления иммунитета и улучшения самочувствия.
        </p>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>✅ Быстрый эффект</li>
          <li>✅ 100% усвоение</li>
          <li>✅ Без нагрузки на ЖКТ</li>
          <li>✅ Проводится сертифицированной медсестрой</li>
        </ul>
      </div>

      {/* 🔹 Фильтр */}
      <div className="flex gap-3 flex-wrap mb-6">
        {['все', 'иммунитет', 'антистресс', 'детокс', 'омоложение'].map(
          (cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full font-semibold border ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-white text-emerald-600 border-emerald-500 hover:bg-emerald-50'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          )
        )}
      </div>

      {/* 🔹 Список капельниц */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold mb-1">{t.name}</h3>
            <p className="text-sm text-slate-600 mb-2">{t.description}</p>
            <p className="text-emerald-600 font-semibold mb-3">
              {t.price.toLocaleString('ru-RU')} ₸
            </p>
            <button
              onClick={() => setSelected(t)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-4 py-2 w-full font-semibold"
            >
              Подробнее
            </button>
          </div>
        ))}
      </div>

      {/* 🔹 Модалка с описанием и формой */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full text-center shadow-md">
            <h3 className="text-xl font-semibold mb-2">{selected.name}</h3>
            <p className="text-slate-700 mb-3">{selected.details}</p>
            <p className="font-semibold text-emerald-600 mb-4">
              Цена: {selected.price.toLocaleString('ru-RU')} ₸
            </p>

            {success ? (
              <p className="text-emerald-600 font-semibold">
                ✅ Вы успешно записались!
              </p>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="text-left space-y-3 text-sm"
              >
                <input
                  type="text"
                  placeholder="ФИО"
                  required
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
                <input
                  type="tel"
                  placeholder="Телефон"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="offline">Оффлайн (в кабинете)</option>
                  <option value="online">Онлайн (видеозвонок)</option>
                </select>
                <input
                  type="datetime-local"
                  required
                  value={formData.datetime}
                  onChange={(e) =>
                    setFormData({ ...formData, datetime: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
                <textarea
                  placeholder="Комментарий (опционально)"
                  value={formData.comment}
                  onChange={(e) =>
                    setFormData({ ...formData, comment: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-4 py-2 w-full font-semibold"
                >
                  {loading ? 'Отправка...' : 'Записаться'}
                </button>
              </form>
            )}

            <button
              onClick={() => setSelected(null)}
              className="mt-4 bg-gray-200 text-gray-700 px-5 py-2 rounded-lg font-semibold hover:bg-gray-300"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
