'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase-browser'

export default function ModalDoctorBooking({
  isOpen,
  onClose,
  doctorId,
  doctorName,
  date,
  time,
}: any) {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [complaint, setComplaint] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  async function handleSubmit() {
    if (!fullName || !phone) return alert('Заполните ФИО и телефон')
    setSending(true)
    try {
      const { error } = await supabase.from('appointments').insert({
        doctor_id: doctorId,
        full_name: fullName,
        phone,
        complaint,
        appointment_date: date,
        appointment_time: time,
        appointment_type: 'offline',
        status: 'pending',
        payment_status: 'unpaid',
      })
      if (error) throw error
      setSuccess(true)
    } catch (err: any) {
      console.error(err.message)
      alert('Ошибка при создании записи.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md font-[Inter]">
        {!success ? (
          <>
            <h3 className="text-lg font-bold mb-3 text-[#001759]">
              Запись к врачу
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              {doctorName}, {new Date(date).toLocaleDateString()} в {time}
            </p>

            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="ФИО"
              className="w-full border rounded-xl px-4 py-2 mb-3 focus:border-emerald-500 outline-none"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Телефон"
              className="w-full border rounded-xl px-4 py-2 mb-3 focus:border-emerald-500 outline-none"
            />
            <textarea
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="Жалоба (по желанию)"
              className="w-full border rounded-xl px-4 py-2 mb-4 focus:border-emerald-500 outline-none"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl border text-sm font-semibold"
              >
                Отмена
              </button>
              <button
                disabled={sending}
                onClick={handleSubmit}
                className="px-4 py-2 rounded-xl bg-[#20B0B1] text-white text-sm font-semibold"
              >
                {sending ? 'Запись...' : 'Подтвердить'}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <h3 className="text-lg font-bold mb-3 text-[#001759]">
              ✅ Запись успешно создана!
            </h3>
            <p className="text-sm text-slate-600 mb-5">
              Мы отправим подтверждение в WhatsApp.
            </p>
            <button
              onClick={onClose}
              className="bg-[#20B0B1] text-white px-5 py-2 rounded-xl font-semibold"
            >
              Закрыть
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
