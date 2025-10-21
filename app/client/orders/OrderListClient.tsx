'use client'

import { motion } from "framer-motion"
import Link from "next/link"
import { useState } from "react"
import { Package, Calendar, CreditCard, ArrowRight } from "lucide-react"

type Order = {
  id: string
  total: number
  payment_status: string
  status?: string
  created_at: string
}

export default function OrderListClient({ orders }: { orders: Order[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (orders.length === 0)
    return (
      <section className="min-h-screen flex flex-col items-center justify-center text-center text-gray-600">
        <Package className="w-12 h-12 mb-4 text-gray-400" />
        <p>У вас пока нет заказов</p>
        <Link
          href="/client/products"
          className="mt-4 px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition font-medium"
        >
          Перейти в аптеку
        </Link>
      </section>
    )

  return (
    <section className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Мои заказы</h1>

      <div className="space-y-4">
        {orders.map((order, idx) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Calendar size={16} />
                  {new Date(order.created_at).toLocaleDateString("ru-RU")}
                </p>
                <h2 className="text-lg font-semibold text-gray-800 mt-1">
                  Заказ #{order.id.slice(0, 8)}
                </h2>
              </div>

              <div className="mt-3 sm:mt-0 text-right">
                <p className="text-xl font-bold text-emerald-600">
                  {order.total?.toLocaleString("ru-RU")} ₸
                </p>
                <p
                  className={`text-sm ${
                    order.payment_status === "paid"
                      ? "text-emerald-500"
                      : "text-gray-500"
                  }`}
                >
                  {order.payment_status === "paid"
                    ? "Оплачено"
                    : "Не оплачено"}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <CreditCard size={16} /> Статус:{" "}
                {order.status || "Обрабатывается"}
              </p>
              <Link
                href={`/client/orders/${order.id}`}
                className="text-emerald-600 font-medium flex items-center gap-1 hover:underline"
              >
                Подробнее <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
