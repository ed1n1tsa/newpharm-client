'use client'

import { useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function ChartSales({ initialData }: { initialData: any[] }) {
  const supabase = createClientComponentClient()
  const [data, setData] = useState(initialData)
  const [period, setPeriod] = useState(7)
  const [loading, setLoading] = useState(false)

  const fetchData = async (days: number) => {
    setLoading(true)
    const { data: res } = await supabase.rpc('orders_sales_period', { days })
    const formatted = (res ?? []).map((item: any) => ({
      date: new Date(item.day).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'short',
      }),
      total: Number(item.total_sum),
    }))
    setData(formatted)
    setPeriod(days)
    setLoading(false)
  }

  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Продажи за {period} дней
        </h2>
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => fetchData(d)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                period === d
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {d === 7 ? '7 дней' : d === 30 ? '30 дней' : 'Квартал'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-[220px] flex items-center justify-center text-gray-400">
          Загрузка...
        </div>
      ) : data.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                fontSize: '14px',
                borderColor: '#e5e7eb',
              }}
              formatter={(v) => [`${v.toLocaleString()} ₸`, 'Выручка']}
            />
            <Bar dataKey="total" fill="#14b8a6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[220px] flex items-center justify-center text-gray-400">
          Нет данных для отображения
        </div>
      )}
    </div>
  )
}
