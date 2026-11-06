export type FeaturedProduct = {
  productId: string
  label?: string // popular | new | discount
  sort: number
}

export type HomeBanner = {
  id: string
  kind: 'promo' | 'consult'
  title: string
  subtitle?: string
  href: string
  image: string
  cta: string
  active: boolean
  sort: number
}

export type HomeNews = {
  id: string
  title: string
  date: string
  image: string
  href: string
  active: boolean
  sort: number
}

export type HomepageCms = {
  featured: FeaturedProduct[]
  banners: HomeBanner[]
  news: HomeNews[]
  updatedAt?: string
}

export const DEFAULT_HOMEPAGE_CMS: HomepageCms = {
  featured: [],
  banners: [
    {
      id: 'banner-d3',
      kind: 'promo',
      title: 'Витамин D3 со скидкой до -20%',
      subtitle: 'Акция',
      href: '/catalog?q=витамин%20D3',
      image: '/home/banner-d3-bg.png',
      cta: 'Подробнее',
      active: true,
      sort: 0,
    },
    {
      id: 'banner-doctor',
      kind: 'consult',
      title: 'Запишитесь к врачу онлайн или в филиале',
      subtitle: 'Консультации',
      href: '/doctors',
      image: '/home/banner-doctor-bg.png',
      cta: 'Записаться',
      active: true,
      sort: 1,
    },
  ],
  news: [
    {
      id: 'news-immunity',
      title: 'Сезонный иммунитет: что стоит иметь в аптечке',
      date: '2026-10-30',
      image: '/home/news-immunity.png',
      href: '/catalog',
      active: true,
      sort: 0,
    },
    {
      id: 'news-discount',
      title: 'Скидки до -25% на товары для здоровья',
      date: '2026-10-28',
      image: '/home/news-discount.png',
      href: '/catalog',
      active: true,
      sort: 1,
    },
  ],
  updatedAt: new Date().toISOString(),
}

export const CMS_BUCKET = 'cms'
export const CMS_OBJECT = 'homepage.json'
