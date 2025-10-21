'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        customer_name,
        customer_phone,
        payment_status,
        delivery_type,
        total,
        order_items (
          quantity,
          price,
          products (name)
        )
      `)
      .order('created_at', { ascending: false })
    if (error) console.error('Ошибка загрузки заказов:', error.message)
    else setOrders(data || [])
    setLoading(false)
  }

  async function markAsPaid(orderId: string) {
    setUpdating(true)
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: 'paid' })
      .eq('id', orderId)
    if (!error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, payment_status: 'paid' } : o))
      )
      setSelected(null)
    }
    setUpdating(false)
  }

  if (loading)
    return <div className="p-6 text-gray-500">Загрузка заказов...</div>

  return (
    <section className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Заказы</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">Пока нет заказов.</p>
      ) : (
        <>
          {/* 💻 Десктопная таблица */}
          <div className="hidden md:block overflow-x-auto border rounded-lg bg-white shadow-sm">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-100 text-gray-700 text-sm">
                <tr>
                  <th className="p-3 border text-left">№</th>
                  <th className="p-3 border text-left">Дата</th>
                  <th className="p-3 border text-left">Клиент</th>
                  <th className="p-3 border text-left">Телефон</th>
                  <th className="p-3 border text-left">Тип доставки</th>
                  <th className="p-3 border text-right">Сумма</th>
                  <th className="p-3 border text-center">Статус</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order, i) => (
                  <tr
                    key={order.id}
                    onClick={() => setSelected(order)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="p-3 border">{i + 1}</td>
                    <td className="p-3 border">
                      {new Date(order.created_at).toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-3 border font-medium text-gray-800">
                      {order.customer_name || '—'}
                    </td>
                    <td className="p-3 border">{order.customer_phone || '—'}</td>
                    <td className="p-3 border">{order.delivery_type || '—'}</td>
                    <td className="p-3 border text-right font-semibold">
                      {order.total} ₸
                    </td>
                    <td className="p-3 border text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          order.payment_status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : order.payment_status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {order.payment_status || 'Неизвестно'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 📱 Мобильные карточки */}
          <div className="grid gap-3 md:hidden">
            {orders.map((order, i) => (
              <div
                key={order.id}
                onClick={() => setSelected(order)}
                className="bg-white rounded-lg shadow-sm p-4 border hover:border-teal-500 transition cursor-pointer"
              >
                <div className="flex justify-between mb-2">
                  <div className="font-semibold text-teal-700">
                    Заказ №{i + 1}
                  </div>
                  <div
                    className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                      order.payment_status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : order.payment_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {order.payment_status || 'Неизвестно'}
                  </div>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <div>
                    <span className="font-medium text-gray-700">Дата:</span>{' '}
                    {new Date(order.created_at).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Клиент:</span>{' '}
                    {order.customer_name || '—'}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Телефон:</span>{' '}
                    {order.customer_phone || '—'}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Сумма:</span>{' '}
                    <b>{order.total} ₸</b>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 💬 Модалка slide-over справа */}
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
                        Детали заказа
                      </Dialog.Title>

                      {selected && (
                        <div className="space-y-3 text-sm flex-1 overflow-y-auto">
                          <div>
                            <span className="font-medium text-gray-700">Дата:</span>{' '}
                            {new Date(selected.created_at).toLocaleString('ru-RU')}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Клиент:</span>{' '}
                            {selected.customer_name}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Телефон:</span>{' '}
                            {selected.customer_phone}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Тип доставки:</span>{' '}
                            {selected.delivery_type}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Сумма:</span>{' '}
                            <b>{selected.total} ₸</b>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Состав заказа:</span>
                            <ul className="list-disc ml-6 mt-1">
                              {selected.order_items?.map((item: any, i: number) => (
                                <li key={i}>
                                  {item.products?.name} — {item.quantity} × {item.price} ₸
                                </li>
                              ))}
                            </ul>
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
                          onClick={() => markAsPaid(selected.id)}
                          disabled={updating || selected?.payment_status === 'paid'}
                          className={`px-4 py-2 text-sm rounded-md text-white ${
                            selected?.payment_status === 'paid'
                              ? 'bg-green-400 cursor-not-allowed'
                              : 'bg-teal-600 hover:bg-teal-700'
                          }`}
                        >
                          {updating ? 'Сохраняю...' : 'Отметить как оплачено'}
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
