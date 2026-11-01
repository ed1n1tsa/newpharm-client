'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/ui/CartContext'
import PhoneAuthPanel from '@/ui/PhoneAuthPanel'
import { supabase } from '@/lib/supabase-browser'
import {
  pharmacyDisplayName,
  type WarehouseFit,
} from '@/lib/pharmacy'
import { formatPhoneDisplay } from '@/lib/phone'

type DeliveryType = 'pickup' | 'delivery'

export default function CheckoutContent() {
  const router = useRouter()
  const { items, total, clear, setQty, remove, ready } = useCart()
  const [userId, setUserId] = useState<string | null>(null)
  const [phone, setPhone] = useState('')
  const [fullName, setFullName] = useState('')
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('pickup')
  const [address, setAddress] = useState('')
  const [warehouseId, setWarehouseId] = useState<string | null>(null)
  const [fits, setFits] = useState<WarehouseFit[]>([])
  const [loadingAvail, setLoadingAvail] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)

  const deliveryCost = deliveryType === 'delivery' ? 1000 : 0
  const grandTotal = total + deliveryCost

  const selectedFit = useMemo(
    () => fits.find((f) => f.warehouse.id === warehouseId) || fits[0] || null,
    [fits, warehouseId]
  )

  const shortfallLines = useMemo(() => {
    if (!selectedFit) return []
    return selectedFit.lines.filter((l) => l.shortfall > 0)
  }, [selectedFit])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user
      if (u) {
        setUserId(u.id)
        setPhone(u.user_metadata?.phone || u.phone || '')
        setFullName(u.user_metadata?.full_name || '')
      }
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user
      setUserId(u?.id ?? null)
      if (u) {
        setPhone(u.user_metadata?.phone || u.phone || '')
        setFullName((prev) => prev || u.user_metadata?.full_name || '')
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const loadAvailability = useCallback(async () => {
    if (!items.length) {
      setFits([])
      return
    }
    setLoadingAvail(true)
    try {
      const res = await fetch('/api/pharmacies/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || 'Ошибка остатков')
      setFits(data.warehouses || [])
      setWarehouseId((prev) => prev || data.recommendedWarehouseId)
    } catch (err: any) {
      setError(err?.message || 'Не удалось загрузить аптеки')
    } finally {
      setLoadingAvail(false)
    }
  }, [items])

  useEffect(() => {
    loadAvailability()
  }, [loadAvailability])

  async function placeOrder() {
    setError(null)
    setMessage(null)
    if (!userId) {
      setError('Сначала войдите по телефону')
      return
    }
    if (!warehouseId) {
      setError('Выберите аптеку')
      return
    }
    if (shortfallLines.length) {
      setError('Исправьте позиции с нехваткой или смените аптеку')
      return
    }
    if (deliveryType === 'delivery' && !address.trim()) {
      setError('Укажите адрес доставки')
      return
    }

    setSubmitting(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) throw new Error('Сессия истекла — войдите снова')

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            qty: i.qty,
            price: i.price,
            name: i.name,
          })),
          warehouse_id: warehouseId,
          delivery_type: deliveryType,
          delivery_address: address.trim(),
          delivery_cost: deliveryCost,
          customer_name: fullName.trim(),
          customer_phone: phone,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        if (data.shortfalls) {
          setError('В выбранной аптеке не хватает товаров — уменьшите количество или смените аптеку')
          await loadAvailability()
        }
        throw new Error(data.error || 'Не удалось создать заказ')
      }
      setOrderId(data.order.id)
      setMessage('Заказ принят. Оплата онлайн не требуется — заберите или дождитесь доставки.')
      clear()
    } catch (err: any) {
      setError(err?.message || 'Ошибка оформления')
    } finally {
      setSubmitting(false)
    }
  }

  if (!ready) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-500">
        Загрузка…
      </div>
    )
  }

  if (orderId) {
    return (
      <main className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-emerald-700">Заказ оформлен</h1>
        <p className="text-slate-600">{message}</p>
        <p className="text-sm text-slate-500">Номер: {orderId}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/client/orders"
            className="rounded-xl bg-emerald-500 text-white px-5 py-2.5 font-semibold"
          >
            Мои заказы
          </Link>
          <Link
            href="/catalog"
            className="rounded-xl border border-slate-200 px-5 py-2.5 font-semibold"
          >
            В каталог
          </Link>
        </div>
      </main>
    )
  }

  if (!items.length) {
    return (
      <main className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-3">Нечего оформлять</h1>
        <p className="text-slate-500 mb-6">Добавьте товары в корзину</p>
        <Link href="/catalog" className="text-emerald-600 font-semibold">
          Перейти в каталог
        </Link>
      </main>
    )
  }

  const nameById = new Map(items.map((i) => [i.productId, i.name]))

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 pb-28 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Оформление заказа</h1>
        <Link href="/cart" className="text-sm text-emerald-600 hover:underline">
          ← Корзина
        </Link>
      </div>

      {/* Items summary */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <h2 className="font-semibold text-lg">Ваш заказ</h2>
        {items.map((item) => (
          <div key={item.productId} className="flex gap-3 items-center">
            <div className="w-14 h-14 bg-slate-100 rounded-lg overflow-hidden shrink-0">
              <Image
                src={item.image_url || '/images/product.png'}
                alt={item.name}
                width={56}
                height={56}
                className="object-contain w-full h-full"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-2">{item.name}</p>
              <p className="text-xs text-slate-500">
                {item.qty} × {item.price.toLocaleString('ru-RU')} ₸
              </p>
            </div>
            <p className="text-sm font-semibold text-emerald-700">
              {(item.qty * item.price).toLocaleString('ru-RU')} ₸
            </p>
          </div>
        ))}
      </section>

      {/* Auth */}
      {!userId ? (
        <PhoneAuthPanel
          initialPhone={phone}
          onAuthenticated={({ phone: p, fullName: n }) => {
            setPhone(p)
            if (n) setFullName(n)
            setUserId('pending')
            supabase.auth.getUser().then(({ data }) => {
              setUserId(data.user?.id ?? null)
            })
          }}
        />
      ) : (
        <section className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 space-y-3">
          <h2 className="font-semibold text-lg">Покупатель</h2>
          <p className="text-sm text-slate-700">
            Телефон: <strong>{formatPhoneDisplay(phone) || phone}</strong>
          </p>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Имя"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-500 bg-white"
          />
        </section>
      )}

      {/* Delivery */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <h2 className="font-semibold text-lg">Способ получения</h2>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setDeliveryType('pickup')}
            className={`px-4 py-2 rounded-xl border font-medium ${
              deliveryType === 'pickup'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-slate-200'
            }`}
          >
            Самовывоз
          </button>
          <button
            type="button"
            onClick={() => setDeliveryType('delivery')}
            className={`px-4 py-2 rounded-xl border font-medium ${
              deliveryType === 'delivery'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-slate-200'
            }`}
          >
            Доставка
          </button>
        </div>
        {deliveryType === 'delivery' && (
          <div>
            <label className="block text-sm text-slate-600 mb-1">Адрес доставки</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              placeholder="Город, улица, дом, квартира"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Стоимость доставки: {deliveryCost.toLocaleString('ru-RU')} ₸ (оплата при получении)
            </p>
          </div>
        )}
      </section>

      {/* Pharmacy */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold text-lg">
            {deliveryType === 'pickup' ? 'Аптека самовывоза' : 'Аптека отгрузки'}
          </h2>
          {loadingAvail && (
            <span className="text-xs text-slate-400">Обновляем остатки…</span>
          )}
        </div>
        <p className="text-sm text-slate-500">
          Одна аптека на весь заказ. Автовыбор — где корзина лучше закрывается по наличию.
        </p>

        <div className="space-y-2">
          {fits.map((fit) => {
            const active = fit.warehouse.id === warehouseId
            return (
              <button
                key={fit.warehouse.id}
                type="button"
                onClick={() => setWarehouseId(fit.warehouse.id)}
                className={`w-full text-left rounded-xl border px-4 py-3 transition ${
                  active
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {pharmacyDisplayName(fit.warehouse.name)}
                    </p>
                    {fit.warehouse.address && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {fit.warehouse.address}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      В наличии позиций: {fit.coveredLines} из {fit.totalLines}
                      {' · '}
                      штук: {fit.coveredUnits} из {fit.totalUnits}
                    </p>
                  </div>
                  {fit.fullyCovers ? (
                    <span className="text-xs font-semibold text-emerald-600 shrink-0">
                      Всё есть
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-amber-600 shrink-0">
                      Частично
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {shortfallLines.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
            <p className="font-medium text-amber-900">
              В этой аптеке не хватает:
            </p>
            {shortfallLines.map((line) => {
              const item = items.find((i) => i.productId === line.productId)
              return (
                <div
                  key={line.productId}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between text-sm"
                >
                  <div>
                    <p className="font-medium text-slate-800">
                      {nameById.get(line.productId) || line.productId}
                    </p>
                    <p className="text-slate-600">
                      Нужно {line.requested}, есть {line.available}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {line.available > 0 && item && (
                      <button
                        type="button"
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium"
                        onClick={() => setQty(line.productId, line.available)}
                      >
                        Уменьшить до {line.available}
                      </button>
                    )}
                    <button
                      type="button"
                      className="rounded-lg border border-red-200 text-red-600 px-3 py-1.5 text-xs font-medium"
                      onClick={() => remove(line.productId)}
                    >
                      Убрать
                    </button>
                  </div>
                </div>
              )
            })}
            <p className="text-xs text-amber-800">
              Или выберите другую аптеку выше.
            </p>
          </div>
        )}
      </section>

      {error && (
        <div className="rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-xl bg-emerald-50 text-emerald-700 px-4 py-3 text-sm">
          {message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t pt-6">
        <div>
          <p className="text-xl font-bold text-emerald-700">
            Итого: {grandTotal.toLocaleString('ru-RU')} ₸
          </p>
          <p className="text-xs text-slate-500">Без онлайн-оплаты</p>
        </div>
        <button
          type="button"
          disabled={submitting || !userId || shortfallLines.length > 0}
          onClick={placeOrder}
          className="rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white px-6 py-3 font-semibold"
        >
          {submitting ? 'Оформляем…' : 'Подтвердить заказ'}
        </button>
      </div>
    </main>
  )
}
