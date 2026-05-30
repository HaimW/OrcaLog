'use client'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet default icon in webpack
// @ts-expect-error — Leaflet's _getIconUrl is not in the type definitions
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface MapEntry {
  id: string
  coordLat: number | null
  coordLng: number | null
  location: string | null
  date: string
  depth: number | null
}

interface DiveMapProps {
  entries: MapEntry[]
}

export default function DiveMap({ entries }: DiveMapProps) {
  const validEntries = entries.filter(e => e.coordLat != null && e.coordLng != null)

  return (
    <MapContainer
      center={[31.5, 34.8]}
      zoom={7}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {validEntries.map(entry => (
        <Marker key={entry.id} position={[entry.coordLat!, entry.coordLng!]}>
          <Popup>
            <strong>{entry.location || 'Unknown location'}</strong><br />
            {entry.date}{entry.depth ? ` · ${entry.depth}m` : ''}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
