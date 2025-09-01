'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

type Props = {
  isOpen: boolean
  onClose: () => void
  doctorName: string
  time: string
}

export default function ModalDoctorBooking({ isOpen, onClose, doctorName, time }: Props) {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    console.log('📩 Запись:', Object.fromEntries(formData.entries()))
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
                <h3 className="text-xl font-bold text-[#001759] mb-2">Запись на приём</h3>

                <input
                  name="fio"
                  required
                  placeholder="Ваше ФИО"
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
                  <option value="">Тип консультации</option>
                  <option value="Онлайн">Онлайн</option>
                  <option value="Оффлайн">Оффлайн</option>
                </select>

                <input
                  type="text"
                  name="doctor"
                  value={doctorName}
                  readOnly
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg bg-gray-100"
                />
                <input
                  type="text"
                  name="time"
                  value={time}
                  readOnly
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg bg-gray-100"
                />

                <button
                  type="submit"
                  className="w-full bg-[#20B0B1] hover:bg-[#1a9d9d] text-white font-semibold py-2 rounded-lg transition"
                >
                  Записаться
                </button>
              </form>
            ) : (
              <div className="text-center text-[#001759] font-medium">
                ✅ Спасибо! Вы записаны на приём
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
