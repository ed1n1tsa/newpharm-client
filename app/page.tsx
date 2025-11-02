import { supabaseServer } from '@/lib/supabase-server'
import Hero from '@/ui/Hero'
import ServicesSection from '@/ui/ServicesSection'
import NewsReels from '@/ui/NewsReels'
import CatalogView from '@/ui/ProductList'

export default async function HomePage() {
  const supabase = await supabaseServer()

  // 📦 Загружаем категории
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, name')
    .order('name', { ascending: true })

  if (catError) {
    console.error('Ошибка загрузки категорий:', catError.message)
  }

  // 🛒 Загружаем все товары без пагинации (до 10 000)
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('id, name, price, image_url, category')
    .order('name', { ascending: true })
    .limit(10000) // ✅ обязательно добавляем лимит

  if (prodError) {
    console.error('Ошибка загрузки товаров:', prodError.message)
  }

  return (
    <main className="min-h-screen">
      {/* 🧱 Главный баннер */}
      <Hero />

      {/* 🛍️ Каталог товаров */}
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

      {/* 💉 Услуги и новости */}
      <ServicesSection />
      <NewsReels />
    </main>
  )
}
