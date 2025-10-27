// app/catalog/page.tsx
import CatalogView from "@/ui/ProductList";
import ServicesSection from "@/ui/ServicesSection";
import { categories as mockCategories, products as mockProducts } from "@/lib/mockData";
import { supabaseAdmin } from "@/lib/supabase-admin"; // серверный клиент Supabase

export const metadata = {
  title: "Каталог — Нью-Фарм",
};

async function getProducts() {
  try {
    console.log("📡 Загружаем товары из Supabase...");

    // 🔹 Получаем активные товары
    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(1000);

    if (error) throw error;

    console.log("✅ Получено из Supabase:", products?.length || 0);

    if (!products?.length) {
      console.warn("⚠️ В Supabase нет товаров — используем mockData");
      return { categories: mockCategories, products: mockProducts };
    }

    // 🧩 Формируем категории из таблицы товаров
    const categories = Array.from(
      new Set(products.map((p) => p.category).filter(Boolean))
    ).map((name) => ({
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
    }));

    console.log(`📊 Категорий: ${categories.length}`);

    return { categories, products };
  } catch (err: any) {
    console.error("❌ Ошибка загрузки из Supabase:", err.message);
    return { categories: mockCategories, products: mockProducts };
  }
}

export default async function CatalogPage() {
  const { categories, products } = await getProducts();

  return (
    <main className="min-h-screen">
      {/* Заголовок + поиск */}
      <section className="container mx-auto px-4 pt-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800">
            Каталог товаров
          </h1>

          {/* Поиск */}
          
        </div>
      </section>

      {/* Контент: фильтр + карточки */}
      <CatalogView categories={categories} allProducts={products} />

      <ServicesSection />
    </main>
  );
}
