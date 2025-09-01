'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Branch {
  id: number
  title: string
  address: string
  lat: number
  lng: number
}

// Исправляем путь иконок Leaflet
delete (L.Icon.Default.prototype as { _getIconUrl?: () => void })._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: '/leaflet/marker-icon.png',
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  shadowUrl: '/leaflet/marker-shadow.png',
})

export default function BranchesMap({ branches }: { branches: Branch[] }) {
  return (
    <MapContainer
      center={[43.238949, 76.889709]}
      zoom={5}
      scrollWheelZoom
      className="h-full w-full"
      style={{ zIndex: 0, position: 'relative' }} // 👈 добавили сюда!
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {branches.map((branch) => (
        <Marker key={branch.id} position={[branch.lat, branch.lng]}>
          <Popup>
            <p className="font-bold">{branch.title}</p>
            <p className="text-sm">{branch.address}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
