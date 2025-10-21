import { supabaseServer } from '@/lib/supabase-server'
import DoctorList from './components/DoctorList'

export default async function DoctorsPage() {
  const supabase = await supabaseServer()

  const { data: doctors, error } = await supabase
    .from('doctors')
    .select('id, full_name, specialization, experience, qualification, photo_url, is_online, type, price')
    .order('specialization', { ascending: true })

  if (error) {
    console.error('Ошибка загрузки врачей:', error.message)
  }

  return (
    <main className="min-h-screen pt-8 px-4 sm:px-8 pb-20">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">
        Врачи в Атырау — Offline
      </h1>

      <DoctorList doctors={doctors || []} />
    </main>
  )
}
