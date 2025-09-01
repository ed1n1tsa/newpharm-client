import DoctorList from '@/ui/DoctorList'
import ServicesSection from '@/ui/ServicesSection'

export default function DoctorsPage() {
  return (
    <main className="min-h-screen pt-8 px-4 sm:px-8 pb-20">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">
        Врачи в Атырау — Offline
      </h1>

      {/* Фильтр + Список врачей */}
      <DoctorList />

      {/* CTA повторно + футер */}
      <div className="mt-16">
        <ServicesSection />
      </div>
    </main>
  )
}
