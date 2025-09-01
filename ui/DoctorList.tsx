'use client'

import { useState } from 'react'
import DoctorCard from './DoctorCard'
import { motion } from 'framer-motion'

const SPECIALTIES = ['Терапевт', 'ЛОР', 'Педиатр', 'Уролог', 'Кардиолог']

const DOCTORS = [
  {
    id: 1,
    name: 'Иванова Айгерим',
    specialty: 'Терапевт',
    experience: 3,
    qualification: 'Высшая категория',
    image: '/images/doctor-placeholder.png',
    schedule: ['10:00 - 12:00', '14:00 - 16:00', '16:00 - 18:00']
  },
]

export default function DoctorList() {
  const [selected, setSelected] = useState<string[]>(['Терапевт'])

  const toggleSpecialty = (spec: string) => {
    setSelected((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    )
  }

  const filtered = DOCTORS.filter((d) => selected.includes(d.specialty))

  return (
    <div className="grid lg:grid-cols-[240px_1fr] gap-6">
      {/* Sidebar filter */}
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

      {/* Doctor cards */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filtered.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
      </motion.div>
    </div>
  )
}
