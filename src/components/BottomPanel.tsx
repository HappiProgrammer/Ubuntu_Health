'use client'

import { useState, useEffect } from 'react'
import { ChevronUp, ChevronDown, MapPin, Clock, Users, Activity } from 'lucide-react'
import HospitalMap from './HospitalMap'

interface BottomPanelProps {
  queuePosition?: number
  estimatedWait?: number
  totalInQueue?: number
  hospitals?: Array<{
    id: string
    name: string
    lat: number
    lng: number
    address: string
    queueLength: number
    estimatedWait: number
  }>
}

export default function BottomPanel({
  queuePosition,
  estimatedWait = 0,
  totalInQueue = 0,
  hospitals = []
}: BottomPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showMap, setShowMap] = useState(false)

  const hasActiveQueue = queuePosition !== undefined && queuePosition > 0

  return (
    <>
      {/* Bottom Panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[999] transition-all duration-300 ease-in-out ${
          isExpanded ? 'h-[60vh]' : 'h-16'
        }`}
      >
        {/* Panel Content */}
        <div className="h-full bg-[#1a1a2e] border-t-2 border-[#A79277] shadow-2xl">
          {/* Collapse/Expand Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-10 bg-[#1a1a2e] border-t-2 border-l-2 border-r-2 border-[#A79277] rounded-t-md flex items-center justify-center hover:bg-[#16213e] transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-[#A79277]" />
            ) : (
              <ChevronUp className="h-5 w-5 text-[#A79277]" />
            )}
          </button>

          {/* Collapsed State - Quick Status */}
          {!isExpanded && (
            <div className="h-full px-6 flex items-center justify-between">
              {hasActiveQueue ? (
                <>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-[#A79277] rounded-md flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase">Queue Position</p>
                        <p className="text-lg font-bold text-white">#{queuePosition}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-[#A79277] rounded-md flex items-center justify-center">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase">Wait Time</p>
                        <p className="text-lg font-bold text-[#A79277]">~{estimatedWait} min</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-green-500 animate-pulse" />
                      <span className="text-sm text-gray-300">Live Updates</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsExpanded(true)
                      setShowMap(true)
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#A79277] text-white rounded-md hover:bg-[#9A8469] transition-colors"
                  >
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-semibold">View Map</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-[#A79277]" />
                    <span className="text-sm text-gray-300">No active queue - Browse available appointments</span>
                  </div>
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="px-4 py-2 bg-[#A79277] text-white rounded-md hover:bg-[#9A8469] transition-colors text-sm font-semibold"
                  >
                    View Hospitals
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Expanded State */}
          {isExpanded && (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Queue Status & Hospital Map</h3>
                  <p className="text-sm text-gray-400">Real-time updates and nearby hospitals</p>
                </div>
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="px-4 py-2 bg-[#A79277] text-white rounded-md hover:bg-[#9A8469] transition-colors text-sm font-semibold"
                >
                  {showMap ? 'Show Queue' : 'Show Map'}
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {showMap ? (
                  <HospitalMap
                    hospitals={hospitals}
                    center={[4.0511, 9.7679]}
                    zoom={12}
                  />
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {/* Queue Info Card */}
                    {hasActiveQueue && (
                      <>
                        <div className="bg-[#16213e] rounded-md border border-gray-700 p-4">
                          <div className="flex items-center space-x-2 mb-3">
                            <Users className="h-5 w-5 text-[#A79277]" />
                            <span className="text-sm font-semibold text-gray-300">Your Position</span>
                          </div>
                          <p className="text-4xl font-bold text-white">#{queuePosition}</p>
                          <p className="text-xs text-gray-400 mt-1">of {totalInQueue} total</p>
                        </div>

                        <div className="bg-[#16213e] rounded-md border border-gray-700 p-4">
                          <div className="flex items-center space-x-2 mb-3">
                            <Clock className="h-5 w-5 text-[#A79277]" />
                            <span className="text-sm font-semibold text-gray-300">Estimated Wait</span>
                          </div>
                          <p className="text-4xl font-bold text-[#A79277]">{estimatedWait}</p>
                          <p className="text-xs text-gray-400 mt-1">minutes</p>
                        </div>

                        <div className="bg-[#16213e] rounded-md border border-gray-700 p-4">
                          <div className="flex items-center space-x-2 mb-3">
                            <Activity className="h-5 w-5 text-green-500" />
                            <span className="text-sm font-semibold text-gray-300">Status</span>
                          </div>
                          <p className="text-xl font-bold text-green-500">Active</p>
                          <p className="text-xs text-gray-400 mt-1">Live tracking</p>
                        </div>
                      </>
                    )}

                    {/* Hospital List */}
                    <div className="col-span-3 bg-[#16213e] rounded-md border border-gray-700 p-4">
                      <h4 className="text-sm font-bold text-white mb-3">Nearby Hospitals</h4>
                      <div className="space-y-2">
                        {hospitals.map((hospital) => (
                          <div key={hospital.id} className="flex items-center justify-between p-3 bg-[#1a1a2e] rounded-md border border-gray-700">
                            <div>
                              <p className="text-sm font-semibold text-white">{hospital.name}</p>
                              <p className="text-xs text-gray-400">{hospital.address}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-400">{hospital.queueLength} in queue</p>
                              <p className="text-sm font-bold text-[#A79277]">~{hospital.estimatedWait} min</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Spacer to prevent content from being hidden behind panel */}
      <div className="h-16"></div>
    </>
  )
}
