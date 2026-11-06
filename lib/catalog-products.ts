import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase-admin";
import { categories as mockCategories, products as mockProducts } from "@/lib/mockData";

export type CatalogProduct = {
  id: string;
  name: string;
  price: number;
  image_url?: string | null;
  category?: string | null;
  short_desc?: string | null;
  full_desc?: string | null;
  stock?: number | null;
  is_active?: boolean | null;
};

/**
 * Single source of truth for guest + client pharmacy listings.
 * Always: is_active = true (aligned with «аптека» /catalog).
 */
export async function loadCatalogProducts(): Promise<{
  categories: { id: string; name: string }[];
  products: CatalogProduct[];
}> {
  try {
    if (!isSupabaseAdminConfigured()) {
      return {
        categories: mockCategories,
        products: mockProducts as unknown as CatalogProduct[],
      };
    }
    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("id, name, price, image_url, category, short_desc, full_desc, stock, is_active")
      .eq("is_active", true)
      .order("name", { ascending: true })
      .limit(10000);

    if (error) throw error;

    if (!products?.length) {
      return {
        categories: mockCategories,
        products: mockProducts as unknown as CatalogProduct[],
      };
    }

    const categories = Array.from(
      new Set(products.map((p) => p.category).filter(Boolean))
    ).map((name) => ({
      id: String(name).toLowerCase().replace(/\s+/g, "-"),
      name: String(name),
    }));

    return { categories, products: products as CatalogProduct[] };
  } catch (err: any) {
    console.error("loadCatalogProducts:", err?.message || err);
    return {
      categories: mockCategories,
      products: mockProducts as unknown as CatalogProduct[],
    };
  }
}
