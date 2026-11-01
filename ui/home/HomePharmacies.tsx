'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ChevronRight, MapPin } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useCity } from '@/ui/CityProvider'
import { pharmaciesForCity, type PharmacyLocation } from '@/lib/pharmacy-locations'

const Map = dynamic(() => import('./HomePharmaciesMap'), { ssr: false })

function isOpenNow() {
  const h = new Date().getHours()
  return h >= 9 && h < 22
}

export default function HomePharmacies() {
  const { city } = useCity()
  const list = useMemo(() => pharmaciesForCity(city.id), [city.id])
  const [activeId, setActiveId] = useState<string | null>(null)

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-end justify-between mb-5 gap-3">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900">
          Наши аптеки в {city.name}
        </h2>
        <Link href="/branches" className="text-sm font-semibold text-emerald-600 shrink-0">
          Все аптеки →
        </Link>
      </div>

      {!list.length ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
          В городе {city.name} аптеки NewPharm пока не отмечены. Выберите Атырау или посмотрите филиалы.
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          <ul className="rounded-3xl border border-slate-100 bg-white divide-y divide-slate-100 overflow-hidden shadow-sm">
            {list.map((p) => {
              const active = activeId === p.warehouseId
              return (
                <li key={p.warehouseId}>
                  <button
                    type="button"
                    onClick={() => setActiveId(p.warehouseId)}
                    className={`w-full text-left px-4 py-4 flex items-start gap-3 hover:bg-emerald-50/70 transition ${
                      active ? 'bg-emerald-50' : ''
                    }`}
                  >
                    <span className="mt-0.5 grid place-items-center h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                      <MapPin size={16} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="font-semibold text-slate-900 block">{p.name}</span>
                      <span className="text-sm text-slate-500 block truncate">{p.address}</span>
                      <span className="mt-1 inline-flex text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">
                        {isOpenNow() ? 'Открыта' : 'Закрыта'}
                      </span>
                    </span>
                    <ChevronRight className="text-slate-300 shrink-0 mt-2" size={18} />
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="relative rounded-3xl overflow-hidden border border-slate-100 shadow-sm min-h-[280px] bg-slate-100">
            <Map pharmacies={list} activeId={activeId} onSelect={setActiveId} />
            <Link
              href="/branches"
              className="absolute right-3 bottom-3 z-[500] rounded-full bg-white/95 border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-800 shadow"
            >
              На карте ↗
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}

export type { PharmacyLocation }
