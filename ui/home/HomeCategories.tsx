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
        <h2 className="text-xl md:text-2xl font-bold text-slate-900">Категории</h2>
        <Link href={catalogHref} className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
          Все категории →
        </Link>
      </div>

      <div className="flex md:grid md:grid-cols-4 lg:grid-cols-8 gap-3 overflow-x-auto no-scrollbar pb-1">
        {HOME_CATEGORIES.map((c, i) => (
          <Link
            key={c.key}
            href={c.href.startsWith('/catalog') ? c.href.replace('/catalog', catalogHref) : c.href}
            className={`shrink-0 w-[112px] md:w-auto rounded-2xl border px-3 py-4 flex flex-col items-center gap-3 text-center transition hover:shadow-md ${
              i === 0
                ? 'border-emerald-200 bg-emerald-50'
                : 'border-slate-100 bg-white hover:border-emerald-100'
            }`}
          >
            <span className="grid place-items-center h-12 w-12 rounded-xl bg-white">
              <HomeIcon src={c.icon} alt="" size={36} />
            </span>
            <span className="text-xs font-semibold text-slate-800 leading-snug">{c.title}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
