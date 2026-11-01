'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import type { HomepageCms } from '@/lib/homepage-cms'
import { DEFAULT_HOMEPAGE_CMS } from '@/lib/homepage-cms'
import HomeHero from './HomeHero'
import HomeCategories from './HomeCategories'
import HomeBanners from './HomeBanners'
import HomeProducts, { type HomeProduct } from './HomeProducts'
import HomePharmacies from './HomePharmacies'
import HomeNewsSection from './HomeNews'
import HomeWhy from './HomeWhy'
import HomeLoginBanner from './HomeLoginBanner'

export default function GuestHome({
  initialCms,
  initialProducts,
}: {
  initialCms: HomepageCms
  initialProducts: HomeProduct[]
}) {
  const [cms, setCms] = useState(initialCms || DEFAULT_HOMEPAGE_CMS)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setLoggedIn(!!session?.user)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    fetch('/api/cms/homepage')
      .then((r) => r.json())
      .then((data) => {
        if (data?.banners) setCms(data)
      })
      .catch(() => {})
  }, [])

  const catalogHref = loggedIn ? '/client/products' : '/catalog'

  return (
    <div className="guest-page bg-white">
      <HomeHero catalogHref={catalogHref} />
      <HomeLoginBanner loggedIn={loggedIn} />
      <HomeCategories catalogHref={catalogHref} />
      <HomeBanners banners={cms.banners} />
      <HomeProducts
        products={initialProducts}
        featured={cms.featured || []}
        catalogHref={catalogHref}
      />
      <HomePharmacies />
      <HomeNewsSection news={cms.news} />
      <HomeWhy />
    </div>
  )
}
