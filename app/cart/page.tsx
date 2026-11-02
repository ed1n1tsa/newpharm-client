'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  MapPin,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from 'lucide-react'
import { useCart } from '@/ui/CartContext'
import { pharmacyDisplayName } from '@/lib/pharmacy'
import {
  DeliveryType,
  extractVolume,
  formatMoney,
  pluralItems,
  readCheckoutPrefs,
  writeCheckoutPrefs,
} from '@/lib/checkout-prefs'
import { usePharmacyAvailability } from '@/lib/use-pharmacy-availability'

export default function PublicCartPage() {
  const { items, total, count, setQty, remove, clear, ready } = useCart()
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('pickup')
  const [warehouseId, setWarehouseId] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)

  useEffect(() => {
    const prefs = readCheckoutPrefs()
    setDeliveryType(prefs.deliveryType)
    if (prefs.warehouseId) setWarehouseId(prefs.warehouseId)
  }, [])

  const lines = useMemo(
    () => items.map((i) => ({ productId: i.productId, qty: i.qty })),
    [items]
  )
  const { fits, loading: loadingAvail, recommendedId } =
    usePharmacyAvailability(lines)

  useEffect(() => {
    if (recommendedId) setWarehouseId((prev) => prev || recommendedId)
  }, [recommendedId])

  useEffect(() => {
    writeCheckoutPrefs({ deliveryType, warehouseId })
  }, [deliveryType, warehouseId])

  const selectedFit = useMemo(
    () => fits.find((f) => f.warehouse.id === warehouseId) || fits[0] || null,
    [fits, warehouseId]
  )

  const deliveryCost = deliveryType === 'delivery' ? 1000 : 0
  const grandTotal = total + deliveryCost
  const lineCount = items.length

  if (!ready) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-500">
        Загрузка корзины…
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <section className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 bg-[#f6f7f8]">
        <ShoppingCart className="w-12 h-12 mb-4 text-gray-400" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Корзина пуста</h1>
        <p className="text-slate-500 mb-6">Добавьте товары из каталога</p>
        <Link
          href="/catalog"
          className="rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 font-semibold"
        >
          В каталог
        </Link>
      </section>
    )
  }

  const orderSummary = (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
      <h2 className="text-lg font-bold text-slate-900">Ваш заказ</h2>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Товары ({lineCount})</span>
          <span>{formatMoney(total)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Скидка</span>
          <span>0 ₸</span>
        </div>
        {deliveryType === 'delivery' && (
          <div className="flex justify-between text-slate-600">
            <span>Доставка</span>
            <span>{formatMoney(deliveryCost)}</span>
          </div>
        )}
        <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
          <span className="font-semibold text-slate-900">Итого</span>
          <span className="text-2xl font-bold text-emerald-700">
            {formatMoney(grandTotal)}
          </span>
        </div>
      </div>

      {/* Delivery tabs */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100">
        <button
          type="button"
          onClick={() => setDeliveryType('pickup')}
          className={`rounded-lg py-2 text-sm font-semibold transition ${
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
          className={`rounded-lg py-2 text-sm font-semibold transition ${
            deliveryType === 'delivery'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-slate-500'
          }`}
        >
          Доставка
        </button>
      </div>

      {/* Pharmacy card */}
      <div className="rounded-xl bg-emerald-50/80 border border-emerald-100 overflow-hidden">
        <button
          type="button"
          onClick={() => setPickerOpen((v) => !v)}
          className="w-full flex items-start gap-3 p-3 text-left"
        >
          <span className="mt-0.5 inline-flex size-8 items-center justify-center rounded-full bg-white text-emerald-700 shrink-0">
            <MapPin size={16} />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-xs text-emerald-800/80 font-medium">
              {deliveryType === 'pickup' ? 'Аптека самовывоза' : 'Аптека отгрузки'}
            </span>
            <span className="block text-sm font-semibold text-slate-900 mt-0.5">
              {selectedFit
                ? pharmacyDisplayName(selectedFit.warehouse.name)
                : loadingAvail
                  ? 'Подбираем…'
                  : 'Выберите аптеку'}
            </span>
            {selectedFit?.warehouse.address && (
              <span className="block text-xs text-slate-500 mt-0.5 line-clamp-2">
                {selectedFit.warehouse.address}
              </span>
            )}
            {selectedFit && (
              <span
                className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  selectedFit.fullyCovers
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {selectedFit.fullyCovers
                  ? 'В наличии'
                  : `${selectedFit.coveredLines}/${selectedFit.totalLines} позиций`}
              </span>
            )}
          </span>
          <span className="text-xs font-semibold text-emerald-700 inline-flex items-center gap-1 shrink-0">
            Сменить
            <ChevronDown
              size={14}
              className={`transition ${pickerOpen ? 'rotate-180' : ''}`}
            />
          </span>
        </button>

        {pickerOpen && (
          <div className="border-t border-emerald-100 bg-white/70 p-2 space-y-1.5">
            {fits.map((fit) => {
              const active = fit.warehouse.id === (warehouseId || selectedFit?.warehouse.id)
              return (
                <button
                  key={fit.warehouse.id}
                  type="button"
                  onClick={() => {
                    setWarehouseId(fit.warehouse.id)
                    setPickerOpen(false)
                  }}
                  className={`w-full text-left rounded-lg px-3 py-2.5 text-sm border ${
                    active
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-transparent hover:bg-slate-50'
                  }`}
                >
                  <span className="font-medium block">
                    {pharmacyDisplayName(fit.warehouse.name)}
                  </span>
                  <span className="text-xs text-slate-500">
                    {fit.fullyCovers
                      ? 'Всё в наличии'
                      : `В наличии ${fit.coveredLines} из ${fit.totalLines}`}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <Link
        href="/checkout"
        className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-3.5 font-semibold"
      >
        <ShoppingCart size={18} />
        Оформить заказ
        <ArrowRight size={18} />
      </Link>
      <Link
        href="/catalog"
        className="flex items-center justify-center gap-2 w-full rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-3 font-medium"
      >
        <ArrowLeft size={16} />
        Продолжить покупки
      </Link>
    </aside>
  )

  return (
    <div className="bg-[#f6f7f8] min-h-[70vh]">
      {/* Site footer/mobile nav hidden on /cart — keep bottom padding for safety */}
      <main className="max-w-6xl mx-auto px-4 py-8 pb-10">
        <nav className="text-sm text-slate-500 mb-4">
          <Link href="/" className="hover:text-emerald-700">
            Главная
          </Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-800">Корзина</span>
        </nav>

        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-slate-900">Корзина</h1>
          <span className="rounded-full bg-emerald-100 text-emerald-800 text-sm font-semibold px-3 py-1">
            {pluralItems(count)}
          </span>
        </div>
        <p className="text-slate-500 mb-6">
          Проверьте выбранные товары и оформите заказ.
        </p>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
          {/* Items */}
          <section className="space-y-3">
            {items.map((item) => {
              const volume = extractVolume(item.name)
              const lineTotal = (item.price || 0) * item.qty
              return (
                <article
                  key={item.productId}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex gap-4">
                    <Link
                      href={`/ProductPage?id=${encodeURIComponent(item.productId)}`}
                      className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 rounded-xl overflow-hidden shrink-0"
                    >
                      <Image
                        src={item.image_url || '/images/product.png'}
                        alt={item.name}
                        width={96}
                        height={96}
                        className="object-contain w-full h-full p-1"
                      />
                    </Link>

                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                      <div className="flex gap-2 justify-between">
                        <div className="min-w-0">
                          <Link
                            href={`/ProductPage?id=${encodeURIComponent(item.productId)}`}
                            className="font-medium text-slate-900 hover:text-emerald-700 line-clamp-2"
                          >
                            {item.name}
                          </Link>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span className="inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              В наличии
                            </span>
                            {volume && (
                              <span className="text-xs text-slate-500">{volume}</span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(item.productId)}
                          className="text-slate-400 hover:text-red-500 p-1 h-fit"
                          aria-label="Удалить"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-end justify-between gap-3 mt-auto">
                        <div className="inline-flex items-center rounded-full border border-slate-200 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setQty(item.productId, item.qty - 1)}
                            className="px-3 py-1.5 hover:bg-slate-50"
                            aria-label="Уменьшить"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="min-w-[28px] text-center text-sm font-semibold">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQty(item.productId, item.qty + 1)}
                            className="px-3 py-1.5 hover:bg-slate-50"
                            aria-label="Увеличить"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">
                            {formatMoney(lineTotal)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatMoney(item.price)} / шт.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}

            <div className="flex flex-wrap justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => clear()}
                className="text-sm text-slate-500 hover:text-red-600 inline-flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                Очистить корзину
              </button>
            </div>
          </section>

          {/* Desktop sidebar */}
          <div className="hidden lg:block sticky top-24">{orderSummary}</div>
        </div>

        {/* Mobile sticky order bar + expandable summary */}
        <div className="lg:hidden mt-6 space-y-4">
          {orderSummary}
        </div>
      </main>
    </div>
  )
}
