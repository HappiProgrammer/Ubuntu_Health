'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { AlertCircle, Clock, MapPin, Activity, Send } from 'lucide-react'

interface CareRequestFormProps {
  userId: string
  onSubmit?: () => void
}

export default function CareRequestForm({ userId, onSubmit }: CareRequestFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isMockMode = (supabase as any).isMockMode

  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: '',
    symptoms: '',
    urgency: 'medium' as 'low' | 'medium' | 'high' | 'emergency',
    location: '',
    preferredDate: '',
    preferredTime: '',
    specialRequirements: '',
    contactPhone: ''
  })

  const urgencyLevels = [
    {
      value: 'low',
      label: 'Low Priority',
      color: 'bg-blue-50 border-blue-300 text-blue-700',
      icon: '🟢',
      description: 'General check-up, routine care'
    },
    {
      value: 'medium',
      label: 'Medium Priority',
      color: 'bg-yellow-50 border-yellow-300 text-yellow-700',
      icon: '🟡',
      description: 'Mild symptoms, needs attention within 24-48 hours'
    },
    {
      value: 'high',
      label: 'High Priority',
      color: 'bg-orange-50 border-orange-300 text-orange-700',
      icon: '🟠',
      description: 'Moderate symptoms, needs attention within 12 hours'
    },
    {
      value: 'emergency',
      label: 'Emergency',
      color: 'bg-red-50 border-red-300 text-red-700',
      icon: '🔴',
      description: 'Severe symptoms, immediate attention required'
    }
  ]

  const handleSubmit = async () => {
    if (!formData.patientName || !formData.symptoms || !formData.location) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)

    if (isMockMode) {
      // Mock submission
      const request = {
        id: `cr_${Date.now()}`,
        patientId: userId,
        ...formData,
        patientAge: parseInt(formData.patientAge) || 0,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        matchedNurseId: null
      }

      // Store in localStorage
      const requests = JSON.parse(localStorage.getItem('care_requests') || '[]')
      requests.push(request)
      localStorage.setItem('care_requests', JSON.stringify(requests))

      setLoading(false)
      alert('Care request submitted! We will match you with a nurse shortly.')
      if (onSubmit) onSubmit()
      router.push('/dashboard')
      return
    }

    try {
      const { data, error } = await supabase
        .from('care_requests')
        .insert({
          id: crypto.randomUUID(),
          client_id: userId,
          title: `Care Request: ${formData.patientName}`,
          description: formData.symptoms,
          care_type: 'General Care', // Defaulting for now
          urgency: formData.urgency === 'emergency' ? 'high' : formData.urgency,
          location_address: formData.location,
          location_lat: 0,
          location_lng: 0,
          start_date: formData.preferredDate || new Date().toISOString().split('T')[0],
          budget: 5000, // Default budget
          status: 'open',
          requirements: formData.specialRequirements ? [formData.specialRequirements] : []
        })
        .select()
        .single()

      if (error) throw error

      alert('Care request submitted successfully! We will match you with a nurse shortly.')
      if (onSubmit) onSubmit()
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Error submitting care request:', error)
      alert(error.message || 'Failed to submit request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF2E1] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-md border border-[#E8DCC8] p-6 mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-[#FF6044] rounded-md flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#5C4B37]">Request Care Service</h1>
              <p className="text-sm text-[#8B7355]">Submit your care needs and we'll match you with the best nurse</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md border border-[#E8DCC8] p-6 space-y-6">
          {/* Patient Information */}
          <div>
            <h2 className="text-lg font-bold text-[#5C4B37] mb-4">Patient Information</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold text-[#5C4B37] mb-2">
                  Patient Name *
                </label>
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                  className="w-full px-4 py-3 border border-[#E8DCC8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A79277] focus:border-transparent"
                  placeholder="Full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#5C4B37] mb-2">
                  Patient Age *
                </label>
                <input
                  type="number"
                  value={formData.patientAge}
                  onChange={(e) => setFormData(prev => ({ ...prev, patientAge: e.target.value }))}
                  className="w-full px-4 py-3 border border-[#E8DCC8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A79277] focus:border-transparent"
                  placeholder="e.g., 45"
                  min="0"
                  max="150"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-[#5C4B37] mb-2">
                Contact Phone
              </label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                className="w-full px-4 py-3 border border-[#E8DCC8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A79277] focus:border-transparent"
                placeholder="+237 6XX XXX XXX"
              />
            </div>
          </div>

          {/* Symptoms & Urgency */}
          <div>
            <h2 className="text-lg font-bold text-[#5C4B37] mb-4">Symptoms & Urgency</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-bold text-[#5C4B37] mb-2">
                Describe Symptoms / Care Needed *
              </label>
              <textarea
                value={formData.symptoms}
                onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                className="w-full px-4 py-3 border border-[#E8DCC8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A79277] focus:border-transparent"
                rows={4}
                placeholder="Describe the symptoms, condition, or type of care needed..."
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-[#5C4B37] mb-3">
                Urgency Level *
              </label>
              <div className="space-y-2">
                {urgencyLevels.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setFormData(prev => ({ ...prev, urgency: level.value as any }))}
                    className={`w-full flex items-center space-x-3 p-4 border-2 rounded-md transition-all ${
                      formData.urgency === level.value
                        ? level.color + ' border-current'
                        : 'bg-white border-[#E8DCC8] hover:border-[#A79277]'
                    }`}
                  >
                    <span className="text-2xl">{level.icon}</span>
                    <div className="flex-1 text-left">
                      <p className="font-bold">{level.label}</p>
                      <p className="text-xs opacity-75">{level.description}</p>
                    </div>
                    {formData.urgency === level.value && (
                      <div className="w-6 h-6 bg-current rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Location & Preferences */}
          <div>
            <h2 className="text-lg font-bold text-[#5C4B37] mb-4">Location & Preferences</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-bold text-[#5C4B37] mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                Location Address *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-4 py-3 border border-[#E8DCC8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A79277] focus:border-transparent"
                placeholder="e.g., Akwa, Douala"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold text-[#5C4B37] mb-2">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferredDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-[#E8DCC8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A79277] focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#5C4B37] mb-2">
                  Preferred Time
                </label>
                <input
                  type="time"
                  value={formData.preferredTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferredTime: e.target.value }))}
                  className="w-full px-4 py-3 border border-[#E8DCC8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A79277] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#5C4B37] mb-2">
                Special Requirements
              </label>
              <textarea
                value={formData.specialRequirements}
                onChange={(e) => setFormData(prev => ({ ...prev, specialRequirements: e.target.value }))}
                className="w-full px-4 py-3 border border-[#E8DCC8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A79277] focus:border-transparent"
                rows={3}
                placeholder="Any specific requirements, allergies, or preferences..."
              />
            </div>
          </div>

          {/* Emergency Warning */}
          {formData.urgency === 'emergency' && (
            <div className="bg-red-50 border-2 border-red-300 rounded-md p-4 flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-700 mb-1">Emergency Request</p>
                <p className="text-sm text-red-600">
                  This will prioritize your request for immediate attention. If this is a life-threatening emergency, 
                  please call emergency services directly: <strong>112</strong> or <strong>130</strong>
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-4 bg-[#FF6044] text-white rounded-md hover:bg-[#e5553a] transition-colors font-bold text-lg disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
            <span>{loading ? 'Submitting...' : 'Submit Care Request'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
