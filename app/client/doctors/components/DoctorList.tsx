'use client'

import { useState } from 'react'
import DoctorCard from './DoctorCard'
import { motion } from 'framer-motion'

const SPECIALTIES = ['Терапевт', 'ЛОР', 'Педиатр', 'Уролог', 'Кардиолог']

export default function DoctorList({ doctors = [] }: { doctors: any[] }) {
  const [selected, setSelected] = useState<string[]>([])

  const toggleSpecialty = (spec: string) => {
    setSelected((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    )
  }

  // если фильтр не выбран — показываем всех
  const filtered =
    selected.length > 0
      ? doctors.filter((d) => selected.includes(d.specialization))
      : doctors

  return (
    <div className="grid lg:grid-cols-[240px_1fr] gap-6">
      {/* 🔹 Sidebar filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-[#20B0B1] text-white p-4 rounded-2xl font-semibold text-sm space-y-2"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <h3 className="text-white text-base mb-2">Категории</h3>
        {SPECIALTIES.map((spec) => (
          <label key={spec} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(spec)}
              onChange={() => toggleSpecialty(spec)}
              className="accent-white"
            />
            {spec}
          </label>
        ))}
      </motion.div>

      {/* 🔹 Doctor cards */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filtered.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center text-center py-20">
            <p className="text-gray-600 font-medium text-lg">
              Пока нет доступных врачей
            </p>
            <p className="text-gray-400 text-sm">
              Попробуйте позже или выберите другую категорию.
            </p>
          </div>
        ) : (
          filtered.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))
        )}
      </motion.div>
    </div>
  )
}
