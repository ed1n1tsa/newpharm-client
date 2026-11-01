'use client'

import Link from 'next/link'
import HomeIcon from './HomeIcon'

export type HomeCategory = {
  key: string
  title: string
  icon: string
  href: string
}

export const HOME_CATEGORIES: HomeCategory[] = [
  {
    key: 'medicine',
    title: 'Лекарства',
    icon: '/home/icon-medicine.png',
    href: '/catalog?category=' + encodeURIComponent('Лекарственные средства'),
  },
  {
    key: 'vitamins',
    title: 'Витамины и БАД',
    icon: '/home/icon-vitamins.png',
    href: '/catalog?category=' + encodeURIComponent('Витамины и БАДы'),
  },
  {
    key: 'care',
    title: 'Уход и гигиена',
    icon: '/home/icon-care.png',
    href: '/catalog?category=' + encodeURIComponent('Косметика и уход'),
  },
  {
    key: 'devices',
    title: 'Медицинские изделия',
    icon: '/home/icon-medical.png',
    href: '/catalog?category=' + encodeURIComponent('Медицинские приборы'),
  },
  {
    key: 'kids',
    title: 'Товары для мам и детей',
    icon: '/home/icon-kids.png',
    href: '/catalog?category=' + encodeURIComponent('Товары для детей'),
  },
  {
    key: 'food',
    title: 'Здоровое питание',
    icon: '/home/icon-food.png',
    href: '/catalog?q=' + encodeURIComponent('питание'),
  },
  {
    key: 'sport',
    title: 'Спорт и активность',
    icon: '/home/icon-sport.png',
    href: '/catalog?q=' + encodeURIComponent('спорт'),
  },
  {
    key: 'all',
    title: 'Все категории',
    icon: '/home/icon-all-cats.png',
    href: '/catalog',
  },
]

export default function HomeCategories({ catalogHref }: { catalogHref: string }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      <div className="flex items-end justify-between mb-5">
        <h2 className="text-[1.35rem] md:text-[1.65rem] font-bold text-[#0f172a]">Категории</h2>
        <Link
          href={catalogHref}
          className="text-sm font-semibold text-[#22c55e] hover:text-[#16a34a]"
        >
          Все категории →
        </Link>
      </div>

      <div className="grid grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
        {HOME_CATEGORIES.map((c, i) => {
          const active = i === 0
          return (
            <Link
              key={c.key}
              href={c.href.startsWith('/catalog') ? c.href.replace('/catalog', catalogHref) : c.href}
              className={`group flex flex-col items-center text-center rounded-[20px] px-2 py-3.5 sm:py-4 transition ${
                active
                  ? 'bg-[#e8f8ee] shadow-[0_1px_0_rgba(34,197,94,0.08)]'
                  : 'bg-white hover:bg-[#f8fafc] shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-[#eef2f6]'
              }`}
            >
              <span
                className={`grid place-items-center h-11 w-11 sm:h-12 sm:w-12 mb-2.5 ${
                  active ? '' : ''
                }`}
              >
                <HomeIcon src={c.icon} alt="" size={40} />
              </span>
              <span
                className={`text-[11px] sm:text-xs font-semibold leading-snug ${
                  active ? 'text-[#166534]' : 'text-[#334155]'
                }`}
              >
                {c.title}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
