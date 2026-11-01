export type City = {
  id: string
  name: string
  /** Approx center for geo matching */
  lat: number
  lng: number
  /** Radius in km to consider "in city" */
  radiusKm: number
}

export const DEFAULT_CITY_ID = 'atyrau'

export const CITIES: City[] = [
  { id: 'atyrau', name: 'Атырау', lat: 47.1167, lng: 51.8833, radiusKm: 40 },
  { id: 'kaskelen', name: 'Каскелен', lat: 43.1989, lng: 76.6311, radiusKm: 25 },
  { id: 'almaty', name: 'Алматы', lat: 43.2389, lng: 76.8897, radiusKm: 40 },
  { id: 'astana', name: 'Астана', lat: 51.1694, lng: 71.4491, radiusKm: 40 },
]

export function cityById(id: string | null | undefined): City {
  return CITIES.find((c) => c.id === id) || CITIES.find((c) => c.id === DEFAULT_CITY_ID)!
}

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371
  const dLat = ((bLat - aLat) * Math.PI) / 180
  const dLng = ((bLng - aLng) * Math.PI) / 180
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) *
      Math.cos((bLat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

/** Pick nearest city within its radius, else default Atyrau. */
export function detectCity(lat: number, lng: number): City {
  let best: { city: City; dist: number } | null = null
  for (const city of CITIES) {
    const dist = haversineKm(lat, lng, city.lat, city.lng)
    if (dist <= city.radiusKm && (!best || dist < best.dist)) {
      best = { city, dist }
    }
  }
  return best?.city || cityById(DEFAULT_CITY_ID)
}
