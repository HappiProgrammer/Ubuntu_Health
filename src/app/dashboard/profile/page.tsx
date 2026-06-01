'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Star, 
  Briefcase, 
  Award,
  Edit3,
  Shield,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: 'nurse' | 'client' | 'admin'
  is_verified: boolean
  verification_status: 'pending' | 'approved' | 'rejected'
  location_address: string | null
  bio: string | null
  created_at: string
}

interface NurseProfile {
  id: string
  user_id: string
  license_number: string
  specialization: string[]
  experience_years: number
  education: string
  certifications: string[]
  ai_score: number
  rating: number
  jobs_completed: number
  hourly_rate: number
  availability: boolean
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [nurseProfile, setNurseProfile] = useState<NurseProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'stats'>('overview')
  const isMockMode = (supabase as any).isMockMode

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      let user: any = null

      if (isMockMode) {
        const mockAuthModule = await import('@/lib/mockAuth')
        const { user: mockUser } = mockAuthModule.mockAuth.getUser()
        user = mockUser
        
        if (!user) {
          router.push('/auth/login')
          return
        }

        // Mock profile data
        const mockProfile: Profile = {
          id: user.id,
          email: user.email,
          full_name: user.full_name || 'John Doe',
          phone: '+237 6XX XXX XXX',
          role: user.role,
          is_verified: true,
          verification_status: 'approved',
          location_address: 'Akwa, Douala',
          bio: 'Healthcare professional dedicated to providing quality care.',
          created_at: new Date().toISOString()
        }
        setProfile(mockProfile)

        if (user.role === 'nurse') {
          setNurseProfile({
            id: 'nurse1',
            user_id: user.id,
            license_number: 'CMR-NURSE-2024-1234',
            specialization: ['Elder Care', 'Post-Surgery'],
            experience_years: 5,
            education: 'Bachelor of Nursing',
            certifications: ['BLS', 'ACLS'],
            ai_score: 92,
            rating: 4.8,
            jobs_completed: 47,
            hourly_rate: 5000,
            availability: true
          })
        }
        
        setLoading(false)
        return
      }

      const { data: { user: supabaseUser } } = await supabase.auth.getUser()
      user = supabaseUser

      if (!user) {
        router.push('/auth/login')
        return
      }

      // Load profile from Supabase
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError
      setProfile(profileData)

      // Load nurse profile if applicable
      if (profileData?.role === 'nurse') {
        const { data: nurseData } = await supabase
          .from('nurse_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        setNurseProfile(nurseData)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF2E1] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A79277] mx-auto mb-4"></div>
          <p className="text-[#8B7355] font-medium">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FFF2E1] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl font-bold text-[#5C4B37] mb-2">Profile not found</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-[#A79277] hover:underline font-semibold"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF2E1]">
      {/* Header */}
      <div className="bg-white border-b border-[#E8DCC8] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#5C4B37]">My Profile</h1>
              <p className="text-sm text-[#8B7355] mt-1">View and manage your account information</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-[#A79277] text-white rounded-lg hover:bg-[#9A8469] transition-colors font-semibold"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header Card */}
        <div className="bg-white rounded-lg border border-[#E8DCC8] shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#A79277] to-[#9A8469] px-6 py-8 text-white">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/30">
                <User className="h-10 w-10 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{profile.full_name || 'User'}</h2>
                <p className="text-sm opacity-90 capitalize">{profile.role}</p>
                <div className="flex items-center space-x-2 mt-2">
                  {profile.is_verified ? (
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Verified</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>Pending Verification</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg border border-[#E8DCC8] shadow-sm mb-6">
          <div className="flex border-b border-[#E8DCC8]">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'details', label: 'Details' },
              { id: 'stats', label: 'Statistics', showForNurses: true }
            ].filter(tab => !tab.showForNurses || profile.role === 'nurse')
              .map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 px-6 py-4 font-semibold text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'text-[#A79277] border-b-2 border-[#A79277] bg-[#A79277]/5'
                      : 'text-[#8B7355] hover:text-[#5C4B37] hover:bg-[#F7E7CE]/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg border border-[#E8DCC8] shadow-sm p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-[#5C4B37] mb-4">Account Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-[#A79277] mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-[#8B7355] uppercase tracking-wider">Email</p>
                      <p className="text-sm font-semibold text-[#5C4B37]">{profile.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-[#A79277] mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-[#8B7355] uppercase tracking-wider">Phone</p>
                      <p className="text-sm font-semibold text-[#5C4B37]">{profile.phone || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-[#A79277] mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-[#8B7355] uppercase tracking-wider">Location</p>
                      <p className="text-sm font-semibold text-[#5C4B37]">{profile.location_address || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-[#A79277] mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-[#8B7355] uppercase tracking-wider">Member Since</p>
                      <p className="text-sm font-semibold text-[#5C4B37]">
                        {new Date(profile.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-[#A79277] mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-[#8B7355] uppercase tracking-wider">Verification Status</p>
                      <p className="text-sm font-semibold capitalize text-[#5C4B37]">{profile.verification_status}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Briefcase className="h-5 w-5 text-[#A79277] mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-[#8B7355] uppercase tracking-wider">Account Type</p>
                      <p className="text-sm font-semibold capitalize text-[#5C4B37]">{profile.role}</p>
                    </div>
                  </div>
                </div>
              </div>

              {profile.bio && (
                <div className="border-t border-[#E8DCC8] pt-6">
                  <h4 className="text-sm font-bold text-[#5C4B37] mb-2">Bio</h4>
                  <p className="text-sm text-[#8B7355]">{profile.bio}</p>
                </div>
              )}
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-[#5C4B37] mb-4">Complete Profile Details</h3>
              
              <div className="space-y-4">
                <div className="bg-[#F7E7CE]/50 rounded-lg p-4 border border-[#E8DCC8]">
                  <h4 className="text-sm font-bold text-[#5C4B37] mb-3">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[#8B7355] mb-1">Full Name</p>
                      <p className="text-sm font-semibold text-[#5C4B37]">{profile.full_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#8B7355] mb-1">Email Address</p>
                      <p className="text-sm font-semibold text-[#5C4B37]">{profile.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#8B7355] mb-1">Phone Number</p>
                      <p className="text-sm font-semibold text-[#5C4B37]">{profile.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#8B7355] mb-1">Location</p>
                      <p className="text-sm font-semibold text-[#5C4B37]">{profile.location_address || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {profile.role === 'nurse' && nurseProfile && (
                  <div className="bg-[#F7E7CE]/50 rounded-lg p-4 border border-[#E8DCC8]">
                    <h4 className="text-sm font-bold text-[#5C4B37] mb-3">Professional Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-[#8B7355] mb-1">License Number</p>
                        <p className="text-sm font-semibold text-[#5C4B37]">{nurseProfile.license_number}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#8B7355] mb-1">Experience</p>
                        <p className="text-sm font-semibold text-[#5C4B37]">{nurseProfile.experience_years} years</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#8B7355] mb-1">Education</p>
                        <p className="text-sm font-semibold text-[#5C4B37]">{nurseProfile.education}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#8B7355] mb-1">Hourly Rate</p>
                        <p className="text-sm font-semibold text-[#5C4B37]">XAF {nurseProfile.hourly_rate.toLocaleString()}/hr</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs text-[#8B7355] mb-1">Specializations</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {nurseProfile.specialization.map((spec, index) => (
                            <span key={index} className="px-3 py-1 bg-[#A79277]/10 text-[#A79277] text-xs font-semibold rounded-full border border-[#A79277]/20">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs text-[#8B7355] mb-1">Certifications</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {nurseProfile.certifications.map((cert, index) => (
                            <span key={index} className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-[#F7E7CE]/50 rounded-lg p-4 border border-[#E8DCC8]">
                  <h4 className="text-sm font-bold text-[#5C4B37] mb-3">Account Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[#8B7355] mb-1">Verification Status</p>
                      <p className="text-sm font-semibold capitalize text-[#5C4B37]">{profile.verification_status}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#8B7355] mb-1">Account Verified</p>
                      <p className="text-sm font-semibold text-[#5C4B37]">{profile.is_verified ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#8B7355] mb-1">Member Since</p>
                      <p className="text-sm font-semibold text-[#5C4B37]">
                        {new Date(profile.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#8B7355] mb-1">Account Type</p>
                      <p className="text-sm font-semibold capitalize text-[#5C4B37]">{profile.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Statistics Tab (Nurses Only) */}
          {activeTab === 'stats' && profile.role === 'nurse' && nurseProfile && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-[#5C4B37] mb-4">Performance Statistics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-[#A79277] to-[#9A8469] text-white rounded-lg p-6">
                  <Star className="h-8 w-8 mb-3 opacity-80" />
                  <p className="text-3xl font-bold mb-1">{nurseProfile.rating}</p>
                  <p className="text-xs opacity-90">Average Rating</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-lg p-6">
                  <Award className="h-8 w-8 mb-3 opacity-80" />
                  <p className="text-3xl font-bold mb-1">{nurseProfile.jobs_completed}</p>
                  <p className="text-xs opacity-90">Jobs Completed</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg p-6">
                  <Briefcase className="h-8 w-8 mb-3 opacity-80" />
                  <p className="text-3xl font-bold mb-1">{nurseProfile.ai_score}%</p>
                  <p className="text-xs opacity-90">AI Match Score</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-lg p-6">
                  <Clock className="h-8 w-8 mb-3 opacity-80" />
                  <p className="text-3xl font-bold mb-1">{nurseProfile.experience_years}</p>
                  <p className="text-xs opacity-90">Years Experience</p>
                </div>
              </div>

              {/* Profile Information Section */}
              <div className="bg-white rounded-lg p-6 border border-[#E8DCC8] shadow-sm">
                <h4 className="text-sm font-bold text-[#5C4B37] mb-4">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Age */}
                  <div className="bg-[#F7E7CE]/30 rounded-lg p-4">
                    <p className="text-xs text-[#8B7355] mb-1">Age</p>
                    <p className="text-lg font-bold text-[#5C4B37]">
                      {(() => {
                        const storedProfile = localStorage.getItem(`nurse_profile_${profile.id}`)
                        const data = storedProfile ? JSON.parse(storedProfile) : null
                        return data?.age ? `${data.age} years old` : 'Not specified'
                      })()}
                    </p>
                  </div>

                  {/* Bio */}
                  <div className="bg-[#F7E7CE]/30 rounded-lg p-4 md:col-span-2">
                    <p className="text-xs text-[#8B7355] mb-1">About Me</p>
                    <p className="text-sm font-semibold text-[#5C4B37]">
                      {(() => {
                        const storedProfile = localStorage.getItem(`nurse_profile_${profile.id}`)
                        const data = storedProfile ? JSON.parse(storedProfile) : null
                        return data?.bio || 'No description added yet.'
                      })()}
                    </p>
                  </div>

                  {/* Available Time Slots */}
                  <div className="bg-[#F7E7CE]/30 rounded-lg p-4 md:col-span-2">
                    <p className="text-xs text-[#8B7355] mb-2">Available Hours</p>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const storedProfile = localStorage.getItem(`nurse_profile_${profile.id}`)
                        const data = storedProfile ? JSON.parse(storedProfile) : null
                        const timeSlots = data?.availableTimeSlots || []
                        if (timeSlots.length === 0) {
                          return <p className="text-sm text-[#8B7355]">No time slots added yet.</p>
                        }
                        return timeSlots.map((slot: string, index: number) => (
                          <span key={index} className="px-3 py-1.5 bg-[#F7E7CE] text-[#5C4B37] text-sm font-semibold rounded-lg border border-[#E8DCC8]">
                            {slot}
                          </span>
                        ))
                      })()}
                    </div>
                  </div>

                  {/* Hobbies */}
                  <div className="bg-[#F7E7CE]/30 rounded-lg p-4 md:col-span-2">
                    <p className="text-xs text-[#8B7355] mb-2">Hobbies & Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const storedProfile = localStorage.getItem(`nurse_profile_${profile.id}`)
                        const data = storedProfile ? JSON.parse(storedProfile) : null
                        const hobbies = data?.hobbies || []
                        if (hobbies.length === 0) {
                          return <p className="text-sm text-[#8B7355]">No hobbies added yet.</p>
                        }
                        return hobbies.map((hobby: string, index: number) => (
                          <span key={index} className="px-3 py-1.5 bg-pink-50 text-pink-700 text-sm font-semibold rounded-lg border border-pink-200">
                            {hobby}
                          </span>
                        ))
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#F7E7CE]/50 rounded-lg p-6 border border-[#E8DCC8]">
                <h4 className="text-sm font-bold text-[#5C4B37] mb-4">Additional Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#8B7355]">Hourly Rate</span>
                    <span className="text-sm font-bold text-[#5C4B37]">XAF {nurseProfile.hourly_rate.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#8B7355]">Availability Status</span>
                    <span className={`text-sm font-bold ${nurseProfile.availability ? 'text-green-600' : 'text-red-600'}`}>
                      {nurseProfile.availability ? 'Available' : 'Busy'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#8B7355]">License Number</span>
                    <span className="text-sm font-bold text-[#5C4B37]">{nurseProfile.license_number}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
