import HomeHero from '@/ui/home/HomeHero'
import GuestSearchResults from '@/ui/search/GuestSearchResults'
import { loadCatalogProducts } from '@/lib/catalog-products'

export const metadata = {
  title: 'Каталог — NewPharm',
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }> | { q?: string }
}) {
  const { categories, products } = await loadCatalogProducts()
  const sp = await Promise.resolve(searchParams)
  const query = sp?.q ? String(sp.q) : ''

  return (
    <main className="min-h-screen bg-white">
      <HomeHero
        catalogHref="/catalog"
        initialQuery={query}
        showPopular={!query.trim()}
      />
      <GuestSearchResults
        query={query}
        categories={categories}
        products={products}
        hrefBase="guest"
      />
    </main>
  )
}
