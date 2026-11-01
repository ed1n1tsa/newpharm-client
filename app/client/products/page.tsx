import CatalogView from "@/ui/ProductList"
import { loadCatalogProducts } from "@/lib/catalog-products"

export const metadata = {
  title: "Аптека — NewPharm",
}

export default async function ClientProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }> | { q?: string }
}) {
  const { categories, products } = await loadCatalogProducts()
  const sp = await Promise.resolve(searchParams)
  const initialSearch = sp?.q ? String(sp.q) : ""

  return (
    <main className="min-h-screen">
      <section className="container mx-auto px-4 pt-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800">
            Аптека
          </h1>
        </div>
      </section>

      <CatalogView
        categories={categories}
        allProducts={products}
        initialSearch={initialSearch}
      />
    </main>
  )
}
