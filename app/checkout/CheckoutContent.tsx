'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  MapPin,
  Pencil,
} from 'lucide-react'
import { useCart } from '@/ui/CartContext'
import PhoneAuthPanel from '@/ui/PhoneAuthPanel'
import { supabase } from '@/lib/supabase-browser'
import { pharmacyDisplayName, type WarehouseFit } from '@/lib/pharmacy'
import { formatPhoneDisplay } from '@/lib/phone'
import {
  DeliveryType,
  formatMoney,
  readCheckoutPrefs,
  writeCheckoutPrefs,
} from '@/lib/checkout-prefs'

type Step = 1 | 2 | 3

export default function CheckoutContent() {
  const { items, total, clear, setQty, remove, ready } = useCart()
  const [step, setStep] = useState<Step>(1)
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
  const [prefsReady, setPrefsReady] = useState(false)

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
    const prefs = readCheckoutPrefs()
    setDeliveryType(prefs.deliveryType)
    setWarehouseId(prefs.warehouseId)
    setAddress(prefs.address)
    setPrefsReady(true)
  }, [])

  useEffect(() => {
    if (!prefsReady) return
    writeCheckoutPrefs({ deliveryType, warehouseId, address })
  }, [deliveryType, warehouseId, address, prefsReady])

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
      setError('Сначала подтвердите телефон')
      setStep(2)
      return
    }
    if (!warehouseId) {
      setError('Выберите аптеку')
      setStep(1)
      return
    }
    if (shortfallLines.length) {
      setError('Исправьте позиции с нехваткой или смените аптеку')
      setStep(1)
      return
    }
    if (deliveryType === 'delivery' && !address.trim()) {
      setError('Укажите адрес доставки')
      setStep(1)
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
          setError(
            'В выбранной аптеке не хватает товаров — уменьшите количество или смените аптеку'
          )
          await loadAvailability()
          setStep(1)
        }
        throw new Error(data.error || 'Не удалось создать заказ')
      }
      setOrderId(data.order.id)
      setMessage(
        'Заказ принят. Оплата онлайн не требуется — заберите или дождитесь доставки.'
      )
      clear()
    } catch (err: any) {
      setError(err?.message || 'Ошибка оформления')
    } finally {
      setSubmitting(false)
    }
  }

  function canContinueFromStep1() {
    if (!warehouseId && !selectedFit) return false
    if (shortfallLines.length) return false
    if (deliveryType === 'delivery' && !address.trim()) return false
    return true
  }

  function goNext() {
    setError(null)
    if (step === 1) {
      if (!canContinueFromStep1()) {
        setError(
          deliveryType === 'delivery' && !address.trim()
            ? 'Укажите адрес доставки'
            : shortfallLines.length
              ? 'Исправьте нехватку товаров или смените аптеку'
              : 'Выберите аптеку'
        )
        return
      }
      if (!warehouseId && selectedFit) setWarehouseId(selectedFit.warehouse.id)
      setStep(2)
      return
    }
    if (step === 2) {
      if (!userId) {
        setError('Подтвердите телефон, чтобы продолжить')
        return
      }
      setStep(3)
    }
  }

  if (!ready) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-500 bg-[#f6f7f8]">
        Загрузка…
      </div>
    )
  }

  if (orderId) {
    return (
      <main className="max-w-lg mx-auto px-4 py-16 text-center space-y-4 bg-[#f6f7f8] min-h-[60vh]">
        <div className="mx-auto size-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
          <Check size={28} />
        </div>
        <h1 className="text-2xl font-bold text-emerald-800">Заказ оформлен</h1>
        <p className="text-slate-600">{message}</p>
        <p className="text-sm text-slate-500">Номер: {orderId}</p>
        <p className="text-sm text-slate-500">Оплата: на кассе при получении</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/client/orders"
            className="rounded-xl bg-emerald-700 text-white px-5 py-2.5 font-semibold"
          >
            Мои заказы
          </Link>
          <Link
            href="/catalog"
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 font-semibold"
          >
            В каталог
          </Link>
        </div>
      </main>
    )
  }

  if (!items.length) {
    return (
      <main className="max-w-xl mx-auto px-4 py-16 text-center bg-[#f6f7f8] min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-3">Нечего оформлять</h1>
        <p className="text-slate-500 mb-6">Добавьте товары в корзину</p>
        <Link href="/catalog" className="text-emerald-700 font-semibold">
          Перейти в каталог
        </Link>
      </main>
    )
  }

  const nameById = new Map(items.map((i) => [i.productId, i.name]))

  const stepsMeta: { id: Step; title: string }[] = [
    {
      id: 1,
      title:
        deliveryType === 'pickup' ? 'Аптека самовывоза' : 'Доставка и аптека',
    },
    { id: 2, title: 'Контактные данные' },
    { id: 3, title: 'Подтверждение заказа' },
  ]

  return (
    <div className="bg-[#f6f7f8] min-h-[70vh]">
      <main className="max-w-xl mx-auto px-4 py-6 pb-36">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href={step === 1 ? '/cart' : '#'}
            onClick={(e) => {
              if (step !== 1) {
                e.preventDefault()
                setStep((s) => (s > 1 ? ((s - 1) as Step) : s))
              }
            }}
            className="inline-flex size-9 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-700"
            aria-label="Назад"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {step === 3 ? 'Ваш заказ' : 'Оформление заказа'}
            </h1>
            <p className="text-xs text-slate-500">Шаг {step} из 3</p>
          </div>
        </div>

        {/* Stepper accordion */}
        <div className="space-y-3">
          {stepsMeta.map((meta) => {
            const open = step === meta.id
            const done = step > meta.id
            return (
              <section
                key={meta.id}
                className={`rounded-2xl border bg-white shadow-sm overflow-hidden ${
                  open ? 'border-emerald-600' : 'border-slate-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (done || open) setStep(meta.id)
                  }}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left"
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`size-7 rounded-full text-xs font-bold flex items-center justify-center ${
                        done
                          ? 'bg-emerald-700 text-white'
                          : open
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {done ? <Check size={14} /> : meta.id}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {meta.title}
                    </span>
                  </span>
                  {open ? (
                    <ChevronUp size={18} className="text-slate-400" />
                  ) : (
                    <ChevronDown size={18} className="text-slate-400" />
                  )}
                </button>

                {open && meta.id === 1 && (
                  <div className="px-4 pb-4 space-y-4 border-t border-slate-100 pt-4">
                    <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100">
                      <button
                        type="button"
                        onClick={() => setDeliveryType('pickup')}
                        className={`rounded-lg py-2 text-sm font-semibold ${
                          deliveryType === 'pickup'
                            ? 'bg-white text-emerald-800 shadow-sm'
                            : 'text-slate-500'
                        }`}
                      >
                        Самовывоз
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryType('delivery')}
                        className={`rounded-lg py-2 text-sm font-semibold ${
                          deliveryType === 'delivery'
                            ? 'bg-white text-emerald-800 shadow-sm'
                            : 'text-slate-500'
                        }`}
                      >
                        Доставка
                      </button>
                    </div>

                    {deliveryType === 'delivery' && (
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">
                          Адрес доставки
                        </label>
                        <textarea
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          rows={3}
                          placeholder="Город, улица, дом, квартира"
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-600"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Доставка {formatMoney(deliveryCost)} — оплата при
                          получении
                        </p>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-slate-800">
                          {deliveryType === 'pickup'
                            ? 'Выберите аптеку'
                            : 'Аптека отгрузки'}
                        </p>
                        {loadingAvail && (
                          <span className="text-xs text-slate-400">
                            Остатки…
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        {fits.map((fit) => {
                          const active =
                            fit.warehouse.id ===
                            (warehouseId || selectedFit?.warehouse.id)
                          return (
                            <label
                              key={fit.warehouse.id}
                              className={`flex gap-3 items-start rounded-xl border px-3 py-3 cursor-pointer transition ${
                                active
                                  ? 'border-emerald-600 bg-emerald-50/60'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name="warehouse"
                                className="mt-1 accent-emerald-700"
                                checked={active}
                                onChange={() =>
                                  setWarehouseId(fit.warehouse.id)
                                }
                              />
                              <span className="flex-1 min-w-0">
                                <span className="font-semibold text-slate-900 block">
                                  {pharmacyDisplayName(fit.warehouse.name)}
                                </span>
                                {fit.warehouse.address && (
                                  <span className="text-xs text-slate-500 block mt-0.5">
                                    {fit.warehouse.address}
                                  </span>
                                )}
                                <span
                                  className={`inline-block mt-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                    fit.fullyCovers
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {fit.fullyCovers
                                    ? 'В наличии'
                                    : `${fit.coveredLines}/${fit.totalLines} в наличии`}
                                </span>
                              </span>
                            </label>
                          )
                        })}
                      </div>
                    </div>

                    {shortfallLines.length > 0 && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-2">
                        <p className="text-sm font-medium text-amber-900">
                          В этой аптеке не хватает:
                        </p>
                        {shortfallLines.map((line) => {
                          const item = items.find(
                            (i) => i.productId === line.productId
                          )
                          return (
                            <div
                              key={line.productId}
                              className="flex flex-col gap-2 text-sm"
                            >
                              <p className="font-medium">
                                {nameById.get(line.productId)}
                              </p>
                              <p className="text-slate-600 text-xs">
                                Нужно {line.requested}, есть {line.available}
                              </p>
                              <div className="flex gap-2">
                                {line.available > 0 && item && (
                                  <button
                                    type="button"
                                    className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs"
                                    onClick={() =>
                                      setQty(line.productId, line.available)
                                    }
                                  >
                                    Уменьшить до {line.available}
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="rounded-lg border border-red-200 text-red-600 px-2.5 py-1 text-xs"
                                  onClick={() => remove(line.productId)}
                                >
                                  Убрать
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {open && meta.id === 2 && (
                  <div className="px-4 pb-4 border-t border-slate-100 pt-4">
                    {userId ? (
                      <div className="space-y-3">
                        <p className="text-sm text-emerald-800 bg-emerald-50 rounded-xl px-3 py-2">
                          Телефон подтверждён:{' '}
                          <strong>{formatPhoneDisplay(phone) || phone}</strong>
                        </p>
                        <div>
                          <label className="block text-sm text-slate-600 mb-1">
                            Имя
                          </label>
                          <input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Как к вам обращаться"
                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-600"
                          />
                        </div>
                      </div>
                    ) : (
                      <PhoneAuthPanel
                        embedded
                        initialPhone={phone}
                        initialName={fullName}
                        onAuthenticated={({ phone: p, fullName: n }) => {
                          setPhone(p)
                          if (n) setFullName(n)
                          setUserId('pending')
                          supabase.auth.getUser().then(({ data }) => {
                            setUserId(data.user?.id ?? null)
                          })
                        }}
                      />
                    )}
                  </div>
                )}

                {open && meta.id === 3 && (
                  <div className="px-4 pb-4 border-t border-slate-100 pt-4 space-y-4">
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div
                          key={item.productId}
                          className="flex gap-3 items-center"
                        >
                          <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                            <Image
                              src={item.image_url || '/images/product.png'}
                              alt={item.name}
                              width={48}
                              height={48}
                              className="object-contain w-full h-full"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-2">
                              {item.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {item.qty} × {formatMoney(item.price)}
                            </p>
                          </div>
                          <p className="text-sm font-semibold shrink-0">
                            {formatMoney(item.qty * item.price)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1.5 text-sm border-t border-slate-100 pt-3">
                      <div className="flex justify-between text-slate-600">
                        <span>Товары ({items.length})</span>
                        <span>{formatMoney(total)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Скидка</span>
                        <span>− 0 ₸</span>
                      </div>
                      {deliveryType === 'delivery' && (
                        <div className="flex justify-between text-slate-600">
                          <span>Доставка</span>
                          <span>{formatMoney(deliveryCost)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-baseline pt-1">
                        <span className="font-semibold">Итого</span>
                        <span className="text-xl font-bold text-emerald-700">
                          {formatMoney(grandTotal)}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 flex gap-3 items-start">
                      <MapPin
                        size={18}
                        className="text-emerald-700 mt-0.5 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-emerald-800/80 font-medium">
                          {deliveryType === 'pickup'
                            ? 'Аптека самовывоза'
                            : 'Доставка / аптека отгрузки'}
                        </p>
                        <p className="text-sm font-semibold text-slate-900">
                          {selectedFit
                            ? pharmacyDisplayName(selectedFit.warehouse.name)
                            : '—'}
                        </p>
                        {deliveryType === 'delivery' && address && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {address}
                          </p>
                        )}
                        {phone && (
                          <p className="text-xs text-slate-500 mt-1">
                            {fullName ? `${fullName}, ` : ''}
                            {formatPhoneDisplay(phone)}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-emerald-700 p-1"
                        aria-label="Изменить"
                      >
                        <Pencil size={16} />
                      </button>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-3">
                      <p className="text-sm font-medium text-slate-800">
                        Способ оплаты
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        На кассе при получении · без онлайн-оплаты
                      </p>
                    </div>
                  </div>
                )}
              </section>
            )
          })}
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Sticky footer CTA */}
        <div className="fixed bottom-0 inset-x-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:pb-3">
          <div className="max-w-xl mx-auto flex items-center gap-4">
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Итого</p>
              <p className="text-lg font-bold text-emerald-700 truncate">
                {formatMoney(grandTotal)}
              </p>
            </div>
            {step < 3 ? (
              <button
                type="button"
                onClick={goNext}
                disabled={step === 1 && !canContinueFromStep1()}
                className="flex-1 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-semibold py-3"
              >
                Продолжить
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting || !userId || shortfallLines.length > 0}
                onClick={placeOrder}
                className="flex-1 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-semibold py-3"
              >
                {submitting ? 'Оформляем…' : 'Подтвердить заказ'}
              </button>
            )}
          </div>
          {step === 3 && (
            <p className="max-w-xl mx-auto text-[11px] text-slate-500 text-center mt-2">
              Мы зарезервируем товар в выбранной аптеке и сообщим о готовности
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
