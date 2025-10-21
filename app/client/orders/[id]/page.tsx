'use client'

import React, { use, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { supabase } from "@/lib/supabase-browser"
import { Loader2 } from "lucide-react"

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // ✅ Разворачиваем Promise с params
  const { id } = use(params)

  const [order, setOrder] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrder()
  }, [])

  async function loadOrder() {
    try {
      const { data: orderData } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single()

      if (!orderData) {
        setLoading(false)
        return
      }

      const { data: orderItems } = await supabase
        .from("order_items")
        .select("quantity, products:product_id(name, image_url, price)")
        .eq("order_id", id)

      setOrder(orderData)
      setItems(orderItems || [])
    } catch (err) {
      console.error("Ошибка загрузки заказа:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-emerald-600" size={36} />
      </div>
    )

  if (!order)
    return (
      <div className="p-6 text-center text-gray-500">Заказ не найден</div>
    )

  const total = order.total?.toLocaleString("ru-RU") || "0"
  const deliveryCost = order.delivery_cost || 0
  const deliveryType =
    order.delivery_type === "pickup" ? "Самовывоз" : "Доставка"

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <Link
        href="/client/orders"
        className="text-emerald-600 text-sm hover:underline"
      >
        ← Назад к заказам
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-4">
        Заказ <span className="text-gray-600">#{order.id.slice(0, 8)}</span>
      </h1>

      <p className="text-gray-500 text-sm mb-2">
        {new Date(order.created_at).toLocaleDateString("ru-RU")} •{" "}
        {order.payment_status === "paid" ? "Оплачен" : "Не оплачен"}
      </p>

      {/* Список товаров */}
      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-4 border-b pb-3 last:border-none">
            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={item.products.image_url || "/images/product.png"}
                alt={item.products.name}
                width={64}
                height={64}
                className="object-contain w-full h-full"
              />
            </div>
            <div className="flex-1">
              <p className="font-medium">{item.products.name}</p>
              <p className="text-sm text-gray-500">Кол-во: {item.quantity}</p>
            </div>
            <p className="font-semibold text-emerald-600">
              {(item.products.price * item.quantity).toLocaleString("ru-RU")} ₸
            </p>
          </div>
        ))}
      </div>

      {/* Информация о заказе */}
      <div className="mt-6 text-sm text-gray-700 space-y-2">
        <p>
          <span className="font-semibold">Тип доставки:</span> {deliveryType}
        </p>
        {deliveryType === "Доставка" && (
          <p>
            <span className="font-semibold">Адрес:</span>{" "}
            {order.delivery_address}
          </p>
        )}
        <p>
          <span className="font-semibold">Стоимость доставки:</span>{" "}
          {deliveryCost.toLocaleString("ru-RU")} ₸
        </p>
      </div>

      <p className="mt-4 text-xl font-bold text-emerald-600">
        Итого: {total} ₸
      </p>

      {/* Кнопка WhatsApp */}
      <a
        href={`https://wa.me/77087039918?text=${encodeURIComponent(
          `Здравствуйте! Я по поводу заказа №${order.id.slice(0, 8)}.`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-xl font-semibold transition"
      >
        <Image
          src="/icons/whatsapp.png"
          alt="WhatsApp"
          width={20}
          height={20}
          className="object-contain"
        />
        Написать в WhatsApp
      </a>
    </main>
  )
}
