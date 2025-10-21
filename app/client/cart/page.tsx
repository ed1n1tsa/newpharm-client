'use client'

import { useEffect, useState } from "react"
import Image from "next/image"
import { supabase } from "@/lib/supabase-browser"
import { ShoppingCart, Loader2, Plus, Minus } from "lucide-react"

export default function CartPage() {
  const [cartItems, setCartItems] = useState<any[]>([])
  const [cartId, setCartId] = useState<string | null>(null)
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">("pickup")
  const [deliveryCost, setDeliveryCost] = useState(0)
  const [profile, setProfile] = useState<any>({
    full_name: "",
    phone: "",
    address: "",
    city: "",
  })
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState("")
  const [showQR, setShowQR] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  // 🔹 Загрузка корзины и профиля
  async function loadData() {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user
    if (!user) return (window.location.href = "/login")

    // 👤 Профиль
    const { data: prof } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    setProfile({
      full_name: prof?.full_name || "",
      phone: prof?.phone || "",
      address: prof?.address || "",
      city: prof?.city || "",
    })

    // 🛒 Корзина
    const { data: cart } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (!cart) {
      setCartItems([])
      setLoading(false)
      return
    }

    setCartId(cart.id)

    // 📦 Загружаем товары
    const { data: items, error: itemsError } = await supabase
      .from("cart_items")
      .select("id, quantity, products:product_id(id, name, price, image_url)")
      .eq("cart_id", cart.id)

    if (itemsError) console.error("Ошибка загрузки товаров:", itemsError.message)

// Исправлено: приводим products к объекту
const fixed = (items || []).map((i) => {
    const product = Array.isArray(i.products) ? i.products[0] : i.products
    return {
      ...i,
      products: {
        ...product,
        price: product?.price ?? 0,
      },
    }
  })
  
  setCartItems(fixed)
  setLoading(false)
  }

  // 🔸 Изменение количества
  async function updateQuantity(itemId: string, newQty: number) {
    if (!cartId || newQty < 1) return
    await supabase
      .from("cart_items")
      .update({ quantity: newQty })
      .eq("id", itemId)
      .eq("cart_id", cartId)
    await loadData()
  }

  // 🔸 Удалить товар
  async function removeItem(itemId: string) {
    if (!cartId) return
    await supabase
      .from("cart_items")
      .delete()
      .eq("id", itemId)
      .eq("cart_id", cartId)
    await loadData()
  }

  const total = cartItems.reduce(
    (sum, item) => sum + (item.products.price ?? 0) * item.quantity,
    0
  )

  // 🔸 Оформление заказа
async function handleCheckout() {
    try {
      setCreating(true)
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) return (window.location.href = "/login")
  
      if (cartItems.length === 0) {
        setMessage("Корзина пуста.")
        return
      }
  {/* 🏠 Доставка / Самовывоз */}
<div className="mt-6">
<h3 className="font-semibold text-lg mb-2">Способ получения</h3>
<div className="flex gap-4">
  <button
    onClick={() => {
      setDeliveryType("pickup")
      setDeliveryCost(0)
    }}
    className={`px-4 py-2 rounded-xl border ${
      deliveryType === "pickup"
        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
        : "border-gray-300"
    }`}
  >
    Самовывоз
  </button>
  <button
    onClick={() => {
      setDeliveryType("delivery")
      setDeliveryCost(1000)
    }}
    className={`px-4 py-2 rounded-xl border ${
      deliveryType === "delivery"
        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
        : "border-gray-300"
    }`}
  >
    Доставка
  </button>
</div>

{deliveryType === "delivery" && (
  <p className="text-sm text-gray-500 mt-2">
    Курьер доставит заказ по адресу из профиля. Стоимость доставки:{" "}
    <span className="font-semibold text-emerald-600">
      {deliveryCost.toLocaleString("ru-RU")} ₸
    </span>
  </p>
)}
</div>

      // 🏭 Склад
      const firstProductId = cartItems[0].products.id
      const { data: stock } = await supabase
        .from("product_stocks")
        .select("warehouse_id")
        .eq("product_id", firstProductId)
        .limit(1)
        .single()
  
      const warehouseId = stock?.warehouse_id || null
  
      // 👤 Обновляем профиль
      await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
        })
        .eq("id", user.id)
  
      // 🧾 Создаём заказ
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          customer_name: profile.full_name,
          customer_phone: profile.phone,
          delivery_address: `${profile.city}, ${profile.address}`,
          total: total + deliveryCost, // 👈 включаем доставку
          payment_status: "pending",
          status: "awaiting_payment",
          warehouse_id: warehouseId,
          currency: "KZT",
          cart_id: cartId,
          delivery_type: deliveryType, // 👈 новый параметр
          delivery_cost: deliveryCost, // 👈 новый параметр
        })
        .select()
        .single()
  
      if (orderErr) throw orderErr
  
      // 🛍 Добавляем товары в order_items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.products.id,
        quantity: item.quantity,
        price: item.products?.price ?? 0,
      }))
  
      const { error: orderItemsError } = await supabase
        .from("order_items")
        .insert(orderItems)
  
      if (orderItemsError) throw orderItemsError
  
      // 🧮 Вычитаем товары со склада
      for (const item of cartItems) {
        await supabase.rpc("decrease_stock", {
          p_product_id: item.products.id,
          p_qty: item.quantity,
        })
      }
  
      // ❌ Больше не очищаем корзину здесь
  
      // 📱 Показываем QR
      const qrPath = `/qr/${warehouseId}.jpg`
      setShowQR(qrPath)
      setMessage("✅ Заказ создан и ожидает оплаты!")
    } catch (err: any) {
      console.error("Ошибка оформления заказа:", err.message)
      setMessage("❌ Ошибка оформления заказа.")
    } finally {
      setCreating(false)
    }
  }
  

  // 🌀 Загрузка
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-emerald-600" size={36} />
      </div>
    )

  // 🛒 Пустая корзина
  if (cartItems.length === 0)
    return (
      <section className="min-h-screen flex flex-col items-center justify-center text-center text-gray-600">
        <ShoppingCart className="w-12 h-12 mb-4 text-gray-400" />
        <p>Ваша корзина пуста</p>
      </section>
    )

  // 🧾 Контент
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Корзина</h1>

      {/* 🛍 Список товаров */}
      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-5">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center gap-4 border-b pb-4">
            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={item.products.image_url || "/images/product.png"}
                alt={item.products.name}
                width={80}
                height={80}
                className="object-contain w-full h-full"
              />
            </div>
            <div className="flex-1">
              <p className="font-medium">{item.products.name}</p>
              <p className="text-sm text-gray-500">
                {(item.products.price ?? 0).toLocaleString("ru-RU")} ₸ ×{" "}
                {item.quantity}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="p-1 rounded border border-gray-300"
                >
                  <Minus size={14} />
                </button>
                <span className="min-w-[24px] text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="p-1 rounded border border-gray-300"
                >
                  <Plus size={14} />
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  className="ml-4 text-red-500 text-sm"
                >
                  Удалить
                </button>
              </div>
            </div>
            <p className="font-semibold text-emerald-600">
              {((item.products.price ?? 0) * item.quantity).toLocaleString(
                "ru-RU"
              )}{" "}
              ₸
            </p>
          </div>
        ))}
      </div>

      {/* 👤 Контактные данные */}
      <div className="mt-8 space-y-4">
        <h2 className="font-semibold text-lg">Контактные данные</h2>

        <input
          type="text"
          placeholder="ФИО"
          value={profile.full_name}
          onChange={(e) =>
            setProfile({ ...profile, full_name: e.target.value })
          }
          className="w-full border rounded-xl px-4 py-2 focus:border-emerald-500 outline-none"
        />
        <input
          type="tel"
          placeholder="Телефон"
          value={profile.phone}
          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          className="w-full border rounded-xl px-4 py-2 focus:border-emerald-500 outline-none"
        />
        <input
          type="text"
          placeholder="Город"
          value={profile.city}
          onChange={(e) => setProfile({ ...profile, city: e.target.value })}
          className="w-full border rounded-xl px-4 py-2 focus:border-emerald-500 outline-none"
        />
        <textarea
          placeholder="Адрес доставки"
          value={profile.address}
          onChange={(e) => setProfile({ ...profile, address: e.target.value })}
          className="w-full border rounded-xl px-4 py-2 focus:border-emerald-500 outline-none"
        />
      </div>

      {/* 💰 Итого */}
      <div className="flex justify-between items-center mt-6">
        <p className="text-xl font-bold text-emerald-600">
          Итого: {total.toLocaleString("ru-RU")} ₸
        </p>
        <button
          disabled={creating}
          onClick={handleCheckout}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold transition disabled:bg-gray-300"
        >
          {creating ? "Оформляем..." : "Оформить заказ"}
        </button>
      </div>

      {message && (
        <p className="text-center text-sm text-emerald-600 mt-4">{message}</p>
      )}

      {/* 📱 QR */}
      {showQR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-[90%] max-w-md text-center">
            <h3 className="text-xl font-semibold mb-3">Оплата заказа</h3>
            <p className="text-gray-600 mb-4">
              Отсканируйте QR-код для оплаты. После оплаты ожидайте
              подтверждения.
            </p>
            <div className="w-full flex items-center justify-center">
              <Image
                src={showQR}
                alt="QR для оплаты"
                width={280}
                height={280}
                className="rounded-xl shadow-md"
              />
            </div>
            <button
            onClick={async () => {
              setShowQR(null)
              // 🧹 Теперь очищаем корзину только после закрытия QR
              if (cartId) {
                await supabase.from("cart_items").delete().eq("cart_id", cartId)
                await loadData() // обновим состояние UI
              }
            }}
            className="mt-5 bg-emerald-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-emerald-600"
          >
            Закрыть
          </button>
          
          </div>
        </div>
      )}
    </main>
  )
}
