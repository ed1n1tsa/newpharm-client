'use client'

import HomeIcon from './HomeIcon'
import { useCity } from '@/ui/CityProvider'

const ITEMS = [
  {
    icon: '/home/icon-shield.png',
    title: 'Качество',
    text: 'Сертифицированные товары',
  },
  {
    icon: '/home/icon-bolt.png',
    title: 'Удобство',
    text: 'Быстрый поиск и заказ',
  },
  {
    icon: '/home/icon-near.png',
    title: 'Рядом с вами',
    text: (city: string) => `Несколько аптек в ${city}`,
  },
  {
    icon: '/home/icon-heart-outline.png',
    title: 'Забота о здоровье',
    text: 'Лекарства, консультации и поддержка',
  },
]

export default function HomeWhy() {
  const { city } = useCity()
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h2 className="text-xl md:text-2xl font-bold text-slate-900 text-center mb-8">
        Почему выбирают NewPharm
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {ITEMS.map((item) => (
          <div key={item.title} className="text-center px-2">
            <span className="mx-auto mb-3 grid place-items-center h-14 w-14 rounded-2xl bg-emerald-50">
              <HomeIcon src={item.icon} alt="" size={32} />
            </span>
            <h3 className="font-bold text-slate-900">{item.title}</h3>
            <p className="mt-1 text-sm text-slate-500">
              {typeof item.text === 'function' ? item.text(city.name) : item.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
