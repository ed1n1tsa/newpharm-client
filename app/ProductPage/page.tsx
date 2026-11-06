import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import ProductPageClient from '@/app/client/products/[id]/ProductPageClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Товар — NewPharm',
}

type SearchParams = { id?: string }

export default async function ProductPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams> | SearchParams
}) {
  const sp = await Promise.resolve(searchParams)
  const id = sp?.id?.trim()
  if (!id) return notFound()

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('id, name, full_desc, short_desc, price, image_url, category, stock')
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle()

  if (error || !data) {
    console.error('ProductPage load failed:', error?.message)
    return notFound()
  }

  return <ProductPageClient product={data} />
}
