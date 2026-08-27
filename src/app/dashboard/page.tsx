'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/hooks/useTheme'
import {
  Users,
  Calendar,
  MessageCircle,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Heart,
  Search,
  Filter,
  Plus,
  Bell,
  User,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
  Shield,
  CheckCircle2,
  AlertCircle,
  CreditCard
} from 'lucide-react'

const MessageSystem = dynamic(() => import('@/components/MessageSystem'), {
  loading: () => (
    <div className="h-64 rounded-3xl border border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  )
})

const PaymentSystem = dynamic(() => import('@/components/PaymentSystem'), {
  loading: () => (
    <div className="h-64 rounded-3xl border border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  )
})

interface Profile {
  id: string
  email: string
  full_name: string
  role: 'nurse' | 'client' | 'admin'
  is_verified: boolean
  verification_status: 'pending' | 'approved' | 'rejected'
  location_address: string
  bio: string
}

interface NurseProfile {
  id: string
  user_id: string
  license_number: string
  specialization: string[]
  experience_years: number
  education: string
  ai_score: number
  rating: number
  jobs_completed: number
  hourly_rate: number
  availability: boolean
}

interface CareRequest {
  id: string
  client_id?: string
  client_name?: string
  title: string
  description: string
  care_type: string
  urgency: 'low' | 'medium' | 'high'
  location_address: string
  start_date: string
  budget: number
  status: 'open' | 'matched' | 'in_progress' | 'completed' | 'cancelled'
}

interface Match {
  id: string
  care_request_id: string
  nurse_id: string
  ai_score: number
  status: 'pending' | 'approved' | 'rejected' | 'accepted' | 'declined'
  client_response: 'pending' | 'accepted' | 'declined' | null
  care_request: CareRequest
  nurse_profile: NurseProfile
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [nurseProfile, setNurseProfile] = useState<NurseProfile | null>(null)
  const [availableRequests, setAvailableRequests] = useState<CareRequest[]>([])
  const [userMatches, setUserMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterUrgency, setFilterUrgency] = useState('all')
  const { theme, toggleTheme } = useTheme()

  const isMockMode = (supabase as any).isMockMode

  useEffect(() => {
    checkUser()
    loadData()
  }, [])

  const checkUser = async () => {
    if (isMockMode) {
      const mockAuthModule = await import('@/lib/mockAuth')
      const { user } = mockAuthModule.mockAuth.getUser()
      if (!user) router.push('/auth/login')
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/auth/login')
    }
  }

  const loadData = async () => {
    try {
      let user: any = null

      if (isMockMode) {
        const mockAuthModule = await import('@/lib/mockAuth')
        const { user: mockUser } = mockAuthModule.mockAuth.getUser()
        user = mockUser
      } else {
        const { data: { user: supabaseUser } } = await supabase.auth.getUser()
        user = supabaseUser
      }

      if (!user) return

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profileData)

      // Load nurse profile if applicable
      if (profileData?.role === 'nurse') {
        const { data: nurseData } = await supabase
          .from('nurse_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        setNurseProfile(nurseData)

        const { data: requestsData } = await supabase
          .from('care_requests')
          .select('*')
          .eq('status', 'open')
          .order('created_at', { ascending: false })

        setAvailableRequests(requestsData || [])
      }

      // Load user matches
      let matchesQuery = supabase.from('matches').select(`
        *,
        care_request:care_requests(*),
        nurse_profile:nurse_profiles!matches_nurse_id_fkey(*)
      `)

      if (profileData?.role === 'nurse') {
        matchesQuery = matchesQuery.eq('nurse_id', user.id)
      } else {
        const { data: clientRequests } = await supabase
          .from('care_requests')
          .select('id')
          .eq('client_id', user.id)

        const requestIds = (clientRequests || []).map((r: any) => r.id)
        if (requestIds.length > 0) {
          matchesQuery = matchesQuery.in('care_request_id', requestIds)
        } else {
          setUserMatches([])
          setLoading(false)
          return
        }
      }

      const { data: matchesData } = await matchesQuery.order('created_at', { ascending: false })
      setUserMatches(matchesData || [])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async (requestId: string) => {
    if (!profile || profile.role !== 'nurse') return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('You must be logged in to apply')
        return
      }

      const alreadyApplied = userMatches.some(m => m.care_request_id === requestId)
      if (alreadyApplied) {
        alert('You have already applied for this request.')
        return
      }

      const { error } = await supabase
        .from('matches')
        .insert({
          id: crypto.randomUUID(),
          care_request_id: requestId,
          nurse_id: user.id,
          ai_score: 88,
          status: 'pending',
          admin_approved: false,
          client_response: 'pending'
        })

      if (error) throw error
      alert('Application submitted successfully!')
      loadData()
    } catch (error: any) {
      alert(error.message || 'Failed to submit application')
    }
  }

  const handleStatusUpdate = async (matchId: string, status: string, clientResponse?: string) => {
    try {
      const updateData: any = { status }
      if (clientResponse) {
        updateData.client_response = clientResponse
      }

      const { error } = await supabase
        .from('matches')
        .update(updateData)
        .eq('id', matchId)

      if (error) throw error
      alert(`Request ${status}!`)
      loadData()
    } catch (error) {
      alert('Failed to update status')
    }
  }

  const handleCreateRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const requestId = crypto.randomUUID()
    const requestData = {
      id: requestId,
      title: formData.get('title') as string,
      care_type: formData.get('care_type') as string,
      urgency: (formData.get('urgency') as 'low' | 'medium' | 'high') || 'medium',
      start_date: formData.get('start_date') as string,
      budget: Number(formData.get('budget')) || 0,
      location_address: formData.get('location_address') as string,
      description: formData.get('description') as string,
    }

    if (!requestData.title || !requestData.description || !requestData.care_type) {
      alert('Please complete all required fields.')
      return
    }

    try {
      if (!profile) return
      const { error } = await supabase
        .from('care_requests')
        .insert({
          id: requestId,
          client_id: profile.id,
          title: requestData.title,
          description: requestData.description,
          care_type: requestData.care_type,
          urgency: requestData.urgency,
          location_address: requestData.location_address || profile.location_address || 'Douala',
          location_lat: 0,
          location_lng: 0,
          start_date: requestData.start_date || new Date().toISOString().split('T')[0],
          budget: requestData.budget,
          status: 'open'
        })

      if (error) throw error
      alert('Care request created successfully!')
      setActiveTab('matches')
      loadData()
    } catch (error: any) {
      alert(error.message || 'Failed to create care request')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const filteredRequests = useMemo(() => {
    return availableRequests.filter(request => {
      const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesUrgency = filterUrgency === 'all' || request.urgency === filterUrgency
      return matchesSearch && matchesUrgency
    })
  }, [availableRequests, searchTerm, filterUrgency])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const isNurse = profile?.role === 'nurse'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Clean Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-cyan-500 text-white shadow-soft">
              <Heart className="h-5 w-5 fill-white" />
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-tight">BridgeCare</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
                Cameroon Santé
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={toggleTheme} className="icon-button" aria-label="Toggle theme">
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-100/80 px-3 py-1.5 transition hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary-600 text-white text-xs font-bold">
                {profile?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold leading-tight">{profile?.full_name}</p>
                <p className="text-[10px] uppercase font-bold text-slate-500">{profile?.role}</p>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="icon-button text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {profile?.full_name?.split(' ')[0]} 👋
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isNurse
                ? 'Review open care requests and manage your caregiver schedule.'
                : 'Manage verified nurse requests and track family care.'}
            </p>
          </div>

          {!isNurse && (
            <button
              onClick={() => setActiveTab('request')}
              className="btn-primary gap-2 text-xs sm:text-sm py-2.5 px-5 shadow-soft"
            >
              <Plus className="h-4 w-4" />
              <span>New Care Request</span>
            </button>
          )}
        </div>

        {/* 4 Clean Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isNurse ? (
            <>
              <div className="card">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Available Jobs</p>
                <p className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">{availableRequests.length}</p>
              </div>
              <div className="card">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Active Matches</p>
                <p className="text-3xl font-extrabold text-emerald-600">{userMatches.length}</p>
              </div>
              <div className="card">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Care Rating</p>
                <div className="flex items-center gap-1">
                  <p className="text-3xl font-extrabold text-amber-500">{nurseProfile?.rating || '4.9'}</p>
                  <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                </div>
              </div>
              <div className="card">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Completed Visits</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{nurseProfile?.jobs_completed || 0}</p>
              </div>
            </>
          ) : (
            <>
              <div className="card">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Active Requests</p>
                <p className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">
                  {userMatches.filter(m => m.status === 'accepted').length}
                </p>
              </div>
              <div className="card">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Pending Matches</p>
                <p className="text-3xl font-extrabold text-amber-500">
                  {userMatches.filter(m => m.status === 'pending').length}
                </p>
              </div>
              <div className="card">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Assigned Nurses</p>
                <p className="text-3xl font-extrabold text-emerald-600">
                  {userMatches.filter(m => m.status === 'accepted').length}
                </p>
              </div>
              <div className="card">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Total Bookings</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{userMatches.length}</p>
              </div>
            </>
          )}
        </div>

        {/* Clean Minimalist Tab Bar */}
        <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 gap-2 pb-2">
          {[
            { id: 'overview', label: 'Overview' },
            ...(isNurse ? [{ id: 'jobs', label: 'Browse Jobs' }] : []),
            { id: 'matches', label: isNurse ? 'My Applications' : 'My Requests' },
            { id: 'messages', label: 'Messages' },
            { id: 'payments', label: 'Payments' },
            ...(!isNurse ? [{ id: 'request', label: '+ New Request' }] : []),
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-soft'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold">Recent Care Activity</h3>
                  <button onClick={() => setActiveTab('matches')} className="text-xs font-bold text-primary-600 hover:underline">
                    View All
                  </button>
                </div>

                <div className="space-y-3">
                  {userMatches.slice(0, 4).map(match => (
                    <div key={match.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
                          <Users className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold">{match.care_request?.title || 'Care Request'}</p>
                          <p className="text-[11px] text-slate-500">
                            {new Date(match.created_at).toLocaleDateString()} • {match.care_request?.location_address || 'Douala'}
                          </p>
                        </div>
                      </div>

                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        match.status === 'accepted' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' :
                        match.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' :
                        'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {match.status}
                      </span>
                    </div>
                  ))}

                  {userMatches.length === 0 && (
                    <div className="text-center py-10 text-slate-500 text-xs">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                      No current care activity. Click &ldquo;New Request&rdquo; to post your first request.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Status */}
            <div className="space-y-4">
              <div className="card bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="h-6 w-6 text-emerald-400" />
                  <div>
                    <p className="text-sm font-bold">{profile?.is_verified ? 'Verified Member' : 'Verification Active'}</p>
                    <p className="text-[11px] text-slate-300">Identity & Credentials Escrow Protected</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  BridgeCare guarantees end-to-end caregiver checks and secure MTN/Orange Money transactions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Browse Jobs (For Nurses) */}
        {activeTab === 'jobs' && isNurse && (
          <div className="space-y-6">
            <div className="card flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search jobs by title or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 text-xs py-2.5"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="h-4 w-4 text-slate-400" />
                <select
                  value={filterUrgency}
                  onChange={(e) => setFilterUrgency(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value="all">All Urgencies</option>
                  <option value="high">Urgent (High)</option>
                  <option value="medium">Medium</option>
                  <option value="low">Standard</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRequests.map(req => (
                <div key={req.id} className="card flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-primary-600">{req.care_type}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        req.urgency === 'high' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {req.urgency}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm mb-1.5">{req.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">{req.description}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                      <MapPin className="h-3.5 w-3.5 text-primary-500" />
                      <span>{req.location_address}</span>
                    </p>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-3 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-500">Budget</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">XAF {req.budget?.toLocaleString()}</p>
                    </div>
                    <button onClick={() => handleApply(req.id)} className="btn-primary py-1.5 px-4 text-xs font-bold">
                      Apply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Matches / Requests */}
        {activeTab === 'matches' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {userMatches.map(match => (
              <div key={match.id} className="card flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500">Match ID: {match.id.substring(0, 6)}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                      match.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                      match.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {match.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm mb-1">{match.care_request?.title || 'Care Service'}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                    {match.care_request?.description}
                  </p>

                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-2.5 mb-3 text-xs space-y-1">
                    <p className="flex justify-between">
                      <span className="text-slate-500">Location:</span>
                      <span className="font-bold">{match.care_request?.location_address || 'Douala'}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-500">Start Date:</span>
                      <span className="font-bold">{match.care_request?.start_date || 'Today'}</span>
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex gap-2">
                  {match.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(match.id, 'accepted', 'accepted')}
                        className="btn-primary flex-1 py-2 text-xs"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(match.id, 'declined', 'declined')}
                        className="btn-outline flex-1 py-2 text-xs"
                      >
                        Decline
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setActiveTab('messages')}
                      className="btn-primary w-full py-2 text-xs flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>Message</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {userMatches.length === 0 && (
              <div className="col-span-full card py-12 text-center text-slate-500 text-xs">
                No active matches found.
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Messages */}
        {activeTab === 'messages' && profile && (
          <MessageSystem
            currentUserId={profile.id}
            currentUserRole={profile.role as 'nurse' | 'client'}
          />
        )}

        {/* Tab 5: Payments */}
        {activeTab === 'payments' && profile && (
          <PaymentSystem
            userId={profile.id}
            userRole={profile.role as 'nurse' | 'client'}
          />
        )}

        {/* Tab 6: New Request (For Clients) */}
        {activeTab === 'request' && !isNurse && (
          <div className="max-w-2xl mx-auto card p-6 sm:p-8">
            <h3 className="text-lg font-bold mb-4">Post a New Care Request</h3>
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Request Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Senior companion & medication monitoring"
                  className="input-field text-xs py-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                    Care Type *
                  </label>
                  <select name="care_type" required className="input-field text-xs py-2.5">
                    <option value="elder">Elderly Support</option>
                    <option value="nursing">Clinical Nursing</option>
                    <option value="maternal">Postpartum & Baby</option>
                    <option value="rehab">Physical Rehab</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                    Urgency
                  </label>
                  <select name="urgency" className="input-field text-xs py-2.5">
                    <option value="low">Standard</option>
                    <option value="medium">Medium</option>
                    <option value="high">Urgent (Today)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                    City / Neighborhood
                  </label>
                  <input
                    type="text"
                    name="location_address"
                    placeholder="e.g. Akwa, Douala"
                    className="input-field text-xs py-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                    Budget (XAF)
                  </label>
                  <input
                    type="number"
                    name="budget"
                    defaultValue="10000"
                    className="input-field text-xs py-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Description & Notes *
                </label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  placeholder="Describe patient condition, specific schedule, or medical requirements..."
                  className="input-field text-xs"
                />
              </div>

              <button type="submit" className="btn-primary w-full py-3 text-xs font-bold shadow-soft">
                Publish Care Request
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
