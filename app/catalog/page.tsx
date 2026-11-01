import CatalogView from "@/ui/ProductList";
import ServicesSection from "@/ui/ServicesSection";
import { categories as mockCategories, products as mockProducts } from "@/lib/mockData";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const metadata = {
  title: "Каталог — NewPharm",
};

async function getProducts() {
  try {
    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(10000);

    if (error) throw error;

    if (!products?.length) {
      return { categories: mockCategories, products: mockProducts as any };
    }

    const categories = Array.from(
      new Set(products.map((p) => p.category).filter(Boolean))
    ).map((name) => ({
      id: String(name).toLowerCase().replace(/\s+/g, "-"),
      name: String(name),
    }));

    return { categories, products };
  } catch (err: any) {
    console.error("Ошибка загрузки из Supabase:", err.message);
    return { categories: mockCategories, products: mockProducts as any };
  }
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }> | { q?: string };
}) {
  const { categories, products } = await getProducts();
  const sp = await Promise.resolve(searchParams);
  const initialSearch = sp?.q ? String(sp.q) : "";

  return (
    <main className="min-h-screen">
      <section className="container mx-auto px-4 pt-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800">
            Каталог товаров
          </h1>
        </div>
      </section>

      <CatalogView
        categories={categories}
        allProducts={products}
        initialSearch={initialSearch}
      />

      <ServicesSection />
    </main>
  );
}
