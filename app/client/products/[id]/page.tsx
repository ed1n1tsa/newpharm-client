import { supabaseAdmin } from "@/lib/supabase-admin"
import ProductPageClient from "./ProductPageClient"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Товар — Нью-Фарм",
}

async function getProduct(id: string) {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("id, name, full_desc, short_desc, price, image_url, category, stock")
    .eq("id", id)
    .single()

  if (error || !data) {
    console.error("❌ Ошибка загрузки товара:", error?.message)
    return null
  }
  return data
}

export default async function ProductPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const product = await getProduct(id)
  if (!product) return notFound()

  return <ProductPageClient product={product} />
}
