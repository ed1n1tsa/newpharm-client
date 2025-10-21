import { supabaseServer } from "@/lib/supabase-server"
import OrderListClient from "./OrderListClient"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function OrdersPage() {
  const supabase = await supabaseServer()
  const { data: userData, error } = await supabase.auth.getUser()
  const user = userData?.user

  if (!user || error?.message === "Auth session missing!") {
    return (
      <section className="min-h-screen flex flex-col items-center justify-center text-center">
        <h2 className="text-xl font-semibold mb-4">Вы не вошли в аккаунт</h2>
        <Link
          href="/login"
          className="px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-semibold transition"
        >
          Войти
        </Link>
      </section>
    )
  }

  // Загружаем заказы
  const { data: orders } = await supabase
    .from("orders")
    .select("id, total, payment_status, created_at, status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return <OrderListClient orders={orders || []} />
}
