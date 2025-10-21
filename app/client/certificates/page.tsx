'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase-browser'

const certificates = [
  { id: 1, name: '🏊 Справка для бассейна', tests: ['Анализ кала на яйца глист', 'Фото кожи'], type: 'online' },
  { id: 2, name: '👶 В детский сад / школу', tests: ['Анализы', 'Фото ребёнка'], type: 'online' },
  { id: 3, name: '💼 На работу / сан. книжка', tests: ['Анализы', 'Фото'], type: 'offline' },
  { id: 4, name: '✈️ Для поездки / границы', tests: ['Анализ крови', 'Фото кожи'], type: 'offline' },
  { id: 5, name: '🧍‍♂ Индивидуальная справка', tests: ['По запросу врача'], type: 'online' },
]

export default function CertificatesPage() {
  const [mode, setMode] = useState<'online' | 'offline' | null>(null)
  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState<any>(null)
  const [files, setFiles] = useState<{ [key: string]: File | null }>({})
  const [form, setForm] = useState({
    full_name: '',
    birth_date: '',
    phone: '',
    email: '',
    datetime: '',
    comment: '',
  })
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  // 📤 Отправка записи в Supabase
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('appointments').insert({
      patient_name: form.full_name,
      patient_phone: form.phone,
      appointment_time: form.datetime,
      comment: form.comment,
      service_name: selected?.name,
      status: 'pending',
      source: 'certificates',
    })

    if (error) {
      alert('Ошибка при записи. Попробуйте позже.')
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      setTimeout(() => {
        setSuccess(false)
        setStep(1)
        setSelected(null)
        setMode(null)
        setForm({ full_name: '', birth_date: '', phone: '', email: '', datetime: '', comment: '' })
      }, 3000)
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 text-[#001759] font-[Inter]">
      <h1 className="text-3xl font-bold mb-6">Медицинские справки</h1>

      {/* 🔹 Шаг 1: выбор формата */}
      {!mode && (
        <div className="grid sm:grid-cols-2 gap-6">
          <div
            onClick={() => setMode('online')}
            className="p-6 bg-white rounded-2xl border shadow-sm cursor-pointer hover:shadow-md transition"
          >
            <h3 className="text-xl font-semibold mb-2">🟢 Получить онлайн</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Без визита в клинику</li>
              <li>• Консультация через видеосвязь</li>
              <li>• Справка PDF с ЭЦП врача</li>
            </ul>
          </div>
          <div
            onClick={() => setMode('offline')}
            className="p-6 bg-white rounded-2xl border shadow-sm cursor-pointer hover:shadow-md transition"
          >
            <h3 className="text-xl font-semibold mb-2">🏥 Получить в клинике</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Осмотр и анализы</li>
              <li>• Бумажная справка на руки</li>
              <li>• Оплата на месте</li>
            </ul>
          </div>
        </div>
      )}

      {/* 🔹 Шаг 2: выбор типа справки */}
      {mode && step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {certificates
            .filter((c) => c.type === mode)
            .map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setSelected(c)
                  setStep(2)
                }}
                className="bg-white p-5 rounded-2xl shadow-sm border cursor-pointer hover:shadow-md transition"
              >
                <h3 className="text-lg font-semibold mb-2">{c.name}</h3>
                <p className="text-slate-600 text-sm mb-2">Требуется:</p>
                <ul className="text-sm text-slate-700 list-disc pl-5">
                  {c.tests.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            ))}
        </motion.div>
      )}

      {/* 🔹 Шаг 3: загрузка анализов */}
{selected && step === 2 && (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 bg-white p-6 rounded-2xl shadow-sm max-w-lg mx-auto"
    >
      <h2 className="text-xl font-semibold mb-3">{selected.name}</h2>
      <p className="text-slate-600 mb-4">
        Для этой справки нужны: {selected.tests.join(', ')}.
      </p>
  
      {selected.tests.map((t: string) => (
        <div key={t} className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t}</label>
          <input
            type="file"
            accept=".pdf,.jpg,.png"
            onChange={(e) => setFiles({ ...files, [t]: e.target.files?.[0] || null })}
            className="block w-full border border-gray-200 rounded-lg text-sm file:mr-3 file:py-1.5 file:px-3 file:border-0 file:bg-emerald-500 file:text-white file:rounded-md file:cursor-pointer"
          />
        </div>
      ))}
      
  
      {/* Проверяем, все ли файлы прикреплены */}
      <button
        onClick={() => setStep(3)}
        disabled={
          selected.tests.some((t: string) => !files[t]) // если хоть один файл не загружен
        }
        className={`w-full font-semibold py-2 rounded-lg mt-4 transition ${
          selected.tests.some((t: string) => !files[t])
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-emerald-500 hover:bg-emerald-600 text-white'
        }`}
      >
        Отправить документы на проверку
      </button>
    </motion.div>
  )}
  
      {/* 🔹 Шаг 4: форма записи */}
      {selected && step === 3 && (
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white p-6 rounded-2xl shadow-sm max-w-lg mx-auto space-y-4"
        >
          <h2 className="text-xl font-semibold mb-3">Запись к врачу</h2>

          <input
            type="text"
            required
            placeholder="ФИО"
            className="w-full border rounded-lg px-3 py-2"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
          <input
            type="date"
            required
            className="w-full border rounded-lg px-3 py-2"
            value={form.birth_date}
            onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
          />
          <input
            type="tel"
            required
            placeholder="Телефон"
            className="w-full border rounded-lg px-3 py-2"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email / WhatsApp"
            className="w-full border rounded-lg px-3 py-2"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="datetime-local"
            required
            className="w-full border rounded-lg px-3 py-2"
            value={form.datetime}
            onChange={(e) => setForm({ ...form, datetime: e.target.value })}
          />
          <textarea
            placeholder="Комментарий (опционально)"
            className="w-full border rounded-lg px-3 py-2"
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-lg"
          >
            {loading ? 'Отправка...' : 'Записаться к врачу'}
          </button>
        </motion.form>
      )}

      {/* 🔹 Успешное сообщение */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
          >
            <div className="bg-white p-6 rounded-2xl text-center shadow-lg">
              <p className="text-emerald-600 text-lg font-semibold mb-2">
                ✅ Вы успешно записаны!
              </p>
              <p className="text-sm text-slate-600">
                Врач свяжется с вами в указанное время.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-4 px-5 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
              >
                Закрыть
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
