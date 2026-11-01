import Hero from '@/ui/Hero'
import ServicesSection from '@/ui/ServicesSection'
import NewsReels from '@/ui/NewsReels'
import CatalogView from '@/ui/ProductList'
import { loadCatalogProducts } from '@/lib/catalog-products'

export default async function HomePage() {
  const { categories, products } = await loadCatalogProducts()

  return (
    <main className="min-h-screen">
      <Hero />

      <section className="container mx-auto px-4 py-10">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">
          Каталог товаров
        </h2>

        {products && products.length > 0 ? (
          <CatalogView categories={categories || []} allProducts={products} />
        ) : (
          <p className="text-gray-600">Товары пока отсутствуют.</p>
        )}
      </section>

      <ServicesSection />
      <NewsReels />
    </main>
  )
}
