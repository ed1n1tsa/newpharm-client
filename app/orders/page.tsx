'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-admin'
import Image from 'next/image'

const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Подтверждение оплаты',
  packing: 'Упаковка товара',
  shipping: 'Отправление',
  in_transit: 'В пути',
  delivered: 'Доставлен'
}

interface Product {
  id: number
  title: string
  price: number
}

interface Order {
  id: number
  status: string
  total_price: number
  products?: Product[] // добавлен optional
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    const fetchOrders = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) return

      // 1. Получаем все заказы пользователя
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, status, total_price')
        .eq('user', user.id)

      if (ordersError || !ordersData) {
        console.error('Ошибка загрузки заказов:', ordersError)
        return
      }

      // 2. Для каждого заказа получаем все товары
      const ordersWithProducts = await Promise.all(
        ordersData.map(async (order) => {
          const { data: orderProducts, error: opErr } = await supabase
            .from('orders_products')
            .select('products_id')
            .eq('orders_id', order.id)

          if (opErr || !orderProducts || orderProducts.length === 0) {
            console.warn(`Нет товаров для заказа ${order.id}`)
            return {
              ...order,
              products: []
            }
          }

          const productIds = orderProducts.map((op) => op.products_id)

          const { data: productList, error: productErr } = await supabase
            .from('products')
            .select('id, title, price')
            .in('id', productIds)

          if (productErr || !productList) {
            console.warn(`Ошибка получения товаров заказа ${order.id}`, productErr)
            return {
              ...order,
              products: []
            }
          }

          return {
            ...order,
            products: productList
          }
        })
      )

      const validOrders = ordersWithProducts.filter(Boolean) as Order[]
      setOrders(validOrders)
    }

    fetchOrders()
  }, [])

  return (
    <main className="bg-[#111] text-white min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-10">Мои заказы</h1>

        {orders.length === 0 ? (
          <p>Заказы не найдены</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-[#1c1c1c] rounded-xl p-6 mb-6">
              {(order.products || []).map((product) => (
                <div key={product.id} className="flex gap-4 items-center mb-4">
                  <Image
                    src={`/phones/${product.id}.jpeg`}
                    alt={product.title}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-semibold">{product.title}</p>
                    <p className="text-sm">Количество: 1</p>
                    <p className="text-sm">Цена: {product.price.toLocaleString()} ₸</p>
                  </div>
                </div>
              ))}

              <div className="mt-4">
                <p className="text-white font-semibold text-lg">
                  Статус: {STATUS_LABELS[order.status] || order.status}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Общая сумма: {order.total_price.toLocaleString()} ₸
                </p>
              </div>

              <button
                className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition"
                onClick={() => window.location.reload()}
              >
                Обновить статус
              </button>
            </div>
          ))
        )}
      </div>
    </main>
  )
}
