import { supabaseServer } from '@/lib/supabase-server'
import { BarChart3, Users, ShoppingBag, Activity } from 'lucide-react'
import ChartSales from './ChartSales'

export default async function DirectorPage() {
  const supabase = await supabaseServer()

  // === Подсчёт заказов ===
  const { count: ordersCurrent } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  const { count: ordersPrev } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .gte('created_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString())

  const ordersChange =
    ordersPrev && ordersPrev > 0
      ? (((ordersCurrent ?? 0) - ordersPrev) / ordersPrev) * 100
      : 0

  // === Подсчёт выручки (только оплаченные) ===
  const { data: revenueCurrData } = await supabase.rpc('orders_sales_period', { days: 30 })
  const currentRevenue = revenueCurrData?.reduce(
    (sum: number, i: any) => sum + Number(i.total_sum),
    0
  )

  const { data: revenuePrevData } = await supabase.rpc('orders_sales_period', { days: 60 })
  const prevRevenuePart = revenuePrevData?.filter((i: any) => {
    const diffDays = (Date.now() - new Date(i.day).getTime()) / (1000 * 3600 * 24)
    return diffDays > 30 && diffDays <= 60
  })
  const prevRevenue = prevRevenuePart?.reduce(
    (sum: number, i: any) => sum + Number(i.total_sum),
    0
  )

  const revenueChange =
    prevRevenue && prevRevenue > 0
      ? ((currentRevenue - prevRevenue) / prevRevenue) * 100
      : 0

  // === Количество клиентов ===
  const { count: clientsCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: newClientsToday } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

  // === График ===
  const { data: salesData } = await supabase.rpc('orders_sales_period', { days: 30 })
  const formatted = (salesData ?? []).map((item: any) => ({
    date: new Date(item.day).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
    }),
    total: Number(item.total_sum),
  }))

  const stats = [
    {
      title: 'Всего заказов',
      value: ordersCurrent ?? 0,
      change:
        ordersChange >= 0
          ? `+${ordersChange.toFixed(1)}% за месяц`
          : `${ordersChange.toFixed(1)}% за месяц`,
      icon: ShoppingBag,
      color: 'bg-teal-500',
    },
    {
      title: 'Выручка',
      value: `${currentRevenue.toLocaleString()} ₸`,
      change:
        revenueChange >= 0
          ? `+${revenueChange.toFixed(1)}% за месяц`
          : `${revenueChange.toFixed(1)}% за месяц`,
      icon: BarChart3,
      color: 'bg-emerald-500',
    },
    {
      title: 'Клиентов',
      value: clientsCount ?? 0,
      change: `+${newClientsToday ?? 0} новых сегодня`,
      icon: Users,
      color: 'bg-sky-500',
    },
    {
      title: 'Консультаций',
      value: '—',
      change: 'пока не добавлено',
      icon: Activity,
      color: 'bg-orange-500',
    },
  ]

  return (
    <section className="space-y-8">
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold text-teal-700">
          Панель директора
        </h1>
        <p className="text-gray-600 mt-1">
          Ключевые показатели бизнеса на основе данных Supabase.
        </p>
      </header>

      {/* Карточки */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((item, i) => (
          <div
            key={i}
            className="bg-white shadow-sm rounded-xl border border-gray-100 p-5 flex items-center justify-between hover:shadow-md transition"
          >
            <div>
              <h3 className="text-sm font-medium text-gray-500">{item.title}</h3>
              <p className="text-2xl font-semibold text-gray-800 mt-1">{item.value}</p>
              <span
                className={`text-xs ${
                  item.change.startsWith('+')
                    ? 'text-green-600'
                    : item.change.startsWith('-')
                    ? 'text-red-500'
                    : 'text-gray-500'
                }`}
              >
                {item.change}
              </span>
            </div>
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${item.color}`}
            >
              <item.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* График */}
      <ChartSales initialData={formatted} />
    </section>
  )
}
