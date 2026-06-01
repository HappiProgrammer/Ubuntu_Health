'use client'

import { useState } from 'react'
import { AlertTriangle, Phone, Ambulance, Clock, MapPin } from 'lucide-react'

interface EmergencyHandlerProps {
  onEmergencySubmit: (data: any) => void
}

export default function EmergencyHandler({ onEmergencySubmit }: EmergencyHandlerProps) {
  const [showEmergency, setShowEmergency] = useState(false)
  const [emergencyData, setEmergencyData] = useState({
    location: '',
    description: '',
    contactPhone: '',
    patientCount: 1
  })
  const [submitted, setSubmitted] = useState(false)

  const handleEmergencySubmit = () => {
    if (!emergencyData.location || !emergencyData.description || !emergencyData.contactPhone) {
      alert('Please fill in all emergency details')
      return
    }

    onEmergencySubmit({
      ...emergencyData,
      urgency: 'emergency',
      priority: 'IMMEDIATE',
      timestamp: new Date().toISOString()
    })

    setSubmitted(true)
    setTimeout(() => {
      setShowEmergency(false)
      setSubmitted(false)
      setEmergencyData({
        location: '',
        description: '',
        contactPhone: '',
        patientCount: 1
      })
    }, 3000)
  }

  if (!showEmergency) {
    return (
      <button
        onClick={() => setShowEmergency(true)}
        className="fixed bottom-20 right-6 z-[998] p-4 bg-red-600 text-white rounded-full shadow-2xl hover:bg-red-700 transition-all hover:scale-110 animate-pulse"
        title="Emergency Request"
      >
        <AlertTriangle className="h-6 w-6" />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-md max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Emergency Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
          <div className="flex items-center space-x-3 mb-2">
            <AlertTriangle className="h-8 w-8 animate-pulse" />
            <h2 className="text-2xl font-bold">EMERGENCY REQUEST</h2>
          </div>
          <p className="text-sm text-white/90">
            This will prioritize your request for IMMEDIATE attention
          </p>
        </div>

        {submitted ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ambulance className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-[#5C4B37] mb-2">Emergency Alert Sent!</h3>
            <p className="text-[#8B7355] mb-4">
              Nearest available nurses have been notified. Help is on the way.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
              <p className="text-sm text-yellow-700 font-semibold">
                ⚠️ If this is life-threatening, call emergency services: <strong>112</strong> or <strong>130</strong>
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {/* Emergency Info */}
            <div className="bg-red-50 border-2 border-red-200 rounded-md p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-red-700 mb-1">Emergency Response Time</p>
                  <p className="text-sm text-red-600">
                    Average response: <strong>5-15 minutes</strong> in your area
                  </p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-bold text-[#5C4B37] mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                Emergency Location *
              </label>
              <input
                type="text"
                value={emergencyData.location}
                onChange={(e) => setEmergencyData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-red-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Exact location of emergency"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-[#5C4B37] mb-2">
                Emergency Description *
              </label>
              <textarea
                value={emergencyData.description}
                onChange={(e) => setEmergencyData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-red-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={4}
                placeholder="Describe the emergency situation..."
                required
              />
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-sm font-bold text-[#5C4B37] mb-2">
                <Phone className="h-4 w-4 inline mr-1" />
                Contact Phone *
              </label>
              <input
                type="tel"
                value={emergencyData.contactPhone}
                onChange={(e) => setEmergencyData(prev => ({ ...prev, contactPhone: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-red-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="+237 6XX XXX XXX"
                required
              />
            </div>

            {/* Patient Count */}
            <div>
              <label className="block text-sm font-bold text-[#5C4B37] mb-2">
                Number of Patients
              </label>
              <input
                type="number"
                value={emergencyData.patientCount}
                onChange={(e) => setEmergencyData(prev => ({ ...prev, patientCount: parseInt(e.target.value) || 1 }))}
                className="w-full px-4 py-3 border border-[#E8DCC8] rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                min="1"
                max="50"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => setShowEmergency(false)}
                className="flex-1 py-3 bg-[#F7E7CE] text-[#5C4B37] rounded-md hover:bg-[#E8DCC8] transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleEmergencySubmit}
                className="flex-1 flex items-center justify-center space-x-2 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-bold"
              >
                <Ambulance className="h-5 w-5" />
                <span>SEND EMERGENCY ALERT</span>
              </button>
            </div>

            {/* Emergency Numbers */}
            <div className="bg-[#F7E7CE] rounded-md p-4 border border-[#E8DCC8]">
              <p className="text-xs font-bold text-[#5C4B37] mb-2">Emergency Hotlines:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Phone className="h-3 w-3 text-[#A79277]" />
                  <span className="text-[#8B7355]">General: <strong>112</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-3 w-3 text-[#A79277]" />
                  <span className="text-[#8B7355]">Medical: <strong>130</strong></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
