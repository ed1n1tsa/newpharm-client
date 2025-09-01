'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

type Props = {
  isOpen: boolean
  onClose: () => void
}

export default function ModalAppointmentForm({ isOpen, onClose }: Props) {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    console.log('✅ Данные формы:', Object.fromEntries(formData.entries()))
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      onClose()
    }, 2000)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white w-full max-w-md p-6 rounded-xl shadow-xl relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-bold text-[#001759] mb-2">Записаться на консультацию</h3>

                <input
                  name="name"
                  required
                  placeholder="ФИО"
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg"
                />

                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="Телефон"
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg"
                />

                <select
                  name="type"
                  required
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg"
                >
                  <option value="">Вид консультации</option>
                  <option value="Онлайн">Онлайн</option>
                  <option value="Оффлайн">Оффлайн</option>
                </select>

                <input
                  type="datetime-local"
                  name="datetime"
                  required
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg"
                />

                <input
                  name="doctor"
                  required
                  placeholder="Выберите врача"
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg"
                />

                <textarea
                  name="comment"
                  placeholder="Комментарий (опц.)"
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg"
                  rows={3}
                />

                <button
                  type="submit"
                  className="w-full bg-[#20B0B1] hover:bg-[#1a9d9d] text-white font-semibold py-2 rounded-lg transition"
                >
                  Записаться к врачу
                </button>
              </form>
            ) : (
              <div className="text-center text-[#001759] font-medium">
                ✅ Спасибо! Вы записаны. Врач свяжется с вами в выбранное время.
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
