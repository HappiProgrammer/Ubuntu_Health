'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Save, Clock, Briefcase, Heart, User, Edit2, Check } from 'lucide-react'

interface NurseProfileInfoProps {
  userId: string
  onProfileUpdate?: (profile: any) => void
}

interface ProfileData {
  bio: string
  age: string
  yearsOfExperience: string
  availableTimeSlots: string[]
  hobbies: string[]
}

export default function NurseProfileInfo({ userId, onProfileUpdate }: NurseProfileInfoProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const isMockMode = (supabase as any).isMockMode

  const [profile, setProfile] = useState<ProfileData>({
    bio: '',
    age: '',
    yearsOfExperience: '',
    availableTimeSlots: [],
    hobbies: []
  })

  const [formData, setFormData] = useState<ProfileData>(profile)

  useEffect(() => {
    loadProfile()
  }, [userId])

  const loadProfile = async () => {
    try {
      if (isMockMode) {
        const storedProfile = localStorage.getItem(`nurse_profile_${userId}`)
        if (storedProfile) {
          const data = JSON.parse(storedProfile)
          setProfile({
            bio: data.bio || '',
            age: data.age || '',
            yearsOfExperience: data.yearsOfExperience?.toString() || '',
            availableTimeSlots: data.availableTimeSlots || [],
            hobbies: data.hobbies || []
          })
        }
      } else {
        const { data } = await supabase
          .from('nurse_profiles')
          .select('bio, age, yearsOfExperience, availableTimeSlots, hobbies')
          .eq('user_id', userId)
          .single()

        if (data) {
          setProfile({
            bio: data.bio || '',
            age: data.age?.toString() || '',
            yearsOfExperience: data.yearsOfExperience?.toString() || '',
            availableTimeSlots: data.availableTimeSlots || [],
            hobbies: data.hobbies || []
          })
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setFormData(profile)
  }, [profile])

  const handleSave = async () => {
    setSaving(true)
    try {
      if (isMockMode) {
        // Update localStorage
        const storedProfile = localStorage.getItem(`nurse_profile_${userId}`)
        const existingData = storedProfile ? JSON.parse(storedProfile) : {}
        
        const updatedProfile = {
          ...existingData,
          userId,
          bio: formData.bio,
          age: parseInt(formData.age) || 0,
          yearsOfExperience: parseInt(formData.yearsOfExperience) || 0,
          availableTimeSlots: formData.availableTimeSlots,
          hobbies: formData.hobbies,
          updatedAt: new Date().toISOString()
        }

        localStorage.setItem(`nurse_profile_${userId}`, JSON.stringify(updatedProfile))
      } else {
        const { error } = await supabase
          .from('nurse_profiles')
          .update({
            bio: formData.bio,
            age: parseInt(formData.age) || 0,
            yearsOfExperience: parseInt(formData.yearsOfExperience) || 0,
            availableTimeSlots: formData.availableTimeSlots,
            hobbies: formData.hobbies,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)

        if (error) throw error
      }

      setProfile(formData)
      setIsEditing(false)
      
      if (onProfileUpdate) {
        onProfileUpdate(formData)
      }

      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData(profile)
    setIsEditing(false)
  }

  const addTimeSlot = (slot: string) => {
    if (!slot.trim()) return
    setFormData(prev => ({
      ...prev,
      availableTimeSlots: [...prev.availableTimeSlots, slot.trim()]
    }))
  }

  const removeTimeSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      availableTimeSlots: prev.availableTimeSlots.filter((_, i) => i !== index)
    }))
  }

  const addHobby = (hobby: string) => {
    if (!hobby.trim()) return
    setFormData(prev => ({
      ...prev,
      hobbies: [...prev.hobbies, hobby.trim()]
    }))
  }

  const removeHobby = (index: number) => {
    setFormData(prev => ({
      ...prev,
      hobbies: prev.hobbies.filter((_, i) => i !== index)
    }))
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#E8DCC8]">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[#F7E7CE] rounded w-1/3"></div>
          <div className="h-4 bg-[#F7E7CE] rounded w-2/3"></div>
          <div className="h-4 bg-[#F7E7CE] rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-[#E8DCC8] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#A79277] to-[#9A8469] p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <User className="h-5 w-5 text-white" />
          <h3 className="text-lg font-bold text-white">Professional Information</h3>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white text-sm font-semibold"
          >
            <Edit2 className="h-4 w-4" />
            <span>Edit</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white text-sm font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-3 py-1.5 bg-white hover:bg-white/90 rounded-lg transition-colors text-[#A79277] text-sm font-semibold disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Bio */}
        <div>
          <label className="block text-sm font-bold text-[#5C4B37] mb-2 flex items-center space-x-2">
            <Heart className="h-4 w-4 text-[#A79277]" />
            <span>About Me</span>
          </label>
          {isEditing ? (
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              className="w-full px-4 py-3 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A79277] focus:border-transparent"
              rows={3}
              placeholder="Describe yourself..."
            />
          ) : (
            <p className="text-sm text-[#8B7355] bg-[#F7E7CE]/30 p-3 rounded-lg">
              {profile.bio || 'No description added yet.'}
            </p>
          )}
        </div>

        {/* Age and Experience */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-[#5C4B37] mb-2">Age</label>
            {isEditing ? (
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                className="w-full px-4 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A79277]"
                placeholder="Age"
                min="18"
                max="100"
              />
            ) : (
              <p className="text-sm font-semibold text-[#5C4B37] bg-[#F7E7CE]/30 p-3 rounded-lg">
                {profile.age ? `${profile.age} years old` : 'Not specified'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-[#5C4B37] mb-2 flex items-center space-x-2">
              <Briefcase className="h-4 w-4 text-[#A79277]" />
              <span>Experience</span>
            </label>
            {isEditing ? (
              <input
                type="number"
                value={formData.yearsOfExperience}
                onChange={(e) => setFormData(prev => ({ ...prev, yearsOfExperience: e.target.value }))}
                className="w-full px-4 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A79277]"
                placeholder="Years"
                min="0"
              />
            ) : (
              <p className="text-sm font-semibold text-[#5C4B37] bg-[#F7E7CE]/30 p-3 rounded-lg">
                {profile.yearsOfExperience ? `${profile.yearsOfExperience} years` : 'Not specified'}
              </p>
            )}
          </div>
        </div>

        {/* Available Time Slots */}
        <div>
          <label className="block text-sm font-bold text-[#5C4B37] mb-2 flex items-center space-x-2">
            <Clock className="h-4 w-4 text-[#A79277]" />
            <span>Available Hours</span>
          </label>
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.availableTimeSlots.map((slot, index) => (
                  <span
                    key={index}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-[#F7E7CE] text-[#5C4B37] text-sm font-semibold rounded-lg border border-[#E8DCC8]"
                  >
                    <span>{slot}</span>
                    <button
                      onClick={() => removeTimeSlot(index)}
                      className="hover:text-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="e.g., 08:00-12:00 (press Enter to add)"
                className="w-full px-4 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A79277] text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTimeSlot((e.target as HTMLInputElement).value)
                    ;(e.target as HTMLInputElement).value = ''
                  }
                }}
              />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.availableTimeSlots.length > 0 ? (
                profile.availableTimeSlots.map((slot, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-[#F7E7CE]/50 text-[#5C4B37] text-sm font-semibold rounded-lg border border-[#E8DCC8]"
                  >
                    {slot}
                  </span>
                ))
              ) : (
                <p className="text-sm text-[#8B7355] bg-[#F7E7CE]/30 p-3 rounded-lg w-full">
                  No time slots added yet.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Hobbies */}
        <div>
          <label className="block text-sm font-bold text-[#5C4B37] mb-2 flex items-center space-x-2">
            <Heart className="h-4 w-4 text-[#A79277]" />
            <span>Hobbies & Interests</span>
          </label>
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.hobbies.map((hobby, index) => (
                  <span
                    key={index}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-pink-50 text-pink-700 text-sm font-semibold rounded-lg border border-pink-200"
                  >
                    <span>{hobby}</span>
                    <button
                      onClick={() => removeHobby(index)}
                      className="hover:text-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="e.g., Reading, Music (press Enter to add)"
                className="w-full px-4 py-2 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A79277] text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addHobby((e.target as HTMLInputElement).value)
                    ;(e.target as HTMLInputElement).value = ''
                  }
                }}
              />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.hobbies.length > 0 ? (
                profile.hobbies.map((hobby, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-pink-50 text-pink-700 text-sm font-semibold rounded-lg border border-pink-200"
                  >
                    {hobby}
                  </span>
                ))
              ) : (
                <p className="text-sm text-[#8B7355] bg-[#F7E7CE]/30 p-3 rounded-lg w-full">
                  No hobbies added yet.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
