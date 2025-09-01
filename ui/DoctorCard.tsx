'use client'

import Image from 'next/image'
import { useState } from 'react'
import ModalDoctorBooking from './ModalDoctorBooking'
import ModalComplaint from './ModalComplaint'

type Doctor = {
  id: number
  name: string
  specialty: string
  experience: number
  qualification: string
  image: string
  schedule: string[]
}

export default function DoctorCard({ doctor }: { doctor: Doctor }) {
  const [bookingOpen, setBookingOpen] = useState(false)
  const [complainOpen, setComplainOpen] = useState(false)
  const [selectedTime, setSelectedTime] = useState('')

  return (
    <>
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-[#001759] font-[Inter]">
        <div className="mb-4">
          <div className="rounded-xl overflow-hidden mb-3">
            <Image
              src={doctor.image}
              alt={doctor.name}
              width={300}
              height={200}
              className="w-full h-auto object-cover"
            />
          </div>

          <h4 className="text-lg font-semibold mb-2">{doctor.name}</h4>

          <div className="flex gap-2 mb-2 text-sm font-semibold">
            <span className="bg-[#20B0B1] text-white px-3 py-1 rounded-md">
              {doctor.specialty}
            </span>
            <span className="bg-[#20B0B1] text-white px-3 py-1 rounded-md">
              Стаж: {doctor.experience} лет
            </span>
          </div>

          <div className="bg-[#20B0B1] text-white text-sm px-3 py-1 rounded-md inline-block font-semibold mb-3">
            {doctor.qualification}
          </div>

          <div className="text-sm font-semibold mb-1">Приёмы</div>
          <div className="text-xs text-slate-600 mb-1">Пн - Пт :</div>

          <div className="space-y-2">
            {doctor.schedule.map((time, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-sm"
              >
                <span>{time}</span>
                <button
                  onClick={() => {
                    setSelectedTime(time)
                    setBookingOpen(true)
                  }}
                  className="bg-[#20B0B1] hover:bg-[#1a9d9d] text-white px-3 py-1 rounded-md text-sm transition"
                >
                  Выбрать
                </button>
              </div>
            ))}
          </div>
        </div>

        <div
          onClick={() => setComplainOpen(true)}
          className="text-red-500 text-xs font-semibold mt-4 flex items-center gap-1 cursor-pointer hover:underline"
        >
          ❗ Пожаловаться на врача
        </div>
      </div>

      {/* Попап записи */}
      <ModalDoctorBooking
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        doctorName={doctor.name}
        time={selectedTime}
      />

      {/* Попап жалобы */}
      <ModalComplaint
        isOpen={complainOpen}
        onClose={() => setComplainOpen(false)}
        doctorName={doctor.name}
      />
    </>
  )
}
