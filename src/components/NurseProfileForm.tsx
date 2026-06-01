'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Camera, Plus, X, Save, Upload, CheckCircle } from 'lucide-react'

interface NurseProfileFormProps {
  userId: string
  onComplete?: () => void
}

export default function NurseProfileForm({ userId, onComplete }: NurseProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const isMockMode = (supabase as any).isMockMode

  const [formData, setFormData] = useState({
    bio: '',
    age: '',
    yearsOfExperience: '',
    specialties: [] as string[],
    availableDays: [] as string[],
    availableTimeSlots: [] as string[],
    hobbies: [] as string[],
    languagesSpoken: [] as string[],
    certifications: [] as string[],
    location_address: '',
    pricing_per_hour: '',
    profilePhoto: ''
  })

  const [newItem, setNewItem] = useState({
    specialty: '',
    hobby: '',
    language: '',
    certification: '',
    timeSlot: ''
  })

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const addToArray = (field: string, value: string) => {
    if (!value.trim()) return
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field as keyof typeof prev] as string[], value.trim()]
    }))
    setNewItem(prev => ({ ...prev, [field]: '' }))
  }

  const removeFromArray = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter((_, i) => i !== index)
    }))
  }

  const toggleDay = (day: string) => {
    setFormData(prev => {
      const days = prev.availableDays as string[]
      return {
        ...prev,
        availableDays: days.includes(day)
          ? days.filter(d => d !== day)
          : [...days, day]
      }
    })
  }

  const handleSubmit = async () => {
    setLoading(true)

    try {
      if (isMockMode) {
        // Store in localStorage for mock mode
        const profile = {
          userId,
          ...formData,
          yearsOfExperience: parseInt(formData.yearsOfExperience) || 0,
          pricing_per_hour: parseFloat(formData.pricing_per_hour) || 0,
          applicationStatus: 'pending',
          interviewScheduled: false,
          completedAt: new Date().toISOString()
        }
        
        localStorage.setItem(`nurse_profile_${userId}`, JSON.stringify(profile))
        
        // Update mock_profiles
        const profiles = JSON.parse(localStorage.getItem('mock_profiles') || '[]')
        const updatedProfiles = profiles.map((p: any) => 
          p.id === userId 
            ? { ...p, verification_status: 'pending', is_verified: false, bio: formData.bio }
            : p
        )
        localStorage.setItem('mock_profiles', JSON.stringify(updatedProfiles))
        
        alert('Profile submitted for admin review!')
        if (onComplete) onComplete()
        router.push('/dashboard')
        return
      }

      // 1. Update Profile table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          bio: formData.bio,
          location_address: formData.location_address,
          verification_status: 'pending'
        })
        .eq('id', userId)

      if (profileError) throw profileError

      // 2. Check if nurse_profile exists, then update or insert
      const { data: existingNurseProfile } = await supabase
        .from('nurse_profiles')
        .select('id')
        .eq('user_id', userId)
        .single()

      const nurseProfileData = {
        user_id: userId,
        license_number: `LIC-${userId.substring(0, 8).toUpperCase()}`, // Simulated license number
        specialization: formData.specialties,
        experience_years: parseInt(formData.yearsOfExperience) || 0,
        education: 'Nursing Degree', // Defaulting for now
        certifications: formData.certifications,
        id_document_hash: 'simulated_hash', // Simulated document hash
        hourly_rate: parseFloat(formData.pricing_per_hour) || 5000,
        availability: true
      }

      if (existingNurseProfile) {
        const { error: nurseError } = await supabase
          .from('nurse_profiles')
          .update(nurseProfileData)
          .eq('user_id', userId)
        if (nurseError) throw nurseError
      } else {
        const { error: nurseError } = await supabase
          .from('nurse_profiles')
          .insert(nurseProfileData)
        if (nurseError) throw nurseError
      }

      alert('Profile submitted successfully! Admin will review your application.')
      if (onComplete) onComplete()
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Error saving profile:', error)
      alert(error.message || 'Failed to save profile. Please try again.')
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
            <div className="w-12 h-12 bg-[#A79277] rounded-md flex items-center justify-center">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#5C4B37]">Complete Your Nurse Profile</h1>
              <p className="text-sm text-[#8B7355]">Step {step} of 3 - Your profile will be reviewed by admin</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 w-full bg-[#F7E7CE] rounded-full h-2">
            <div
              className="bg-[#A79277] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="bg-white rounded-md border border-[#E8DCC8] p-6 space-y-6">
            <h2 className="text-lg font-bold text-[#5C4B37]">Basic Information</h2>

            {/* Bio */}
            <div>
              <label className="block text-sm font-bold text-[#5C4B37] mb-2">
                Professional Bio *
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full px-4 py-3 border border-[#E8DCC8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A79277] focus:border-transparent"
                rows={4}
                placeholder="Describe your experience, approach to patient care, and what makes you unique..."
                required
              />
            </div>

            {/* Years of Experience */}
            <div>
              <label className="block text-sm font-bold text-[#5C4B37] mb-2">
                Years of Experience *
              </label>
              <input
                type="number"
                value={formData.yearsOfExperience}
                onChange={(e) => setFormData(prev => ({ ...prev, yearsOfExperience: e.target.value }))}
                className="w-full px-4 py-3 border border-[#E8DCC8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A79277] focus:border-transparent"
                placeholder="e.g., 5"
                min="0"
                required
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-bold text-[#5C4B37] mb-2">
                Age *
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                className="w-full px-4 py-3 border border-[#E8DCC8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A79277] focus:border-transparent"
                placeholder="e.g., 30"
                min="18"
                max="100"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-bold text-[#5C4B37] mb-2">
                Location Address *
              </label>
              <input
                type="text"
                value={formData.location_address}
                onChange={(e) => setFormData(prev => ({ ...prev, location_address: e.target.value }))}
                className="w-full px-4 py-3 border border-[#E8DCC8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A79277] focus:border-transparent"
                placeholder="e.g., Akwa, Douala"
                required
              />
            </div>

            {/* Pricing */}
            <div>
              <label className="block text-sm font-bold text-[#5C4B37] mb-2">
                Pricing per Hour (XAF)
              </label>
              <input
                type="number"
                value={formData.pricing_per_hour}
                onChange={(e) => setFormData(prev => ({ ...prev, pricing_per_hour: e.target.value }))}
                className="w-full px-4 py-3 border border-[#E8DCC8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A79277] focus:border-transparent"
                placeholder="e.g., 5000"
                min="0"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3 bg-[#A79277] text-white rounded-md hover:bg-[#9A8469] transition-colors font-semibold"
            >
              Next: Specialties & Skills
            </button>
          </div>
        )}

        {/* Step 2: Specialties & Availability */}
        {step === 2 && (
          <div className="bg-white rounded-md border border-[#E8DCC8] p-6 space-y-6">
            <h2 className="text-lg font-bold text-[#5C4B37]">Specialties & Availability</h2>

            {/* Specialties */}
            <div>
              <label className="block text-sm font-bold text-[#5C4B37] mb-2">Specialties *</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.specialties.map((spec, i) => (
                  <span key={i} className="flex items-center space-x-1 px-3 py-1.5 bg-[#F7E7CE] text-[#5C4B37] text-sm font-semibold rounded-sm border border-[#E8DCC8]">
                    <span>{spec}</span>
                    <button onClick={() => removeFromArray('specialties', i)} className="hover:text-red-600">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newItem.specialty}
                  onChange={(e) => setNewItem(prev => ({ ...prev, specialty: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('specialties', newItem.specialty))}
                  className="flex-1 px-3 py-2 border border-[#E8DCC8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A79277]"
                  placeholder="e.g., Elder Care, Pediatric Care"
                />
                <button
                  onClick={() => addToArray('specialties', newItem.specialty)}
                  className="px-4 py-2 bg-[#A79277] text-white rounded-md hover:bg-[#9A8469]"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Available Days */}
            <div>
              <label className="block text-sm font-bold text-[#5C4B37] mb-2">Available Days *</label>
              <div className="grid grid-cols-4 gap-2">
                {daysOfWeek.map(day => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`py-2 rounded-md text-sm font-semibold transition-all ${
                      formData.availableDays.includes(day)
                        ? 'bg-[#A79277] text-white'
                        : 'bg-[#F7E7CE] text-[#8B7355] hover:bg-[#E8DCC8]'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <label className="block text-sm font-bold text-[#5C4B37] mb-2">Available Time Slots *</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.availableTimeSlots.map((slot, i) => (
                  <span key={i} className="flex items-center space-x-1 px-3 py-1.5 bg-[#F7E7CE] text-[#5C4B37] text-sm font-semibold rounded-sm border border-[#E8DCC8]">
                    <span>{slot}</span>
                    <button onClick={() => removeFromArray('availableTimeSlots', i)} className="hover:text-red-600">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newItem.timeSlot}
                  onChange={(e) => setNewItem(prev => ({ ...prev, timeSlot: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-[#E8DCC8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A79277]"
                  placeholder="e.g., 08:00-12:00"
                />
                <button
                  onClick={() => addToArray('availableTimeSlots', newItem.timeSlot)}
                  className="px-4 py-2 bg-[#A79277] text-white rounded-md hover:bg-[#9A8469]"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Languages */}
            <div>
              <label className="block text-sm font-bold text-[#5C4B37] mb-2">Languages Spoken</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.languagesSpoken.map((lang, i) => (
                  <span key={i} className="flex items-center space-x-1 px-3 py-1.5 bg-[#F7E7CE] text-[#5C4B37] text-sm font-semibold rounded-sm border border-[#E8DCC8]">
                    <span>{lang}</span>
                    <button onClick={() => removeFromArray('languagesSpoken', i)} className="hover:text-red-600">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newItem.language}
                  onChange={(e) => setNewItem(prev => ({ ...prev, language: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-[#E8DCC8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A79277]"
                  placeholder="e.g., English, French"
                />
                <button
                  onClick={() => addToArray('languagesSpoken', newItem.language)}
                  className="px-4 py-2 bg-[#A79277] text-white rounded-md hover:bg-[#9A8469]"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 bg-[#F7E7CE] text-[#5C4B37] rounded-md hover:bg-[#E8DCC8] transition-colors font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 bg-[#A79277] text-white rounded-md hover:bg-[#9A8469] transition-colors font-semibold"
              >
                Next: Additional Info
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Additional Information */}
        {step === 3 && (
          <div className="bg-white rounded-md border border-[#E8DCC8] p-6 space-y-6">
            <h2 className="text-lg font-bold text-[#5C4B37]">Additional Information</h2>

            {/* Hobbies */}
            <div>
              <label className="block text-sm font-bold text-[#5C4B37] mb-2">Hobbies & Interests</label>
              <p className="text-xs text-[#8B7355] mb-3">Help patients connect with you on a personal level</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.hobbies.map((hobby, i) => (
                  <span key={i} className="flex items-center space-x-1 px-3 py-1.5 bg-pink-50 text-pink-700 text-sm font-semibold rounded-sm border border-pink-200">
                    <span>{hobby}</span>
                    <button onClick={() => removeFromArray('hobbies', i)} className="hover:text-red-600">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newItem.hobby}
                  onChange={(e) => setNewItem(prev => ({ ...prev, hobby: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-[#E8DCC8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A79277]"
                  placeholder="e.g., Reading, Music, Sports"
                />
                <button
                  onClick={() => addToArray('hobbies', newItem.hobby)}
                  className="px-4 py-2 bg-[#A79277] text-white rounded-md hover:bg-[#9A8469]"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Certifications */}
            <div>
              <label className="block text-sm font-bold text-[#5C4B37] mb-2">Certifications</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.certifications.map((cert, i) => (
                  <span key={i} className="flex items-center space-x-1 px-3 py-1.5 bg-green-50 text-green-700 text-sm font-semibold rounded-sm border border-green-200">
                    <CheckCircle className="h-3 w-3" />
                    <span>{cert}</span>
                    <button onClick={() => removeFromArray('certifications', i)} className="hover:text-red-600">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newItem.certification}
                  onChange={(e) => setNewItem(prev => ({ ...prev, certification: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-[#E8DCC8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A79277]"
                  placeholder="e.g., BLS, ACLS, Pediatric Nursing"
                />
                <button
                  onClick={() => addToArray('certifications', newItem.certification)}
                  className="px-4 py-2 bg-[#A79277] text-white rounded-md hover:bg-[#9A8469]"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Upload Documents */}
            <div>
              <label className="block text-sm font-bold text-[#5C4B37] mb-2">Upload Documents</label>
              <div className="border-2 border-dashed border-[#E8DCC8] rounded-md p-8 text-center hover:border-[#A79277] transition-colors cursor-pointer">
                <Upload className="h-12 w-12 text-[#A79277] mx-auto mb-3" />
                <p className="text-sm text-[#8B7355] mb-1">Click to upload ID card and certificates</p>
                <p className="text-xs text-[#8B7355]">PDF, JPG, PNG (Max 5MB each)</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 bg-[#F7E7CE] text-[#5C4B37] rounded-md hover:bg-[#E8DCC8] transition-colors font-semibold"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2 py-3 bg-[#A79277] text-white rounded-md hover:bg-[#9A8469] transition-colors font-semibold disabled:opacity-50"
              >
                <Save className="h-5 w-5" />
                <span>{loading ? 'Submitting...' : 'Submit for Review'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
