import { supabaseServer } from '@/lib/supabase-server'

export default async function IVTherapyPage() {
  const supabase = await supabaseServer()
  const { data: therapy, error } = await supabase
    .from('iv_therapy')
    .select('id, title, effect, price, description, image_url')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Ошибка загрузки IV-терапии:', error.message)
    return (
      <div className="p-6 text-red-500">
        Ошибка загрузки IV-терапии: {error.message}
      </div>
    )
  }

  return (
    <section className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold text-teal-700">
          IV-терапия
        </h1>
        <p className="text-gray-600 mt-1">
          Список доступных капельниц и терапевтических процедур.
        </p>
      </header>

      {/* 💻 Десктопная версия */}
      <div className="hidden md:block overflow-x-auto border rounded-lg bg-white shadow-sm">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100 text-gray-700 text-sm">
            <tr>
              <th className="p-3 text-left">Название</th>
              <th className="p-3 text-left">Эффект</th>
              <th className="p-3 text-right">Цена</th>
              <th className="p-3 text-left">Описание</th>
            </tr>
          </thead>
          <tbody>
            {therapy?.map((t) => (
              <tr
                key={t.id}
                className="border-b hover:bg-teal-50 transition text-sm"
              >
                <td className="p-3 font-medium text-gray-800">{t.title}</td>
                <td className="p-3 text-gray-600">{t.effect || '—'}</td>
                <td className="p-3 text-right font-semibold">
                  {t.price ? `${t.price} ₸` : '—'}
                </td>
                <td className="p-3 text-gray-600">{t.description || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📱 Мобильная версия */}
      <div className="md:hidden grid grid-cols-1 gap-3">
        {therapy?.length ? (
          therapy.map((t) => (
            <div
              key={t.id}
              className="border rounded-lg bg-white shadow-sm p-4 flex gap-3"
            >
              {t.image_url && (
                <img
                  src={t.image_url}
                  alt={t.title}
                  className="w-20 h-20 rounded object-cover"
                />
              )}
              <div className="flex-1 flex flex-col">
                <h3 className="font-semibold text-gray-800 text-sm mb-1">
                  {t.title}
                </h3>
                <p className="text-xs text-gray-500 mb-1">
                  {t.effect || 'Без описания'}
                </p>
                <p className="text-xs text-gray-500 flex-1">
                  {t.description || ''}
                </p>
                <div className="text-right text-sm font-medium text-teal-600 mt-2">
                  {t.price ? `${t.price} ₸` : '—'}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm text-center">
            Пока нет процедур IV-терапии.
          </p>
        )}
      </div>
    </section>
  )
}
