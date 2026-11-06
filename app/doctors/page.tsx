'use client'

import DoctorList from '@/ui/DoctorList'
import ServicesSection from '@/ui/ServicesSection'
import { useT } from '@/ui/LocaleProvider'

export default function DoctorsPage() {
  const t = useT()
  return (
    <main className="min-h-screen pt-8 px-4 sm:px-8 pb-20">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">
        {t('doctors.title')}
      </h1>

      <DoctorList />

      <div className="mt-16">
        <ServicesSection />
      </div>
    </main>
  )
}
