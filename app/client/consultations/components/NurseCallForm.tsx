'use client'

import { useState } from 'react'

export default function NurseCallForm({
  isOpen,
  onClose,
  selectedProcedures, // array of procedures (можно 1 шт)
  userId,
}: {
  isOpen: boolean
  onClose: () => void
  selectedProcedures: any[]
  userId?: string | null
}) {
  const [patientName, setPatientName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const total = selectedProcedures.reduce((s, p) => s + Number(p.price || 0), 0)

  if (!isOpen) return null

  async function submit() {
    try {
      setLoading(true)
      const res = await fetch('/api/nurse-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId || null,
          procedures: selectedProcedures.map((p) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price || 0),
          })),
          total,
          patient_name: patientName,
          phone,
          address,
          preferred_time: preferredTime,
          comment,
        }),
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error || 'Ошибка отправки')
      alert('✅ Заявка отправлена! Мы свяжемся с вами.')
      onClose()
    } catch (e: any) {
      alert(`Ошибка: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6">
        <h3 className="text-xl font-semibold text-[#001759] mb-4">
          Вызов медсестры на дом
        </h3>

        <div className="mb-3 text-sm">
          <div className="font-semibold mb-1">Выбранные процедуры:</div>
          <ul className="list-disc list-inside text-slate-700">
            {selectedProcedures.map((p) => (
              <li key={p.id}>
                {p.name} — {Number(p.price).toLocaleString('ru-RU')} ₸
              </li>
            ))}
          </ul>
          <div className="mt-2 font-semibold">
            Итого: <span className="text-emerald-600">{total.toLocaleString('ru-RU')} ₸</span>
          </div>
        </div>

        <div className="grid gap-3">
          <input
            className="border rounded-xl px-4 py-2"
            placeholder="ФИО пациента"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
          />
          <input
            className="border rounded-xl px-4 py-2"
            placeholder="Телефон"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            className="border rounded-xl px-4 py-2"
            placeholder="Адрес"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <input
            className="border rounded-xl px-4 py-2"
            placeholder="Удобное время (например: Сегодня, 18:00–20:00)"
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
          />
          <textarea
            className="border rounded-xl px-4 py-2"
            placeholder="Комментарий (опционально)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-semibold"
            disabled={loading}
          >
            Отмена
          </button>
          <button
            onClick={submit}
            className="px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
            disabled={loading}
          >
            {loading ? 'Отправляем…' : 'Подтвердить вызов'}
          </button>
        </div>
      </div>
    </div>
  )
}
