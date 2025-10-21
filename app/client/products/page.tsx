import CatalogView from "@/ui/ProductList"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { categories as mockCategories, products as mockProducts } from "@/lib/mockData"

export const metadata = {
  title: "Аптека — Нью-Фарм",
}

// 🔹 Функция загрузки товаров
async function getProducts() {
  try {
    console.log("📡 Загружаем товары для клиента из Supabase...")

    // Берем только активные товары
    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(1000)

    if (error) throw error

    console.log("✅ Получено из Supabase:", products?.length || 0)

    if (!products?.length) {
      console.warn("⚠️ В Supabase нет товаров — используем mockData")
      return { categories: mockCategories, products: mockProducts }
    }

    // 🧩 Формируем категории из поля category
    const categories = Array.from(
      new Set(products.map((p) => p.category).filter(Boolean))
    ).map((name) => ({
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
    }))

    console.log(`📊 Категорий: ${categories.length}`)
    return { categories, products }
  } catch (err: any) {
    console.error("❌ Ошибка загрузки из Supabase:", err.message)
    return { categories: mockCategories, products: mockProducts }
  }
}

export default async function ClientProductsPage() {
  const { categories, products } = await getProducts()

  return (
    <main className="min-h-screen">
      {/* Заголовок и поиск */}
      <section className="container mx-auto px-4 pt-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800">
            Аптека
          </h1>

          {/* Поиск */}
          <form action="#" className="w-full md:w-[420px] items-center flex gap-2">
            <input
              name="q"
              placeholder="Поиск по названию товара..."
              className="w-full rounded-full border border-slate-200 px-5 py-3 outline-none focus:border-teal-500"
            />
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-teal-500 text-white">
              <svg
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
          </form>
        </div>
      </section>

      {/* Категории + карточки товаров */}
      <CatalogView categories={categories} allProducts={products} />
    </main>
  )
}
