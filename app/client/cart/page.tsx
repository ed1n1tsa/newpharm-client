'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Legacy /client/cart → единый публичный /cart */
export default function ClientCartRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/cart')
  }, [router])
  return (
    <div className="min-h-[40vh] flex items-center justify-center text-slate-500">
      Переходим в корзину…
    </div>
  )
}
