'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { CITIES, DEFAULT_CITY_ID, cityById, detectCity, type City } from '@/lib/cities'

const STORAGE_KEY = 'newpharm_city_id'
const MANUAL_KEY = 'newpharm_city_manual'

type CityContextValue = {
  city: City
  cities: City[]
  setCityId: (id: string) => void
  detecting: boolean
}

const CityContext = createContext<CityContextValue | null>(null)

export function CityProvider({ children }: { children: ReactNode }) {
  const [cityId, setCityIdState] = useState(DEFAULT_CITY_ID)
  const [detecting, setDetecting] = useState(true)

  useEffect(() => {
    try {
      const manual = localStorage.getItem(MANUAL_KEY) === '1'
      const saved = localStorage.getItem(STORAGE_KEY)
      if (manual && saved) {
        setCityIdState(saved)
        setDetecting(false)
        return
      }
      if (!navigator.geolocation) {
        if (saved) setCityIdState(saved)
        setDetecting(false)
        return
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const detected = detectCity(pos.coords.latitude, pos.coords.longitude)
          setCityIdState(detected.id)
          localStorage.setItem(STORAGE_KEY, detected.id)
          setDetecting(false)
        },
        () => {
          if (saved) setCityIdState(saved)
          setDetecting(false)
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 600_000 }
      )
    } catch {
      setDetecting(false)
    }
  }, [])

  const setCityId = useCallback((id: string) => {
    setCityIdState(id)
    try {
      localStorage.setItem(STORAGE_KEY, id)
      localStorage.setItem(MANUAL_KEY, '1')
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo(
    () => ({
      city: cityById(cityId),
      cities: CITIES,
      setCityId,
      detecting,
    }),
    [cityId, setCityId, detecting]
  )

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>
}

export function useCity() {
  const ctx = useContext(CityContext)
  if (!ctx) throw new Error('useCity must be used within CityProvider')
  return ctx
}
