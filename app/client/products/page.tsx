import { redirect } from 'next/navigation'

/** Legacy /client/products → public guest /catalog */
export default async function ClientProductsRedirect({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }> | { q?: string }
}) {
  const sp = await Promise.resolve(searchParams)
  const q = sp?.q ? String(sp.q) : ''
  redirect(q ? `/catalog?q=${encodeURIComponent(q)}` : '/catalog')
}
