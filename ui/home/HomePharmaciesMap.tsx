'use client'

import { useEffect } from 'react'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { PharmacyLocation } from '@/lib/pharmacy-locations'

const pinIcon = L.icon({
  iconUrl: '/home/map-pin.png',
  iconRetinaUrl: '/home/map-pin.png',
  iconSize: [36, 48],
  iconAnchor: [18, 46],
  popupAnchor: [0, -40],
  className: 'np-map-pin',
})

function Fit({ pharmacies, activeId }: { pharmacies: PharmacyLocation[]; activeId: string | null }) {
  const map = useMap()
  useEffect(() => {
    if (!pharmacies.length) return
    const active = pharmacies.find((p) => p.warehouseId === activeId)
    if (active) {
      map.flyTo([active.lat, active.lng], 15, { duration: 0.6 })
      return
    }
    const bounds = L.latLngBounds(pharmacies.map((p) => [p.lat, p.lng] as [number, number]))
    map.fitBounds(bounds.pad(0.35))
  }, [pharmacies, activeId, map])
  return null
}

export default function HomePharmaciesMap({
  pharmacies,
  activeId,
  onSelect,
}: {
  pharmacies: PharmacyLocation[]
  activeId: string | null
  onSelect: (id: string) => void
}) {
  const center = pharmacies[0]
    ? ([pharmacies[0].lat, pharmacies[0].lng] as [number, number])
    : ([47.1167, 51.8833] as [number, number])

  return (
    <MapContainer
      center={center}
      zoom={13}
      className="h-full w-full min-h-[280px]"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Fit pharmacies={pharmacies} activeId={activeId} />
      {pharmacies.map((p) => (
        <Marker
          key={p.warehouseId}
          position={[p.lat, p.lng]}
          icon={pinIcon}
          eventHandlers={{ click: () => onSelect(p.warehouseId) }}
        />
      ))}
    </MapContainer>
  )
}
