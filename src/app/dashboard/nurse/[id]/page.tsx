'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import NurseProfileCard from '@/components/NurseProfileCard'
import NurseProfileInfo from '@/components/NurseProfileInfo'
import { ArrowLeft, MessageCircle, Calendar, Phone } from 'lucide-react'

interface NurseProfile {
  id: string
  full_name: string
  email: string
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

export default function NurseProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [nurse, setNurse] = useState<NurseProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock nurse data - replace with actual API call
    const mockNurses: NurseProfile[] = [
      {
        id: 'n1',
        full_name: 'Dr. Sarah Mbarga',
        email: 'sarah@example.com',
        bio: 'Dedicated healthcare professional with over 8 years of experience in elder care and post-surgery rehabilitation. Passionate about providing compassionate care to patients.',
        yearsOfExperience: 8,
        specialties: ['Elder Care', 'Post-Surgery', 'Palliative Care'],
        availableDays: ['Mon', 'Tue', 'Wed', 'Fri'],
        availableTimeSlots: ['08:00-12:00', '14:00-18:00'],
        hobbies: ['Reading', 'Gardening', 'Cooking'],
        languagesSpoken: ['English', 'French', 'Ewondo'],
        rating: 4.8,
        reviewCount: 47,
        credibilityScore: 95,
        location_address: 'Akwa, Douala',
        applicationStatus: 'approved'
      },
      {
        id: 'n2',
        full_name: 'Dr. Jean Tondo',
        email: 'jean@example.com',
        bio: 'Specialized pediatric nurse with a focus on child development and immunization programs. Committed to making healthcare comfortable for children.',
        yearsOfExperience: 5,
        specialties: ['Pediatric Care', 'Immunization', 'Child Development'],
        availableDays: ['Mon', 'Wed', 'Thu', 'Sat'],
        availableTimeSlots: ['09:00-13:00', '15:00-19:00'],
        hobbies: ['Music', 'Sports', 'Photography'],
        languagesSpoken: ['English', 'French', 'Duala'],
        rating: 4.9,
        reviewCount: 62,
        credibilityScore: 98,
        location_address: 'Bonanjo, Douala',
        applicationStatus: 'approved'
      }
    ]

    const foundNurse = mockNurses.find(n => n.id === params.id)
    if (foundNurse) {
      setNurse(foundNurse)
    }
    setLoading(false)
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF2E1] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A79277] mx-auto mb-4"></div>
          <p className="text-[#8B7355] font-medium">Loading nurse profile...</p>
        </div>
      </div>
    )
  }

  if (!nurse) {
    return (
      <div className="min-h-screen bg-[#FFF2E1] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold text-[#5C4B37] mb-2">Nurse not found</p>
          <Link href="/dashboard" className="text-[#A79277] hover:underline">
            Return to dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF2E1]">
      {/* Header */}
      <div className="bg-white border-b border-[#E8DCC8] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-[#8B7355] hover:text-[#5C4B37] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back</span>
            </button>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => window.location.href = `tel:${nurse.email}`} // Placeholder for phone
                className="flex items-center space-x-2 px-4 py-2 bg-[#F7E7CE] text-[#5C4B37] rounded-md border border-[#E8DCC8] hover:border-[#A79277] transition-all"
              >
                <Phone className="h-4 w-4" />
                <span className="text-sm font-semibold">Call</span>
              </button>
              <button 
                onClick={handleMessage}
                className="flex items-center space-x-2 px-4 py-2 bg-[#A79277] text-white rounded-md hover:bg-[#9A8469] transition-all"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm font-semibold">Message</span>
              </button>
              <button 
                onClick={handleBook}
                className="flex items-center space-x-2 px-4 py-2 bg-[#A79277] text-white rounded-md hover:bg-[#9A8469] transition-all"
              >
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-semibold">Book</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <NurseProfileCard nurse={nurse} />
        
        {/* Profile Information Section */}
        <NurseProfileInfo 
          userId={params.id as string}
          onProfileUpdate={(updatedProfile) => {
            console.log('Profile updated:', updatedProfile)
          }}
        />
      </div>
    </div>
  )
}
d nurse={nurse} />
        
        {/* Profile Information Section */}
        <NurseProfileInfo 
          userId={params.id as string}
          onProfileUpdate={(updatedProfile) => {
            console.log('Profile updated:', updatedProfile)
          }}
        />
      </div>
    </div>
  )
}
