import { supabaseServer } from '@/lib/supabase-server'

export default async function CertificatesPage() {
  const supabase = await supabaseServer()
  const { data: certificates, error } = await supabase
    .from('certificates')
    .select('id, type, description, price, online_available')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Ошибка загрузки справок:', error.message)
    return (
      <div className="p-6 text-red-500">
        Ошибка загрузки справок: {error.message}
      </div>
    )
  }

  return (
    <section className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold text-teal-700">
          Медицинские справки
        </h1>
        <p className="text-gray-600 mt-1">
          Перечень доступных справок для оформления онлайн и оффлайн.
        </p>
      </header>

      {/* 💻 Десктопная версия */}
      <div className="hidden md:block overflow-x-auto border rounded-lg bg-white shadow-sm">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100 text-gray-700 text-sm">
            <tr>
              <th className="p-3 text-left">Тип</th>
              <th className="p-3 text-left">Описание</th>
              <th className="p-3 text-right">Цена</th>
              <th className="p-3 text-center">Онлайн</th>
            </tr>
          </thead>
          <tbody>
            {certificates?.map((c) => (
              <tr
                key={c.id}
                className="border-b hover:bg-teal-50 transition text-sm"
              >
                <td className="p-3 font-medium text-gray-800">{c.type}</td>
                <td className="p-3 text-gray-600">{c.description || '—'}</td>
                <td className="p-3 text-right font-semibold">
                  {c.price ? `${c.price} ₸` : '—'}
                </td>
                <td className="p-3 text-center">
                  {c.online_available ? (
                    <span className="bg-green-100 text-green-700 px-2 py-1 text-xs rounded-full font-medium">
                      Доступна
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-500 px-2 py-1 text-xs rounded-full font-medium">
                      Только оффлайн
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📱 Мобильная версия */}
      <div className="md:hidden grid grid-cols-1 gap-3">
        {certificates?.length ? (
          certificates.map((c) => (
            <div
              key={c.id}
              className="border rounded-lg bg-white shadow-sm p-4 flex flex-col"
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold text-gray-800">{c.type}</h3>
                {c.online_available && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    Онлайн
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {c.description || 'Без описания'}
              </p>
              <div className="text-right font-medium text-teal-600">
                {c.price ? `${c.price} ₸` : '—'}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm text-center">
            Пока нет медицинских справок.
          </p>
        )}
      </div>
    </section>
  )
}
