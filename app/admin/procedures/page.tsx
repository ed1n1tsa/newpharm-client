'use client'
import { useState, useEffect, Fragment } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Dialog, Transition } from '@headlessui/react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ProceduresPage() {
  const [procedures, setProcedures] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProcedures()
  }, [])

  async function loadProcedures() {
    setLoading(true)
    const { data, error } = await supabase
      .from('procedures')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) console.error('Ошибка загрузки процедур:', error.message)
    else setProcedures(data || [])
    setLoading(false)
  }

  if (loading)
    return <div className="p-6 text-gray-500">Загрузка процедур...</div>

  return (
    <section className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Процедурный кабинет</h1>

      {procedures.length === 0 ? (
        <p className="text-gray-500">Пока нет процедур.</p>
      ) : (
        <>
          {/* 💻 Таблица для десктопа */}
          <div className="hidden md:block overflow-x-auto border rounded-lg bg-white shadow-sm">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-100 text-gray-700 text-sm">
                <tr>
                  <th className="p-3 border text-left">Название</th>
                  <th className="p-3 border text-left">Цена</th>
                  <th className="p-3 border text-left">Длительность</th>
                  <th className="p-3 border text-left">Описание</th>
                </tr>
              </thead>

              <tbody>
                {procedures.map((proc) => (
                  <tr
                    key={proc.id}
                    onClick={() => setSelected(proc)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="p-3 border font-medium text-gray-800">
                      {proc.name}
                    </td>
                    <td className="p-3 border">{proc.price ? `${proc.price} ₸` : '—'}</td>
                    <td className="p-3 border">
                      {proc.duration
                        ? proc.duration.replace('00:', '').replace(':00', ' мин')
                        : '—'}
                    </td>
                    <td className="p-3 border text-gray-600 truncate max-w-[300px]">
                      {proc.description || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 📱 Карточки для мобильных */}
          <div className="grid gap-3 md:hidden">
            {procedures.map((proc) => (
              <div
                key={proc.id}
                onClick={() => setSelected(proc)}
                className="bg-white rounded-lg shadow-sm p-4 border hover:border-teal-500 transition cursor-pointer"
              >
                <div className="font-semibold text-teal-700 mb-1">
                  {proc.name}
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>
                    <span className="font-medium text-gray-700">Цена:</span>{' '}
                    {proc.price ? `${proc.price} ₸` : '—'}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Длительность:</span>{' '}
                    {proc.duration
                      ? proc.duration.replace('00:', '').replace(':00', ' мин')
                      : '—'}
                  </div>
                  {proc.description && (
                    <div>
                      <span className="font-medium text-gray-700">Описание:</span>{' '}
                      {proc.description.length > 50
                        ? proc.description.slice(0, 50) + '...'
                        : proc.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 🧾 Модалка */}
      <Transition appear show={!!selected} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setSelected(null)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
              <Dialog.Title className="text-lg font-semibold mb-4">
                {selected?.name}
              </Dialog.Title>

              {selected && (
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Цена:</span>{' '}
                    {selected.price ? `${selected.price} ₸` : '—'}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Длительность:</span>{' '}
                    {selected.duration
                      ? selected.duration.replace('00:', '').replace(':00', ' мин')
                      : '—'}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Описание:</span>
                    <p className="text-gray-600 mt-1 whitespace-pre-line">
                      {selected.description || '—'}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setSelected(null)}
                  className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
                >
                  Закрыть
                </button>
                <button
                  className="px-4 py-2 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-md"
                >
                  ✏️ Редактировать
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </section>
  )
}
