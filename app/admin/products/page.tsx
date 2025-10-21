import { supabaseServer } from '@/lib/supabase-server'
import ProductsTable from './ProductsTable'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const supabase = await supabaseServer()
  const params = await searchParams // ← теперь это асинхронно

  // 📄 Пагинация
  const page = Number(params.page ?? 1)
  const limit = 1000
  const from = (page - 1) * limit
  const to = from + limit - 1

  // Проверяем роль пользователя
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const isDirector = profile?.role === 'director'

  // Загружаем товары
  const { data: products, error, count } = await supabase
    .from('products')
    .select('id, name, category, price, stock, image_url', { count: 'exact' })
    .order('name', { ascending: true })
    .range(from, to)

  if (error) {
    console.error('[Server] Ошибка загрузки товаров:', error.message)
  }

  const totalPages = Math.ceil((count ?? 0) / limit)

  const categories = Array.from(
    new Set(products?.map((p) => p.category || 'Без категории'))
  )

  return (
    <section className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-teal-700">
            Товары
          </h1>
          <p className="text-gray-600 mt-1">
            Список товаров из базы Supabase и 1С.
          </p>
        </div>

        {isDirector && (
          <a
            href="/admin/products/manage"
            className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 transition"
          >
            Управление
          </a>
        )}
      </header>

      <ProductsTable products={products ?? []} categories={categories} />

      {/* Пагинация */}
      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: totalPages }).map((_, i) => (
          <a
            key={i}
            href={`?page=${i + 1}`}
            className={`px-3 py-1 rounded border ${
              page === i + 1
                ? 'bg-teal-500 text-white border-teal-500'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {i + 1}
          </a>
        ))}
      </div>
    </section>
  )
}
