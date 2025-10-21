'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase-admin'
import Image from 'next/image'

interface Product {
  id: number
  title: string
  price: number
}

export default function CheckoutContent() {
  const searchParams = useSearchParams()
  const productId = searchParams.get('product')
  const quantity = Number(searchParams.get('quantity')) || 1

  const [product, setProduct] = useState<Product | null>(null)
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    city: '',
    region: '',
    street: '',
    house_number: '',
    apartment_number: '',
  })

  useEffect(() => {
    if (!productId) return

    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, price')
        .eq('id', productId)
        .single()

      if (error) {
        console.error('Ошибка получения товара:', error)
        return
      }

      setProduct(data)
    }

    fetchProduct()
  }, [productId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleOrder = async () => {
    if (!product) return
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return alert('Вы не авторизованы')

    // 1. создаём заказ
    const { data: insertedOrder, error: insertError } = await supabase
      .from('orders')
      .insert([
        {
          user: user.id,
          total_price: product.price * quantity,
          status: 'pending_payment',
          payment_method: 'WhatsApp',
          delivery_code: '',
          ...form
        }
      ])
      .select()
      .single()

    if (insertError || !insertedOrder) {
      console.error('Ошибка при создании заказа:', insertError)
      alert('Ошибка при создании заказа')
      return
    }

    // 2. создаём связь заказ <-> товар
    const { error: relationError } = await supabase.from('orders_products').insert([
      {
        orders_id: insertedOrder.id,
        products_id: product.id
      }
    ])

    if (relationError) {
      console.error('Ошибка при создании связи заказа и товара:', relationError)
      alert('Ошибка при сохранении товара в заказе')
      return
    }

    // 3. Создаем сообщение для WhatsApp
    const message = `Хочу купить товар:\n\nНазвание: ${product.title}\nЦена: ${product.price} ₸\nКоличество: ${quantity}\n\nДанные покупателя:\nИмя: ${form.first_name}\nФамилия: ${form.last_name}\nТелефон: ${form.phone}\nГород: ${form.city}\nРайон: ${form.region}\nУлица: ${form.street}\nДом: ${form.house_number}\nКвартира: ${form.apartment_number}`

    // 4. Формируем ссылку для WhatsApp с сообщением
    const whatsappLink = `https://wa.me/7016688803?text=${encodeURIComponent(message)}`

    // 5. Переход в чат WhatsApp
    window.location.href = whatsappLink
  }

  return (
    <main className="bg-[#111] text-white px-4 py-10 min-h-screen">
      <div className="max-w-xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold">Оформить заказ</h1>

        {product && (
          <div className="flex items-center gap-4">
            <Image
              src={`/phones/${product.id}.jpeg`}
              alt={product.title}
              width={96}
              height={96}
              className="w-24 h-24 rounded-lg object-cover"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement
                target.src = '/phones/fallback-image.png'
              }}
            />
            <div>
              <p className="font-semibold">{product.title}</p>
              <p>Количество: {quantity}</p>
              <p className="font-medium mt-1 text-white">
                Сумма: {product.price * quantity} ₸
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Заполните ниже данные</h2>
          {[ 
            ['Имя', 'first_name'],
            ['Фамилия', 'last_name'],
            ['Почта', 'email'],
            ['Номер телефона', 'phone'],
            ['Город', 'city'],
            ['Район', 'region'],
            ['Улица', 'street'],
            ['Дом', 'house_number'],
            ['Квартира', 'apartment_number'],
          ].map(([label, name]) => (
            <input
              key={name}
              name={name}
              placeholder={label}
              value={form[name as keyof typeof form]}
              onChange={handleChange}
              className="w-full bg-[#333] rounded-md px-4 py-2 text-sm text-white placeholder-gray-400"
            />
          ))}
        </div>

        <button
          onClick={handleOrder}
          className="bg-red-600 hover:bg-red-700 w-full py-3 rounded-md text-white font-bold transition"
        >
          Перейти в WhatsApp для оформления
        </button>
      </div>
    </main>
  )
}
