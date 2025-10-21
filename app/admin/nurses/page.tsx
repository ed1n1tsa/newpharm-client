'use client'
import { useState, useEffect, Fragment } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Dialog, Transition } from '@headlessui/react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function NurseCallsPage() {
  const [calls, setCalls] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCalls()
  }, [])

  async function loadCalls() {
    setLoading(true)
    const { data, error } = await supabase
      .from('nurse_calls')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) console.error('Ошибка загрузки вызовов:', error.message)
    else setCalls(data || [])
    setLoading(false)
  }

  if (loading)
    return <div className="p-6 text-gray-500">Загрузка вызовов...</div>

  return (
    <section className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Вызовы медсестёр</h1>

      {calls.length === 0 ? (
        <p className="text-gray-500">Пока нет вызовов.</p>
      ) : (
        <>
          {/* 💻 Таблица для десктопа */}
          <div className="hidden md:block overflow-x-auto border rounded-lg bg-white shadow-sm">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-100 text-gray-700 text-sm">
                <tr>
                  <th className="p-3 border text-left">Пациент</th>
                  <th className="p-3 border text-left">Адрес</th>
                  <th className="p-3 border text-left">Телефон</th>
                  <th className="p-3 border text-left">Время</th>
                  <th className="p-3 border text-left">Процедуры</th>
                  <th className="p-3 border text-center">Статус</th>
                </tr>
              </thead>

              <tbody>
                {calls.map((call) => (
                  <tr
                    key={call.id}
                    onClick={() => setSelected(call)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="p-3 border font-medium text-gray-800">
                      {call.patient_name}
                    </td>
                    <td className="p-3 border">{call.address}</td>
                    <td className="p-3 border">{call.phone}</td>
                    <td className="p-3 border">
                      {new Date(call.scheduled_time).toLocaleString('ru-RU')}
                    </td>
                    <td className="p-3 border text-sm text-gray-600">
                      {Array.isArray(call.procedures)
                        ? call.procedures.join(', ')
                        : call.procedures}
                    </td>
                    <td className="p-3 border text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          call.status === 'done'
                            ? 'bg-green-100 text-green-700'
                            : call.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {call.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 📱 Карточки для мобильных */}
          <div className="grid gap-3 md:hidden">
            {calls.map((call) => (
              <div
                key={call.id}
                onClick={() => setSelected(call)}
                className="bg-white rounded-lg shadow-sm p-4 border hover:border-teal-500 transition cursor-pointer"
              >
                <div className="flex justify-between mb-2">
                  <div className="font-semibold text-teal-700">
                    {call.patient_name}
                  </div>
                  <div
                    className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                      call.status === 'done'
                        ? 'bg-green-100 text-green-700'
                        : call.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {call.status}
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>
                    <span className="font-medium text-gray-700">Адрес:</span>{' '}
                    {call.address}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Телефон:</span>{' '}
                    {call.phone}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Время:</span>{' '}
                    {new Date(call.scheduled_time).toLocaleTimeString('ru-RU')}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Процедуры:</span>{' '}
                    {Array.isArray(call.procedures)
                      ? call.procedures.join(', ')
                      : call.procedures}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 🩺 Slide-over модалка деталей вызова */}
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

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-300"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-300"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="w-screen max-w-md bg-white shadow-xl">
                    <div className="p-6 flex flex-col h-full">
                      <Dialog.Title className="text-lg font-semibold mb-4">
                        Детали вызова
                      </Dialog.Title>

                      {selected && (
                        <div className="space-y-3 text-sm flex-1 overflow-y-auto">
                          <div>
                            <span className="font-medium text-gray-700">
                              Пациент:
                            </span>{' '}
                            {selected.patient_name}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Телефон:
                            </span>{' '}
                            {selected.phone}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Адрес:
                            </span>{' '}
                            {selected.address}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Время:
                            </span>{' '}
                            {new Date(selected.scheduled_time).toLocaleString('ru-RU')}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Процедуры:
                            </span>{' '}
                            {Array.isArray(selected.procedures)
                              ? selected.procedures.join(', ')
                              : selected.procedures}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Сумма:
                            </span>{' '}
                            <b>{selected.total_price} ₸</b>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Статус:
                            </span>{' '}
                            {selected.status}
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
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    </section>
  )
}
