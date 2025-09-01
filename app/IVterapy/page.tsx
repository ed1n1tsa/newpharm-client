'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'

const services = [
  {
    name: 'Витаминная',
    price: '9000 ₸',
    benefits: 'Иммунитет, энергия',
    details: 'Содержит витамины группы B, C, магний. Повышает тонус, улучшает общее самочувствие и помогает восстановиться после стресса.',
  },
  {
    name: 'Детокс',
    price: '9000 ₸',
    benefits: 'Очищение организма',
    details: 'Эффективное выведение токсинов, восстановление после приёма антибиотиков или алкоголя. Помогает коже и печени.',
  },
  {
    name: 'Красивая кожа',
    price: '9000 ₸',
    benefits: 'Сияние, свежесть',
    details: 'Витаминный комплекс для улучшения состояния кожи, укрепления волос и ногтей. Придаёт сияние и упругость.',
  },
  {
    name: 'Антистресс',
    price: '9000 ₸',
    benefits: 'Расслабление, покой',
    details: 'Магний, витамины группы B и глицин помогают нормализовать сон, снизить тревожность и восстановить баланс.',
  },
]

export default function IVTherapyPage() {
  const [activeService, setActiveService] = useState<null | typeof services[0]>(null)

  return (
    <section className="bg-white text-[#001759]">
      {/* Обложка */}
      <div className="w-full">
        <Image
          src="/images/iv-cover.png"
          alt="IV-Therapy"
          width={1600}
          height={600}
          className="w-full h-auto object-cover"
        />
      </div>

      {/* Блок: Что такое Айви-терапия */}
      <div className="bg-[#d4fcf6] py-12 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            className="text-2xl sm:text-3xl font-bold mb-4"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Что такое Айви-терапия?
          </motion.h2>
          <motion.p
            className="text-sm sm:text-base font-medium leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Айви-терапия — это внутривенное введение витаминов, микроэлементов, аминокислот и других растворов для
            быстрого восстановления, укрепления иммунитета, улучшения самочувствия и внешнего вида.
          </motion.p>
        </div>
      </div>

      {/* Каталог услуг */}
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6">
        <h3 className="text-2xl font-bold mb-6">Каталог услуг (капельницы)</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-[#20B0B1] text-white p-6 rounded-2xl shadow-md"
            >
              <h4 className="text-lg font-semibold mb-2">{service.name}</h4>
              <p className="text-sm mb-1">Цена: <b>{service.price}</b></p>
              <p className="text-sm mb-4">{service.benefits}</p>
              <button
                onClick={() => setActiveService(service)}
                className="bg-white text-[#20B0B1] font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 transition"
              >
                Подробнее
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Запись на консультацию */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Записаться на приём</h2>
          <p className="text-sm text-slate-700 max-w-md">
            Легко записаться как на онлайн консультацию, так и на очный приём.
          </p>
          <a
            href="/doctors"
            className="mt-4 inline-block bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-xl font-medium transition"
          >
            Записаться на консультацию
          </a>
        </div>

        <Image
          src="/images/doctor-female.png"
          alt="Доктор"
          width={280}
          height={400}
          className="object-contain"
        />
      </div>

      {/* Попап с описанием услуги */}
      {activeService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-xl max-w-md w-full p-6 relative shadow-xl"
          >
            <button
              onClick={() => setActiveService(null)}
              className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
            <h4 className="text-xl font-bold text-[#001759] mb-2">{activeService.name}</h4>
            <p className="text-sm text-[#001759] mb-2">Цена: {activeService.price}</p>
            <p className="text-sm text-[#001759] mb-2">Польза: {activeService.benefits}</p>
            <p className="text-sm text-[#001759]">{activeService.details}</p>
          </motion.div>
        </div>
      )}
    </section>
  )
}
