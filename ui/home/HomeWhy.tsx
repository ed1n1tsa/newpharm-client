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
    <section className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
      <div className="rounded-[22px] bg-[#e8f8ee] px-4 py-5 md:px-6 md:py-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
          <h2 className="text-[18px] md:text-[22px] font-bold text-[#111827] lg:w-[220px] shrink-0">
            Почему выбирают NewPharm
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-0 flex-1">
            {ITEMS.map((item, i) => (
              <div
                key={item.title}
                className={`flex items-start gap-2.5 lg:px-4 ${
                  i > 0 ? 'lg:border-l lg:border-[#c6e9d3]' : ''
                }`}
              >
                <span className="grid place-items-center h-9 w-9 shrink-0">
                  <HomeIcon src={item.icon} alt="" size={28} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[13px] md:text-[14px] font-bold text-[#111827]">{item.title}</h3>
                  <p className="mt-0.5 text-[11px] md:text-[12px] text-[#6b7280] leading-snug">
                    {typeof item.text === 'function' ? item.text(city.name) : item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
