import { supabaseServer } from '@/lib/supabase-server'
import Hero from '@/ui/Hero'
import ServicesSection from '@/ui/ServicesSection'
import NewsReels from '@/ui/NewsReels'
import CatalogView from '@/ui/ProductList'
import Pagination from "@/ui/Pagination"
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
            <Pagination totalPages={totalPages} />
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
