'use client'

import { Suspense } from 'react'
import CheckoutContent from './CheckoutContent'

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="text-white p-10 text-center">Загрузка...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}