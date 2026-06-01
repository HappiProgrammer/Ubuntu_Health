'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CheckCircle, XCircle, Calendar, Eye, AlertCircle, UserCheck } from 'lucide-react'

interface NurseApplication {
  id: string
  full_name: string
  email: string
  phone_number?: string
  location_address?: string
  specialization?: string
  years_of_experience?: number
  applicationStatus: 'pending' | 'approved' | 'rejected'
  interviewScheduled: boolean
  interviewType?: 'online' | 'onsite'
  adminNotes?: string
  created_at: string
  bio?: string
  specialties?: string[]
  languagesSpoken?: string[]
  yearsOfExperience?: number
}

export default function AdminNurseApplications() {
  const router = useRouter()
  const [applications, setApplications] = useState<NurseApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [selectedNurse, setSelectedNurse] = useState<NurseApplication | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const isMockMode = (supabase as any).isMockMode

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    if (isMockMode) {
      // ... (keep existing mock)
      setApplications([
        {
          id: 'n1',
          full_name: 'Dr. Sarah Mbarga',
          email: 'sarah@example.com',
          phone_number: '+237 6XX XXX XXX',
          location_address: 'Akwa, Douala',
          specialization: 'Elder Care',
          years_of_experience: 8,
          applicationStatus: 'pending',
          interviewScheduled: false,
          created_at: new Date().toISOString(),
          bio: 'Dedicated healthcare professional with over 8 years of experience in elder care and post-surgery rehabilitation.',
          specialties: ['Elder Care', 'Post-Surgery', 'Palliative Care'],
          languagesSpoken: ['English', 'French', 'Ewondo'],
          yearsOfExperience: 8
        }
      ])
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          nurse_profile:nurse_profiles(*)
        `)
        .eq('role', 'nurse')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const formattedApps = (data || []).map((p: any) => ({
        ...p,
        applicationStatus: p.verification_status,
        specialization: p.nurse_profile?.specialization?.join(', '),
        years_of_experience: p.nurse_profile?.experience_years,
        ...p.nurse_profile
      }))

      setApplications(formattedApps)
    } catch (error) {
      console.error('Error loading applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (nurseId: string) => {
    setActionLoading(true)
    
    try {
      if (isMockMode) {
        setApplications(prev =>
          prev.map(app =>
            app.id === nurseId
              ? { ...app, applicationStatus: 'approved' as const, adminNotes: adminNotes || 'Approved by admin' }
              : app
          )
        )
      } else {
        const { error } = await supabase
          .from('profiles')
          .update({
            is_verified: true,
            verification_status: 'approved',
            adminNotes: adminNotes || 'Approved by admin'
          })
          .eq('id', nurseId)

        if (error) throw error
        await loadApplications()
      }
      
      setShowReviewModal(false)
      setAdminNotes('')
    } catch (error) {
      console.error('Error approving nurse:', error)
      alert('Failed to approve nurse')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (nurseId: string) => {
    if (!confirm('Are you sure you want to reject this application?')) return
    
    setActionLoading(true)

    try {
      if (isMockMode) {
        setApplications(prev =>
          prev.map(app =>
            app.id === nurseId
              ? { ...app, applicationStatus: 'rejected' as const, adminNotes: adminNotes || 'Application rejected' }
              : app
          )
        )
      } else {
        const { error } = await supabase
          .from('profiles')
          .update({
            verification_status: 'rejected',
            adminNotes: adminNotes || 'Application rejected'
          })
          .eq('id', nurseId)

        if (error) throw error
        await loadApplications()
      }
      
      setShowReviewModal(false)
      setAdminNotes('')
    } catch (error) {
      console.error('Error rejecting nurse:', error)
      alert('Failed to reject application')
    } finally {
      setActionLoading(false)
    }
  }

  const handleScheduleInterview = async (nurseId: string, type: 'online' | 'onsite') => {
    setActionLoading(true)

    if (isMockMode) {
      setApplications(prev =>
        prev.map(app =>
          app.id === nurseId
            ? { ...app, interviewScheduled: true, interviewType: type, adminNotes: `Interview scheduled (${type})` }
            : app
        )
      )
      setActionLoading(false)
      setShowReviewModal(false)
      return
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          interviewScheduled: true,
          interviewType: type,
          adminNotes: `Interview scheduled: ${type}`
        })
        .eq('id', nurseId)

      if (error) throw error
      await loadApplications()
      setShowReviewModal(false)
    } catch (error) {
      console.error('Error scheduling interview:', error)
      alert('Failed to schedule interview')
    } finally {
      setActionLoading(false)
    }
  }

  const filteredApplications = applications.filter(app =>
    filter === 'all' ? true : app.applicationStatus === filter
  )

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.applicationStatus === 'pending').length,
    approved: applications.filter(a => a.applicationStatus === 'approved').length,
    rejected: applications.filter(a => a.applicationStatus === 'rejected').length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF2E1] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A79277] mx-auto mb-4"></div>
          <p className="text-[#8B7355] font-medium">Loading applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF2E1]">
      {/* Header */}
      <div className="bg-white border-b border-[#E8DCC8] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#5C4B37]">Nurse Applications</h1>
              <p className="text-sm text-[#8B7355] mt-1">Review and manage nurse verification requests</p>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-[#FF6044] text-white rounded-md">
              <UserCheck className="h-5 w-5" />
              <span className="font-semibold">Admin Panel</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-md border border-[#E8DCC8] p-4">
            <p className="text-xs text-[#8B7355] uppercase font-semibold">Total</p>
            <p className="text-2xl font-bold text-[#5C4B37] mt-1">{stats.total}</p>
          </div>
          <div className="bg-yellow-50 rounded-md border border-yellow-200 p-4">
            <p className="text-xs text-yellow-700 uppercase font-semibold">Pending</p>
            <p className="text-2xl font-bold text-yellow-700 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-green-50 rounded-md border border-green-200 p-4">
            <p className="text-xs text-green-700 uppercase font-semibold">Approved</p>
            <p className="text-2xl font-bold text-green-700 mt-1">{stats.approved}</p>
          </div>
          <div className="bg-red-50 rounded-md border border-red-200 p-4">
            <p className="text-xs text-red-700 uppercase font-semibold">Rejected</p>
            <p className="text-2xl font-bold text-red-700 mt-1">{stats.rejected}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-md border border-[#E8DCC8] p-2 mb-6">
          <div className="flex space-x-2">
            {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                  filter === f
                    ? 'bg-[#A79277] text-white'
                    : 'bg-[#F7E7CE] text-[#8B7355] hover:bg-[#E8DCC8]'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-md border border-[#E8DCC8] overflow-hidden">
          <div className="divide-y divide-[#E8DCC8]">
            {filteredApplications.length === 0 ? (
              <div className="p-12 text-center">
                <AlertCircle className="h-12 w-12 text-[#E8DCC8] mx-auto mb-3" />
                <p className="text-[#8B7355] font-medium">No applications found</p>
              </div>
            ) : (
              filteredApplications.map((app) => (
                <div key={app.id} className="p-6 hover:bg-[#F7E7CE]/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-[#5C4B37]">{app.full_name}</h3>
                        <span className={`px-2 py-1 rounded-sm text-xs font-semibold ${
                          app.applicationStatus === 'approved' ? 'bg-green-100 text-green-700' :
                          app.applicationStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {app.applicationStatus.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                        <div>
                          <span className="text-[#8B7355]">Email:</span>
                          <p className="font-semibold text-[#5C4B37]">{app.email}</p>
                        </div>
                        {app.specialization && (
                          <div>
                            <span className="text-[#8B7355]">Specialization:</span>
                            <p className="font-semibold text-[#5C4B37]">{app.specialization}</p>
                          </div>
                        )}
                        {app.years_of_experience && (
                          <div>
                            <span className="text-[#8B7355]">Experience:</span>
                            <p className="font-semibold text-[#5C4B37]">{app.years_of_experience} years</p>
                          </div>
                        )}
                        {app.location_address && (
                          <div>
                            <span className="text-[#8B7355]">Location:</span>
                            <p className="font-semibold text-[#5C4B37]">{app.location_address}</p>
                          </div>
                        )}
                      </div>

                      {app.interviewScheduled && (
                        <div className="flex items-center space-x-2 text-sm text-[#A79277] mb-2">
                          <Calendar className="h-4 w-4" />
                          <span className="font-semibold">
                            Interview: {app.interviewType?.toUpperCase()}
                          </span>
                        </div>
                      )}

                      {app.adminNotes && (
                        <p className="text-xs text-[#8B7355] italic">Admin: {app.adminNotes}</p>
                      )}
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedNurse(app)
                          setShowReviewModal(true)
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-[#F7E7CE] text-[#5C4B37] rounded-md hover:bg-[#E8DCC8] transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="text-sm font-semibold">Review</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedNurse && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#E8DCC8] p-6">
              <h2 className="text-xl font-bold text-[#5C4B37]">Review Application</h2>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Profile Info */}
              <div className="bg-[#F7E7CE] rounded-md p-4 border border-[#E8DCC8]">
                <h3 className="font-bold text-[#5C4B37] mb-2">{selectedNurse.full_name}</h3>
                <p className="text-sm text-[#8B7355] mb-2">{selectedNurse.email}</p>
                {selectedNurse.bio && (
                  <p className="text-sm text-[#5C4B37]">{selectedNurse.bio}</p>
                )}
              </div>

              {/* Specialties */}
              {selectedNurse.specialties && selectedNurse.specialties.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-[#5C4B37] mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedNurse.specialties.map((spec, i) => (
                      <span key={i} className="px-3 py-1 bg-[#F7E7CE] text-[#5C4B37] text-xs font-semibold rounded-sm border border-[#E8DCC8]">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-bold text-[#5C4B37] mb-2">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8DCC8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A79277] focus:border-transparent"
                  rows={3}
                  placeholder="Add notes about this application..."
                />
              </div>

              {/* Actions */}
              {selectedNurse.applicationStatus === 'pending' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-bold text-[#5C4B37] mb-2">Schedule Interview</label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleScheduleInterview(selectedNurse.id, 'online')}
                        disabled={actionLoading}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        Online Interview
                      </button>
                      <button
                        onClick={() => handleScheduleInterview(selectedNurse.id, 'onsite')}
                        disabled={actionLoading}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
                      >
                        Onsite Interview
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApprove(selectedNurse.id)}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-semibold">Approve</span>
                    </button>
                    <button
                      onClick={() => handleReject(selectedNurse.id)}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="h-5 w-5" />
                      <span className="font-semibold">Reject</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-[#E8DCC8] p-4 flex justify-end">
              <button
                onClick={() => {
                  setShowReviewModal(false)
                  setSelectedNurse(null)
                  setAdminNotes('')
                }}
                className="px-6 py-2 bg-[#F7E7CE] text-[#5C4B37] rounded-md hover:bg-[#E8DCC8] transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
