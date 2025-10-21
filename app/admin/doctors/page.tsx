import { supabaseServer } from '@/lib/supabase-server'

export default async function DoctorsPage() {
  const supabase = await supabaseServer()
  const { data: doctors } = await supabase
    .from('doctors')
    .select('id, full_name, specialization, experience, phone, is_online')

  return (
    <section className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Врачи</h1>
      <table className="min-w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Имя</th>
            <th className="border p-2">Специализация</th>
            <th className="border p-2">Опыт (лет)</th>
            <th className="border p-2">Телефон</th>
            <th className="border p-2">Онлайн</th>
          </tr>
        </thead>
        <tbody>
          {doctors?.map((d) => (
            <tr key={d.id}>
              <td className="border p-2">{d.full_name}</td>
              <td className="border p-2">{d.specialization}</td>
              <td className="border p-2">{d.experience}</td>
              <td className="border p-2">{d.phone}</td>
              <td className="border p-2">{d.is_online ? '✅' : '❌'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
