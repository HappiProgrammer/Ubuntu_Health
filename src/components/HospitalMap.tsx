'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { X, Maximize2, Minimize2 } from 'lucide-react'

interface Hospital {
  id: string
  name: string
  lat: number
  lng: number
  address: string
  queueLength: number
  estimatedWait: number
}

// Fix Leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap()
  map.setView(center, zoom)
  return null
}

interface HospitalMapProps {
  hospitals: Hospital[]
  center?: [number, number]
  zoom?: number
}

export default function HospitalMap({ 
  hospitals, 
  center = [4.0511, 9.7679],
  zoom = 12
}: HospitalMapProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <div className="h-64 bg-[#F7E7CE] rounded-md flex items-center justify-center">
      <p className="text-[#8B7355]">Loading map...</p>
    </div>
  }

  return (
    <>
      {/* Map Container */}
      <div className={`relative transition-all duration-300 ${
        isFullscreen 
          ? 'fixed inset-0 z-[9999] bg-black' 
          : 'h-64 rounded-md overflow-hidden border border-[#E8DCC8]'
      }`}>
        {/* Fullscreen toggle */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="absolute top-2 right-2 z-[1000] p-2 bg-white rounded-md shadow-md hover:bg-[#F7E7CE] transition-colors"
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4 text-[#5C4B37]" />
          ) : (
            <Maximize2 className="h-4 w-4 text-[#5C4B37]" />
          )}
        </button>

        {/* Close button for fullscreen */}
        {isFullscreen && (
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-2 left-2 z-[1000] p-2 bg-white rounded-md shadow-md hover:bg-[#F7E7CE] transition-colors"
          >
            <X className="h-4 w-4 text-[#5C4B37]" />
          </button>
        )}

        <MapContainer
          center={center}
          zoom={isFullscreen ? zoom + 1 : zoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <ChangeView center={center} zoom={zoom} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {hospitals.map((hospital) => (
            <Marker
              key={hospital.id}
              position={[hospital.lat, hospital.lng]}
            >
              <Popup>
                <div className="p-2 min-w-[220px]">
                  <h3 className="font-bold text-[#5C4B37] mb-1">{hospital.name}</h3>
                  <p className="text-xs text-[#8B7355] mb-2">{hospital.address}</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#8B7355]">Queue:</span>
                      <span className="font-semibold text-[#5C4B37]">{hospital.queueLength} patients</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8B7355]">Wait time:</span>
                      <span className="font-semibold text-[#A79277]">~{hospital.estimatedWait} min</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </>
  )
}
