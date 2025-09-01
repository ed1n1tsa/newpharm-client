'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

// Импорт из app/branches/
const BranchesMap = dynamic(() => import('./BranchesMap'), { ssr: false })

interface Branch {
  id: number
  title: string
  address: string
  lat: number
  lng: number
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([])

  useEffect(() => {
    const fetchBranches = async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('id, title, address, lat, lng')

      if (error) {
        console.error('Ошибка при загрузке филиалов:', error)
      } else {
        setBranches(data || [])
      }
    }

    fetchBranches()
  }, [])

  return (
    <main className="bg-[#0d0d0d] min-h-screen text-white px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-white">
          Наши филиалы на карте
        </h1>

        <div className="h-[500px] w-full rounded-xl overflow-hidden border border-gray-700">
          <BranchesMap branches={branches} />
        </div>
      </div>
    </main>
  )
}
