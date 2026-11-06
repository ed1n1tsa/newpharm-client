import { redirect } from 'next/navigation'

/** Legacy /client/orders/:id → public guest /orders */
export default function ClientOrderDetailRedirect() {
  redirect('/orders')
}
