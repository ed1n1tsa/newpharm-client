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
    key: 'cosmetics',
    title: 'Косметика и дерматология',
    icon: '/home/icon-all-cats.png',
    href: '/catalog?category=' + encodeURIComponent('Косметика и уход'),
  },
]

export default function HomeCategories({ catalogHref }: { catalogHref: string }) {
  return (
    <section className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-5">
      <div className="flex items-end justify-between mb-3">
        <h2 className="text-[18px] md:text-[22px] font-bold text-[#111827]">Категории</h2>
        <Link href={catalogHref} className="text-[13px] font-semibold text-[#22c55e]">
          Все категории →
        </Link>
      </div>

      {/* Mobile: 2x2 visible style via 2-col + scroll extras, or 4 in 2 rows of first 4 + more */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 md:gap-2.5">
        {HOME_CATEGORIES.map((c, i) => {
          const active = i === 0
          return (
            <Link
              key={c.key}
              href={c.href.startsWith('/catalog') ? c.href.replace('/catalog', catalogHref) : c.href}
              className={`flex flex-col items-center text-center rounded-[16px] px-2 py-3 transition ${
                active
                  ? 'bg-[#e8f8ee]'
                  : 'bg-white ring-1 ring-[#eef2f6] shadow-[0_1px_3px_rgba(15,23,42,0.04)]'
              } ${i >= 4 ? 'hidden sm:flex' : ''}`}
            >
              <span className="grid place-items-center h-10 w-10 mb-1.5">
                <HomeIcon src={c.icon} alt="" size={34} />
              </span>
              <span
                className={`text-[11px] font-semibold leading-tight ${
                  active ? 'text-[#166534]' : 'text-[#374151]'
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
