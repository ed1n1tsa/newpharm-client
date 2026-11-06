import { pharmacyDisplayName } from '@/lib/pharmacy'

export type PharmacyLocation = {
  warehouseId: string
  name: string
  address: string
  phone: string | null
  lat: number
  lng: number
  cityId: string
  hours?: string
}

/** Static geo/address for 3 Atyrau pharmacies (warehouses have no lat/address yet). */
export const PHARMACY_LOCATIONS: PharmacyLocation[] = [
  {
    warehouseId: 'fb46e2d1-a788-407e-972b-a1ad373a26ea',
    name: 'Аптека Алмагул',
    address: 'мкр. Алмагуль, Атырау',
    phone: '7759849959',
    lat: 47.1182,
    lng: 51.8914,
    cityId: 'atyrau',
    hours: '09:00–22:00',
  },
  {
    warehouseId: '4081629c-f329-43ca-96b3-d97c5bf5cf0d',
    name: 'Аптека Нурсая',
    address: 'мкр. Нурсая, Атырау',
    phone: '77757470939',
    lat: 47.0948,
    lng: 51.9126,
    cityId: 'atyrau',
    hours: '09:00–22:00',
  },
  {
    warehouseId: 'bf62b97a-fdd2-4aa5-91a3-944c2d7b5fcc',
    name: 'Аптека Привокзальная',
    address: 'район вокзала, Атырау',
    phone: '7020326902',
    lat: 47.1071,
    lng: 51.9208,
    cityId: 'atyrau',
    hours: '09:00–22:00',
  },
]

export function pharmaciesForCity(cityId: string): PharmacyLocation[] {
  return PHARMACY_LOCATIONS.filter((p) => p.cityId === cityId)
}

export function mergeWarehousePhone(
  loc: PharmacyLocation,
  warehouse?: { id: string; name?: string; phone?: string | null } | null
): PharmacyLocation {
  if (!warehouse) return loc
  return {
    ...loc,
    name: warehouse.name ? pharmacyDisplayName(warehouse.name) : loc.name,
    phone: warehouse.phone || loc.phone,
  }
}
