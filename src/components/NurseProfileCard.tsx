'use client'

import Link from 'next/link'
import { Star, Clock, Calendar, MapPin, Award, Heart, Languages, UserCheck } from 'lucide-react'

interface NurseProfile {
  id: string
  full_name: string
  bio?: string
  yearsOfExperience?: number
  specialties?: string[]
  availableDays?: string[]
  availableTimeSlots?: string[]
  hobbies?: string[]
  languagesSpoken?: string[]
  profilePhoto?: string
  rating?: number
  reviewCount?: number
  credibilityScore?: number
  location_address?: string
  applicationStatus?: 'pending' | 'approved' | 'rejected'
}

interface NurseProfileCardProps {
  nurse: NurseProfile
  compact?: boolean
}

export default function NurseProfileCard({ nurse, compact = false }: NurseProfileCardProps) {
  if (compact) {
    return (
      <Link href={`/dashboard/nurse/${nurse.id}`} className="block">
        <div className="bg-white rounded-md border border-[#E8DCC8] p-4 hover:border-[#A79277] hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#F7E7CE] rounded-md flex items-center justify-center border border-[#E8DCC8]">
                <UserCheck className="h-6 w-6 text-[#A79277]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#5C4B37]">{nurse.full_name}</h3>
                <p className="text-xs text-[#8B7355]">{nurse.specialties?.[0] || 'General Care'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 bg-[#F7E7CE] px-2 py-1 rounded-sm">
              <Star className="h-3 w-3 text-[#A79277] fill-[#A79277]" />
              <span className="text-xs font-semibold text-[#5C4B37]">{nurse.rating || '4.5'}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-[#8B7355]">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{nurse.yearsOfExperience || 0} yrs exp</span>
            </div>
            {nurse.location_address && (
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate max-w-[100px]">{nurse.location_address}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div className="bg-white rounded-md border border-[#E8DCC8] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#A79277] to-[#8B7355] p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white rounded-md flex items-center justify-center border-2 border-white/30">
              <UserCheck className="h-10 w-10 text-[#A79277]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">{nurse.full_name}</h2>
              <p className="text-white/90 text-sm">{nurse.specialties?.join(', ') || 'General Care'}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-white" />
                  <span className="font-semibold">{nurse.rating || '4.5'}</span>
                  <span className="text-white/70">({nurse.reviewCount || 0} reviews)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Award className="h-4 w-4" />
                  <span>Credibility: {nurse.credibilityScore || 85}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Bio */}
        {nurse.bio && (
          <div>
            <h3 className="text-sm font-bold text-[#5C4B37] uppercase tracking-wider mb-2">About</h3>
            <p className="text-[#8B7355] text-sm leading-relaxed">{nurse.bio}</p>
          </div>
        )}

        {/* Experience & Location */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#F7E7CE] rounded-md p-4 border border-[#E8DCC8]">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-[#A79277]" />
              <span className="text-xs font-bold text-[#5C4B37] uppercase">Experience</span>
            </div>
            <p className="text-lg font-bold text-[#5C4B37]">{nurse.yearsOfExperience || 0} years</p>
          </div>
          
          {nurse.location_address && (
            <div className="bg-[#F7E7CE] rounded-md p-4 border border-[#E8DCC8]">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="h-4 w-4 text-[#A79277]" />
                <span className="text-xs font-bold text-[#5C4B37] uppercase">Location</span>
              </div>
              <p className="text-sm font-semibold text-[#5C4B37]">{nurse.location_address}</p>
            </div>
          )}
        </div>

        {/* Specialties */}
        {nurse.specialties && nurse.specialties.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-[#5C4B37] uppercase tracking-wider mb-3">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {nurse.specialties.map((specialty, index) => (
                <span key={index} className="px-3 py-1.5 bg-[#F7E7CE] text-[#5C4B37] text-xs font-semibold rounded-sm border border-[#E8DCC8]">
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Availability */}
        {(nurse.availableDays || nurse.availableTimeSlots) && (
          <div>
            <h3 className="text-sm font-bold text-[#5C4B37] uppercase tracking-wider mb-3">Availability</h3>
            <div className="space-y-3">
              {nurse.availableDays && nurse.availableDays.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-4 w-4 text-[#A79277]" />
                    <span className="text-xs font-semibold text-[#5C4B37]">Days</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {nurse.availableDays.map((day, index) => (
                      <span key={index} className="px-2 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-sm border border-green-200">
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {nurse.availableTimeSlots && nurse.availableTimeSlots.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-4 w-4 text-[#A79277]" />
                    <span className="text-xs font-semibold text-[#5C4B37]">Time Slots</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {nurse.availableTimeSlots.map((slot, index) => (
                      <span key={index} className="px-2 py-1 bg-[#F7E7CE] text-[#5C4B37] text-xs font-semibold rounded-sm border border-[#E8DCC8]">
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Languages */}
        {nurse.languagesSpoken && nurse.languagesSpoken.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-[#5C4B37] uppercase tracking-wider mb-3">Languages</h3>
            <div className="flex flex-wrap gap-2">
              {nurse.languagesSpoken.map((lang, index) => (
                <span key={index} className="flex items-center space-x-1 px-3 py-1.5 bg-[#F7E7CE] text-[#5C4B37] text-xs font-semibold rounded-sm border border-[#E8DCC8]">
                  <Languages className="h-3 w-3" />
                  <span>{lang}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Hobbies */}
        {nurse.hobbies && nurse.hobbies.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-[#5C4B37] uppercase tracking-wider mb-3">Interests & Hobbies</h3>
            <div className="flex flex-wrap gap-2">
              {nurse.hobbies.map((hobby, index) => (
                <span key={index} className="flex items-center space-x-1 px-3 py-1.5 bg-pink-50 text-pink-700 text-xs font-semibold rounded-sm border border-pink-200">
                  <Heart className="h-3 w-3" />
                  <span>{hobby}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
