import { redirect } from 'next/navigation'

/** Legacy /client/orders → public guest /orders */
export default function ClientOrdersRedirect() {
  redirect('/orders')
}
