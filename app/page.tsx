import { supabaseServer } from '@/lib/supabase-server'
import Hero from '@/ui/Hero'
import ServicesSection from '@/ui/ServicesSection'
import NewsReels from '@/ui/NewsReels'
import CatalogView from '@/ui/ProductList'

// ⚙️ Количество товаров на страницу
const PAGE_SIZE = 200

export default async function HomePage({ searchParams }: { searchParams: { page?: string } }) {
  const supabase = await supabaseServer()

  // Текущая страница из URL (по умолчанию 1)
  const currentPage = parseInt(searchParams.page || '1')
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  // 📦 Категории
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name', { ascending: true })

  // 🛒 Товары с пагинацией
  const { data: products, error: prodError, count } = await supabase
    .from('products')
    .select('id, name, price, image_url, category', { count: 'exact' })
    .range(from, to)
    .order('name', { ascending: true })

  if (prodError) {
    console.error('Ошибка загрузки товаров:', prodError.message)
  }

  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 1

  return (
    <main className="min-h-screen">
      <Hero />

      <section className="container mx-auto px-4 py-10">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">
          Каталог товаров
        </h2>

        {products && products.length > 0 ? (
          <>
            <CatalogView categories={categories || []} allProducts={products} />

            {/* 🔹 Навигация по страницам */}
            <div className="flex justify-center mt-8 gap-3">
              {Array.from({ length: totalPages }).map((_, i) => (
                <a
                  key={i}
                  href={`/?page=${i + 1}`}
                  className={`px-3 py-2 rounded-lg border ${
                    currentPage === i + 1
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </a>
              ))}
            </div>
          </>
        ) : (
          <p className="text-gray-600">Товары пока отсутствуют.</p>
        )}
      </section>

      <ServicesSection />
      <NewsReels />
    </main>
  )
}
