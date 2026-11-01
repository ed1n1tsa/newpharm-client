import { Suspense } from 'react'
import CheckoutContent from './CheckoutContent'

export const metadata = {
  title: 'Оформление заказа — NewPharm',
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-slate-500">Загрузка оформления…</div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}
