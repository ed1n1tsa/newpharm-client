"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export default function Pagination({ totalPages }: { totalPages: number }) {
  const router = useRouter()
  const params = useSearchParams()
  const current = parseInt(params.get("page") || "1")
  const [loading, setLoading] = useState(false)

  function handlePageChange(page: number) {
    if (page === current) return
    setLoading(true)
    router.push(`/?page=${page}`)
    setTimeout(() => setLoading(false), 400) // имитация анимации
  }

  return (
    <div className="flex justify-center mt-8 gap-2 flex-wrap">
      {Array.from({ length: totalPages }).map((_, i) => {
        const page = i + 1
        return (
          <button
            key={page}
            disabled={loading}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-2 rounded-lg border text-sm transition ${
              current === page
                ? "bg-emerald-500 text-white border-emerald-500"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            } ${loading ? "opacity-50 cursor-wait" : ""}`}
          >
            {page}
          </button>
        )
      })}
    </div>
  )
}
