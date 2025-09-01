// app/catalog/page.tsx
import { categories, products } from "@/lib/mockData";
import CatalogView from "@/ui/ProductList";
import ServicesSection from '@/ui/ServicesSection'
export const metadata = {
  title: "Каталог — Нью-Фарм",
};

export default function CatalogPage() {
  return (
    <main className="min-h-screen">
      {/* Заголовок + поиск */}
      <section className="container mx-auto px-4 pt-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800">
            Каталог товаров
          </h1>

          {/* Поиск */}
          <form
            action="#"
            className="w-full md:w-[420px] items-center flex gap-2"
          >
            <input
              name="q"
              placeholder="Поиск по названию товара"
              className="w-full rounded-full border border-slate-200 px-5 py-3 outline-none focus:border-teal-500"
            />
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-teal-500 text-white">
              {/* Лупа */}
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
          </form>
        </div>
      </section>

      {/* Контент: фильтр + карточки */}
      <CatalogView categories={categories} allProducts={products} />

       <ServicesSection />
    </main>
  );
}
