'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'
import ModalAppointmentForm from './ModalAppointmentForm'

export default function ServicesSection() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <section className="bg-white py-12 sm:py-20 px-4" id="services">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_320px] gap-8">
          {/* Левая часть: только блок записи на приём */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              Записаться на приём
            </h2>
            <p className="text-slate-700 max-w-md mb-4">
              Легко записаться как на онлайн консультацию, так и на очный приём.
            </p>
            <button
              onClick={() => setOpen(true)}
              className="inline-block px-6 py-3 bg-[#20B0B1] hover:bg-[#1a9d9d] text-white rounded-xl font-medium transition"
            >
              Записаться на консультацию
            </button>
          </motion.div>

          {/* Правая часть: карточка “Наши врачи” */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl bg-slate-50 p-4 sm:p-6 flex flex-col items-center text-center"
          >
            <div className="w-full max-w-[260px] mb-4 overflow-hidden rounded-2xl">
              <Image
                src="/images/doctor-female.png"
                alt="Наши врачи"
                width={400}
                height={500}
                className="object-cover w-full h-auto"
              />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Наши врачи</h3>
            <p className="text-sm text-slate-700 mt-2">
              Выберите врача и удобное время для записи на приём.
              Напоминания о записи будут отправлены вам заранее.
            </p>
            <a
              href="/doctors"
              className="mt-4 inline-block bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-xl font-medium transition"
            >
              Посмотреть
            </a>
          </motion.div>
        </div>
      </section>

      {/* Попап формы записи */}
      <ModalAppointmentForm isOpen={open} onClose={() => setOpen(false)} />
    </>
  )
}
