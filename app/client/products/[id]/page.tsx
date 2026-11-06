import { redirect } from 'next/navigation'

/** Legacy /client/products/:id → public ProductPage */
export default async function ClientProductRedirect(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  redirect(`/ProductPage?id=${encodeURIComponent(id)}`)
}
