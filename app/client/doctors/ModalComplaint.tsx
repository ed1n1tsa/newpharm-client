'use client'

import { supabase } from '@/lib/supabase-browser'
import { useState } from 'react'

export default function ModalComplaint({ isOpen, onClose, doctorName }: any) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!message.trim()) return alert('Введите жалобу.')
    setSending(true)
    try {
      const { error } = await supabase.from('doctor_complaints').insert({
        doctor_name: doctorName,
        message,
      })
      if (error) throw error
      alert('Жалоба отправлена.')
      onClose()
    } catch (err: any) {
      console.error(err.message)
      alert('Ошибка при отправке жалобы.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md">
        <h3 className="text-lg font-bold mb-3 text-[#001759]">
          Жалоба на {doctorName}
        </h3>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Опишите проблему..."
          className="w-full border rounded-xl p-2 text-sm mb-3 focus:border-emerald-500 outline-none"
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
            {sending ? 'Отправка...' : 'Отправить'}
          </button>
        </div>
      </div>
    </div>
  )
}
