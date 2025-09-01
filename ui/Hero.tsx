'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'
import ModalAppointmentForm from './ModalAppointmentForm'

export default function Hero() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <section className="bg-sky-50 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 items-center gap-12">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">
              Онлайн-<span className="text-blue-600">Аптека</span><br />
              и Телемедицина
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Всё, что нужно для вашего здоровья: покупка медикаментов и консультации с врачами онлайн.
            </p>
            <button
              onClick={() => setOpen(true)}
              className="mt-6 inline-block bg-sky-700 hover:bg-sky-800 text-white px-6 py-3 rounded-xl transition"
            >
              Записаться на консультацию
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="w-full max-w-md mx-auto">
              <Image
                src="/images/doctor-main.png"
                alt="Доктор"
                width={600}
                height={750}
                className="w-full h-auto"
                priority
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Модалка */}
      <ModalAppointmentForm isOpen={open} onClose={() => setOpen(false)} />
    </>
  )
}
