'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface NurseLocation {
  id: string
  name: string
  specialty: string
  lat: number
  lng: number
  rating: number
  available: boolean
  distance?: string
}

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom marker icons
const createCustomIcon = (available: boolean) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="relative">
        <div class="w-10 h-10 rounded-full ${available ? 'bg-[#A79277]' : 'bg-gray-400'} border-2 border-white shadow-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        ${available ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>' : ''}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  })
}

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap()
  map.setView(center, zoom)
  return null
}

interface NurseMapProps {
  nurses: NurseLocation[]
  center?: [number, number]
  zoom?: number
  height?: string
}

export default function NurseMap({ 
  nurses, 
  center = [4.0511, 9.7679], // Default to Douala, Cameroon
  zoom = 12,
  height = '500px'
}: NurseMapProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div 
        className="bg-[#F7E7CE] rounded-lg border border-[#E8DCC8] flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A79277] mx-auto mb-4"></div>
          <p className="text-[#8B7355] font-medium">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg overflow-hidden border border-[#E8DCC8] shadow-sm">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height, width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <ChangeView center={center} zoom={zoom} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {nurses.map((nurse) => (
          <Marker
            key={nurse.id}
            position={[nurse.lat, nurse.lng]}
            icon={createCustomIcon(nurse.available)}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-[#5C4B37] mb-1">{nurse.name}</h3>
                <p className="text-sm text-[#8B7355] mb-2">{nurse.specialty}</p>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[#A79277]">⭐ {nurse.rating}</span>
                  {nurse.distance && <span className="text-[#8B7355]">{nurse.distance}</span>}
                </div>
                <div className={`px-2 py-1 rounded text-xs font-semibold text-center ${
                  nurse.available 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {nurse.available ? 'Available' : 'Busy'}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
