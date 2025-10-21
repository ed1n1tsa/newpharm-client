'use client'

import Image from 'next/image'
import { useState } from 'react'
import ModalDoctorBooking from '../ModalDoctorBooking'
import ModalComplaint from '../ModalComplaint'


export default function DoctorCard({ doctor }: { doctor: any }) {
  const [bookingOpen, setBookingOpen] = useState(false)
  const [complainOpen, setComplainOpen] = useState(false)
  const [selectedTime, setSelectedTime] = useState('')

  const schedule = doctor.schedule || ['09:00', '10:00', '11:00']

  return (
    <>
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-[#001759] font-[Inter]">
        <div className="mb-4">
          <div className="rounded-xl overflow-hidden mb-3">
            <Image
              src={doctor.image || '/images/doctor-placeholder.png'}
              alt={doctor.name}
              width={300}
              height={200}
              className="w-full h-auto object-cover"
            />
          </div>

          <h4 className="text-lg font-semibold mb-2">{doctor.name}</h4>

          <div className="flex flex-wrap gap-2 mb-2 text-sm font-semibold">
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

          <div className="space-y-2">
            {schedule.map((time: string, i: number) => (
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

      <ModalDoctorBooking
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        doctorId={doctor.id}
        doctorName={doctor.name}
        time={selectedTime}
      />

      <ModalComplaint
        isOpen={complainOpen}
        onClose={() => setComplainOpen(false)}
        doctorName={doctor.name}
      />
    </>
  )
}
