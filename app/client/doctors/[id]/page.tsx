'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase-browser'
import ModalDoctorBooking from '../ModalDoctorBooking'

export default function DoctorDetailsPage({ params }: { params: { id: string } }) {
  const [doctor, setDoctor] = useState<any>(null)
  const [schedule, setSchedule] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedDate, setSelectedDate] = useState('')

  useEffect(() => {
    loadDoctor()
  }, [params.id])

  async function loadDoctor() {
    try {
      setLoading(true)
      const { data: doctorData } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', params.id)
        .single()

      const { data: scheduleData } = await supabase
        .from('doctor_schedule')
        .select('work_day, time_slots')
        .eq('doctor_id', params.id)
        .order('work_day', { ascending: true })

      setDoctor(doctorData)
      setSchedule(scheduleData || [])
    } catch (err) {
      console.error('Ошибка загрузки врача:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Загрузка...
      </div>
    )

  if (!doctor)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Врач не найден
      </div>
    )

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 text-[#001759] font-[Inter]">
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
        <Image
          src={doctor.photo_url || '/images/doctor-placeholder.png'}
          alt={doctor.full_name}
          width={500}
          height={300}
          className="w-full h-auto rounded-xl object-cover mb-5"
        />

        <h1 className="text-2xl font-bold mb-2">{doctor.full_name}</h1>
        <p className="text-[#20B0B1] font-semibold mb-2">
          {doctor.specialization}
        </p>

        <p className="text-sm mb-2">
          <b>Стаж:</b> {doctor.experience} лет
        </p>
        <p className="text-sm mb-3">
          <b>Квалификация:</b> {doctor.qualification}
        </p>

        <p className="text-sm mb-5">{doctor.description}</p>

        <h3 className="text-lg font-semibold mb-3">Расписание приёмов</h3>

        <div className="space-y-3">
          {schedule.map((day, i) => (
            <div
              key={i}
              className="p-3 border rounded-xl bg-slate-50 shadow-sm"
            >
              <p className="font-semibold text-sm mb-2">
                {new Date(day.work_day).toLocaleDateString('ru-RU', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </p>
              <div className="flex flex-wrap gap-2">
                {day.time_slots.map((time: string) => (
                  <button
                    key={time}
                    onClick={() => {
                      setSelectedDate(day.work_day)
                      setSelectedTime(time)
                      setBookingOpen(true)
                    }}
                    className="px-3 py-1 bg-[#20B0B1] hover:bg-[#1a9d9d] text-white text-sm rounded-md"
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ModalDoctorBooking
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        doctorId={doctor.id}
        doctorName={doctor.full_name}
        date={selectedDate}
        time={selectedTime}
      />
    </main>
  )
}
