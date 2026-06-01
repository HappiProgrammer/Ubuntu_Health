'use client'

import { useState, useEffect, useRef, useMemo, useCallback, memo, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

// Lazy load heavy components with loading states
const NurseMap = dynamic(() => import('@/components/NurseMap'), {
  loading: () => (
    <div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  ),
  ssr: false // Map components shouldn't be server-side rendered
})

const MessageSystem = dynamic(() => import('@/components/MessageSystem'), {
  loading: () => (
    <div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  )
})

const PaymentSystem = dynamic(() => import('@/components/PaymentSystem'), {
  loading: () => (
    <div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  )
})
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
  Settings,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
  Shield,
  CheckCircle2,
  AlertCircle,
  Hospital,
  ArrowRight,
  Phone,
  Sparkles,
  Zap,
  Activity,
  TrendingUp,
  Award,
  Target,
  Timer,
  BarChart3,
  PieChart,
  CalendarDays,
  Clock3,
  UserCheck,
  Stethoscope,
  FileText,
  Video,
  ChevronLeft,
  ChevronDown
} from 'lucide-react'

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
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day'>('month')
  const [animatedStats, setAnimatedStats] = useState({ matches: 0, requests: 0, messages: 0 })
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  const [selectedBookingDate, setSelectedBookingDate] = useState<Date | null>(null)
  const [availableHours, setAvailableHours] = useState<string[]>([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  const isMockMode = (supabase as any).isMockMode

  // Mock nurse locations for map
  const [nurseLocations] = useState([
    { id: 'n1', name: 'Dr. Sarah Mbarga', specialty: 'Elder Care', lat: 4.0511, lng: 9.7679, rating: 4.8, available: true, distance: '0.5 km' },
    { id: 'n2', name: 'Dr. Jean Tondo', specialty: 'Pediatric Care', lat: 4.0611, lng: 9.7779, rating: 4.9, available: true, distance: '1.2 km' },
    { id: 'n3', name: 'Dr. Marie Ekotto', specialty: 'Post-Surgery', lat: 4.0411, lng: 9.7579, rating: 4.7, available: false, distance: '2.1 km' },
    { id: 'n4', name: 'Dr. Paul Fotso', specialty: 'Emergency Care', lat: 4.0711, lng: 9.7879, rating: 5.0, available: true, distance: '3.0 km' },
    { id: 'n5', name: 'Dr. Amina Ndi', specialty: 'General Care', lat: 4.0311, lng: 9.7479, rating: 4.6, available: true, distance: '1.8 km' },
    { id: 'n6', name: 'Dr. Emmanuel Kengne', specialty: 'Diabetes Care', lat: 4.0811, lng: 9.7979, rating: 4.9, available: false, distance: '4.2 km' },
  ])

  useEffect(() => {
    checkUser()
    loadData()
    const isDark = document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'dark' : 'light')
    
    // Throttle mouse tracking for better performance
    let ticking = false
    const handleMouseMove = (e: MouseEvent) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setMousePosition({ x: e.clientX, y: e.clientY })
          ticking = false
        })
        ticking = true
      }
    }
    
    // Animate stats on load
    const animateStats = () => {
      const targetStats = {
        matches: userMatches.length,
        requests: availableRequests.length,
        messages: 0
      }
      
      const duration = 2000
      const steps = 60
      const increment = {
        matches: targetStats.matches / steps,
        requests: targetStats.requests / steps,
        messages: targetStats.messages / steps
      }
      
      let currentStep = 0
      const timer = setInterval(() => {
        currentStep++
        setAnimatedStats({
          matches: Math.floor(increment.matches * currentStep),
          requests: Math.floor(increment.requests * currentStep),
          messages: Math.floor(increment.messages * currentStep)
        })
        
        if (currentStep >= steps) {
          clearInterval(timer)
          setAnimatedStats(targetStats)
        }
      }, duration / steps)
    }
    
    setTimeout(animateStats, 500)
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, []) // Remove dependencies to prevent re-running

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const generateAvailableHours = (date: Date) => {
    const hours = []
    for (let i = 8; i <= 17; i++) {
      if (Math.random() > 0.3) { // 70% chance of availability
        hours.push(`${i.toString().padStart(2, '0')}:00`)
      }
    }
    return hours
  }

  // Memoize expensive computations
  const filteredRequests = useMemo(() => {
    return availableRequests.filter(request => {
      const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesUrgency = filterUrgency === 'all' || request.urgency === filterUrgency
      return matchesSearch && matchesUrgency
    })
  }, [availableRequests, searchTerm, filterUrgency])

  const filteredMatches = useMemo(() => {
    return userMatches.filter(match => {
      return match.care_request?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             match.nurse_profile?.specialization?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    })
  }, [userMatches, searchTerm])

  // Memoize event handlers
  const handleDateClick = useCallback((day: number) => {
    const clickedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day)
    setSelectedBookingDate(clickedDate)
    setAvailableHours(generateAvailableHours(clickedDate))
  }, [selectedDate])

  const handleDoctorBooking = useCallback((doctor: any) => {
    setSelectedDoctor(doctor)
    setShowBookingModal(true)
  }, [])

  const handleTimeSlotSelect = useCallback((time: string) => {
    setSelectedTimeSlot(time)
  }, [])

  const handleBookingConfirm = useCallback(() => {
    console.log('Booking confirmed:', {
      doctor: selectedDoctor,
      date: selectedBookingDate,
      time: selectedTimeSlot
    })
    setShowBookingModal(false)
    setSelectedDoctor(null)
    setSelectedBookingDate(null)
    setSelectedTimeSlot(null)
    setAvailableHours([])
  }, [selectedDoctor, selectedBookingDate, selectedTimeSlot])

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
      localStorage.theme = 'dark'
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.theme = 'light'
    }
  }, [theme])

  const checkUser = async () => {
    if (isMockMode) {
      // In mock mode, check localStorage for user
      const mockAuthModule = await import('@/lib/mockAuth')
      const { user } = mockAuthModule.mockAuth.getUser()
      if (!user) {
        router.push('/auth/login')
      }
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
      }
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

        // Load available care requests for nurses
        const { data: requestsData } = await supabase
          .from('care_requests')
          .select('*')
          .eq('status', 'open')
          .order('created_at', { ascending: false })

        setAvailableRequests(requestsData || [])
      }

      // Load user's matches
      // For nurses, match nurse_id. For clients, match care_requests.client_id
      let matchesQuery = supabase.from('matches').select(`
        *,
        care_request:care_requests(*),
        nurse_profile:nurse_profiles!matches_nurse_id_fkey(*)
      `)

      if (profileData?.role === 'nurse') {
        matchesQuery = matchesQuery.eq('nurse_id', user.id)
      } else {
        // Need to join with care_requests to filter by client_id
        // Supabase or() filter across joined tables is tricky, so we'll fetch based on role
        const { data: clientRequests } = await supabase
          .from('care_requests')
          .select('id')
          .eq('client_id', user.id)
        
        const requestIds = (clientRequests || []).map((r: any) => r.id)
        if (requestIds.length > 0) {
          matchesQuery = matchesQuery.in('care_request_id', requestIds)
        } else {
          // No requests, no matches
          setUserMatches([])
          setLoading(false)
          return
        }
      }

      const { data: matchesData } = await matchesQuery.order('created_at', { ascending: false })
      setUserMatches(matchesData || [])

    } catch (error) {
      console.error('Error loading data:', error)
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
      
      // Check if already applied
      const alreadyApplied = userMatches.some(m => m.care_request_id === requestId)
      if (alreadyApplied) {
        alert('You have already applied for this job')
        return
      }

      // Create a match/application
      const { error } = await supabase
        .from('matches')
        .insert({
          id: crypto.randomUUID(),
          care_request_id: requestId,
          nurse_id: user.id,
          ai_score: Math.floor(Math.random() * 30) + 70, // Simulated AI score for now
          status: 'pending',
          admin_approved: false,
          client_response: 'pending'
        })
      
      if (error) throw error
      
      alert('Application submitted successfully!')
      loadData() // Refresh data
    } catch (error: any) {
      console.error('Error applying to job:', error)
      alert(error.message || 'Failed to apply. Please try again.')
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
      
      alert(`Match ${status}!`)
      loadData()
    } catch (error) {
      console.error('Error updating match status:', error)
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
      alert('Please fill in all required fields')
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
          location_address: requestData.location_address || profile.location_address || '',
          location_lat: 0,
          location_lng: 0,
          start_date: requestData.start_date || new Date().toISOString().split('T')[0],
          budget: requestData.budget,
          status: 'open'
        })
      
      if (error) throw error
      
      alert('Care request created successfully!')
      
      // Automated matching
      try {
        const { findAndSaveMatches } = await import('@/services/nurseMatcher')
        await findAndSaveMatches(requestId, supabase)
      } catch (matchError) {
        console.error('Automated matching failed:', matchError)
      }

      setActiveTab('matches')
      loadData()
    } catch (error: any) {
      console.error('Error creating care request:', error)
      alert(error.message || 'Failed to create care request')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-500">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-slate-900 dark:border-white mx-auto"></div>
            <Heart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-slate-700 dark:text-slate-300 animate-pulse" />
          </div>
          <p className="mt-6 text-slate-600 dark:text-slate-400 font-medium animate-pulse">Initializing your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen transition-colors duration-500">
      {/* Header */}
      <header className="glass-panel sticky top-0 z-50 px-5 py-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_rgba(255,255,255,0.08))] ring-1 ring-white/50 group-hover:scale-105 transition-transform">
                <Heart className="h-6 w-6 text-primary-700 dark:text-primary-300" />
              </div>
              <div>
                <p className="font-display text-xl text-slate-900 dark:text-white">BridgeCare</p>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Cameroon</p>
              </div>
            </Link>
            
            <div className="flex items-center space-x-2 sm:space-x-6">
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>

              <button className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-dark-surface"></span>
              </button>
              
              <Link 
                href="/dashboard/profile" 
                className="hidden sm:flex items-center space-x-4 pl-4 border-l border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{profile?.full_name}</p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">{profile?.role}</p>
                </div>
                <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center border border-primary-200 dark:border-primary-800">
                  <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
              </Link>
              
              <button 
                onClick={handleLogout}
                className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Hello, {profile?.full_name?.split(' ')[0]}!
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg font-medium">
              {profile?.role === 'nurse' 
                ? 'Your professional caregiving overview' 
                : 'Manage your healthcare connections'}
            </p>
          </div>
          {profile?.role === 'client' && (
            <button 
              onClick={() => setActiveTab('request')}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>New Care Request</span>
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {profile?.role === 'nurse' ? (
            <>
              <div 
                className="card group overflow-hidden relative cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                style={{
                  transform: `translateY(${Math.sin(mousePosition.y * 0.01) * 2}px)`,
                  transition: 'transform 0.3s ease-out'
                }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/10 dark:to-primary-900/20 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-110 group-hover:rotate-12"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center space-x-1">
                      <Sparkles className="h-3 w-3 text-primary-500 animate-pulse" />
                      <span>Available Jobs</span>
                    </p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white animate-pulse">
                      {animatedStats.requests}
                    </p>
                    <div className="flex items-center space-x-1 mt-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-500 font-medium">+12% this week</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-900/40 p-3.5 rounded-2xl shadow-soft-sm group-hover:rotate-12 transition-transform">
                    <Search className="h-7 w-7 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform" />
                  </div>
                </div>
              </div>
              
              <div 
                className="card group overflow-hidden relative cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                style={{
                  transform: `translateY(${Math.sin(mousePosition.y * 0.01 + 1) * 2}px)`,
                  transition: 'transform 0.3s ease-out'
                }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/10 dark:to-green-900/20 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-110 group-hover:rotate-12"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center space-x-1">
                      <Zap className="h-3 w-3 text-green-500 animate-pulse" />
                      <span>Active Matches</span>
                    </p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white animate-pulse">
                      {animatedStats.matches}
                    </p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Activity className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-500 font-medium">High activity</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-900/40 p-3.5 rounded-2xl shadow-soft-sm group-hover:rotate-12 transition-transform">
                    <Users className="h-7 w-7 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
                  </div>
                </div>
              </div>
              
              <div className="card group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 dark:bg-yellow-900/10 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-110"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Professional Rating</p>
                    <div className="flex items-center space-x-1">
                      <p className="text-3xl font-black text-slate-900 dark:text-white">{nurseProfile?.rating || '0.0'}</p>
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    </div>
                  </div>
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3.5 rounded-2xl shadow-soft-sm">
                    <Star className="h-7 w-7 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </div>
              
              <div className="card group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-110"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Jobs Completed</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">{nurseProfile?.jobs_completed || 0}</p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3.5 rounded-2xl shadow-soft-sm">
                    <CheckCircle2 className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="card group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 dark:bg-primary-900/10 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-110"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Active Requests</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">
                      {userMatches.filter(m => m.status === 'accepted').length}
                    </p>
                  </div>
                  <div className="bg-primary-100 dark:bg-primary-900/30 p-3.5 rounded-2xl shadow-soft-sm">
                    <Calendar className="h-7 w-7 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
              </div>
              
              <Link href="/dashboard/hospital-appointments" className="card group overflow-hidden relative border-green-500/20 hover:border-green-500 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 dark:bg-green-900/10 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-110"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Hospital Queue</p>
                    <p className="text-xl font-black text-green-600 dark:text-green-400 flex items-center gap-1">
                      Find Doctors <ArrowRight className="h-4 w-4" />
                    </p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/30 p-3.5 rounded-2xl shadow-soft-sm">
                    <Hospital className="h-7 w-7 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </Link>
              
              <div className="card group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 dark:bg-yellow-900/10 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-110"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Pending Matches</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">
                      {userMatches.filter(m => m.status === 'pending').length}
                    </p>
                  </div>
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3.5 rounded-2xl shadow-soft-sm">
                    <Clock className="h-7 w-7 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </div>
              
              <div className="card group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-110"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">New Messages</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">0</p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3.5 rounded-2xl shadow-soft-sm">
                    <MessageCircle className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-slate-800 mb-10 pb-px">
          <nav className="flex space-x-10">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'stats', label: 'Stats' },
              ...(profile?.role === 'nurse' ? [{ id: 'jobs', label: 'Available Jobs' }] : []),
              { id: 'calendar', label: 'Calendar' },
              { id: 'matches', label: profile?.role === 'nurse' ? 'My Matches' : 'My Requests' },
              { id: 'messages', label: 'Messages' },
              { id: 'payments', label: 'Payments' },
              ...(profile?.role === 'client' ? [{ id: 'request', label: 'New Request' }] : []),
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-bold text-sm uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {tab.id === 'calendar' && (
                  <span className="flex items-center space-x-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>{tab.label}</span>
                    <Sparkles className="h-3 w-3 text-primary-500 animate-pulse" />
                  </span>
                )}
                {tab.id !== 'calendar' && tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="card">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Activity</h3>
                    <button className="text-primary-600 dark:text-primary-400 text-sm font-bold hover:underline">View all</button>
                  </div>
                  <div className="space-y-6">
                    {userMatches.slice(0, 5).map(match => (
                      <div key={match.id} className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all">
                        <div className="flex items-center space-x-4">
                          <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-3 group-hover:scale-110 transition-transform">
                            <Users className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {profile?.role === 'nurse' ? match.care_request.title : 'Match verification in progress'}
                            </p>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                              {new Date(match.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-full ${
                            match.status === 'accepted' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            match.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {match.status}
                          </span>
                          <ChevronRight className="h-5 w-5 text-slate-300 dark:text-slate-700" />
                        </div>
                      </div>
                    ))}
                    
                    {userMatches.length === 0 && (
                      <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                        <AlertCircle className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400 font-bold">No recent activity to show</p>
                        <p className="text-xs text-slate-400 mt-1">Activities will appear here once you start matching</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="card bg-gradient-to-br from-primary-600 to-primary-800 text-white border-none">
                  <h3 className="text-xl font-bold mb-4">Account Status</h3>
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3">
                      <Shield className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">{profile?.is_verified ? 'Verified Professional' : 'Verification Pending'}</p>
                      <p className="text-primary-100 text-sm">{profile?.is_verified ? 'Full access granted' : 'Limited features available'}</p>
                    </div>
                  </div>
                  {!profile?.is_verified && (
                    <button className="w-full py-3 bg-white text-primary-600 rounded-xl font-bold hover:bg-primary-50 transition-colors">
                      Complete Verification
                    </button>
                  )}
                </div>

                <div className="card">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Support Center</h3>
                  <div className="space-y-4">
                    <button className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                          <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-300">Live Chat</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </button>
                    <button className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg">
                          <Phone className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-300">Emergency Call</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'jobs' && profile?.role === 'nurse' && (
            <div className="space-y-8">
              <div className="card">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search jobs by title, description or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 pr-4 py-4 w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-4">
                      <Filter className="h-5 w-5 text-slate-400" />
                      <select
                        value={filterUrgency}
                        onChange={(e) => setFilterUrgency(e.target.value)}
                        className="bg-transparent font-bold text-slate-700 dark:text-slate-300 focus:outline-none uppercase tracking-widest text-xs"
                      >
                        <option value="all">All Urgency</option>
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredRequests.map(request => (
                  <div key={request.id} className="card group hover:border-primary-300 dark:hover:border-primary-700">
                    <div className="flex items-start justify-between mb-6">
                      <div className="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-2xl">
                        <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                      </div>
                      <span className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-full ${
                        request.urgency === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {request.urgency}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">{request.title}</h3>
                    {request.client_name && (
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-3">Posted by {request.client_name}</p>
                    )}
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-8 line-clamp-2 font-medium">
                      {request.description}
                    </p>
                    
                    <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center text-slate-500 dark:text-slate-500 text-sm font-bold">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="truncate">{request.location_address}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-slate-500 dark:text-slate-500 text-sm font-bold">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{new Date(request.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="text-primary-600 dark:text-primary-400 font-black">
                          XAF {request.budget?.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={async () => {
                        if (!profile) return
                        
                        try {
                          const { data: { user } } = await supabase.auth.getUser()
                          if (!user) {
                            alert('You must be logged in to apply')
                            return
                          }
                          
                          // Create a match/application
                          const { error } = await supabase
                            .from('matches')
                            .insert({
                              id: crypto.randomUUID(),
                              care_request_id: request.id,
                              nurse_id: user.id,
                              ai_score: Math.floor(Math.random() * 30) + 70, // Simulated AI score
                              status: 'pending',
                              admin_approved: false,
                              client_response: 'pending'
                            })
                          
                          if (error) {
                            console.error('Error applying to job:', error)
                            alert('Failed to apply. Please try again.')
                            return
                          }
                          
                          alert('Application submitted successfully!')
                          loadData() // Refresh data
                        } catch (error) {
                          console.error('Error:', error)
                          alert('An unexpected error occurred')
                        }
                      }}
                      className="w-full mt-8 btn-primary"
                    >
                      Apply Now
                    </button>
                  </div>
                ))}
                
                {filteredRequests.length === 0 && (
                  <div className="col-span-full card py-20 text-center bg-slate-50/50 dark:bg-slate-900/30 border-dashed">
                    <div className="bg-slate-100 dark:bg-slate-800 h-20 w-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <Search className="h-10 w-10 text-slate-400" />
                    </div>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">No jobs found matching your criteria</p>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Try adjusting your search terms or filters</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'matches' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {userMatches.map(match => (
                <div key={match.id} className="card group hover:border-primary-300 dark:hover:border-primary-700">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="h-14 w-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center border-2 border-white dark:border-dark-surface shadow-soft group-hover:scale-110 transition-transform">
                        {profile?.role === 'nurse' ? (
                          <User className="h-7 w-7 text-slate-600 dark:text-slate-400" />
                        ) : (
                          <Shield className="h-7 w-7 text-primary-600 dark:text-primary-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
                          {profile?.role === 'nurse' ? match.care_request.title : 'Professional Match'}
                        </h3>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                          ID: {match.id.split('-')[0]}
                        </p>
                      </div>
                    </div>
                    <span className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-full ${
                      match.status === 'accepted' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      match.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      match.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {match.status}
                    </span>
                  </div>
                  
                  <div className="space-y-4 mb-8 bg-slate-50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-500 dark:text-slate-500">AI Compatibility</span>
                      <div className="flex items-center">
                        <span className="text-lg font-black text-primary-600 dark:text-primary-400 mr-1">{match.ai_score}%</span>
                        <CheckCircle2 className="h-4 w-4 text-primary-500" />
                      </div>
                    </div>
                    
                    <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full transition-all duration-1000" style={{ width: `${match.ai_score}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    {profile?.role === 'nurse' ? (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-bold text-slate-500">Project Budget</span>
                          <span className="font-black text-slate-900 dark:text-white text-lg">XAF {match.care_request.budget?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-bold text-slate-500">Location</span>
                          <span className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{match.care_request.location_address}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-bold text-slate-500">Experience</span>
                          <span className="font-black text-slate-900 dark:text-white">{match.nurse_profile.experience_years} Years</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-bold text-slate-500">Professional Rating</span>
                          <div className="flex items-center font-black text-slate-900 dark:text-white">
                            {match.nurse_profile.rating}/5 <Star className="h-3 w-3 ml-1 fill-yellow-500 text-yellow-500" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-bold text-slate-500">Standard Rate</span>
                          <span className="font-black text-slate-900 dark:text-white">XAF {match.nurse_profile.hourly_rate}/hr</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    {match.status === 'pending' && profile?.role === 'client' ? (
                      <>
                        <button 
                          onClick={() => handleStatusUpdate(match.id, 'accepted', 'accepted')}
                          className="flex-1 btn-primary py-3"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(match.id, 'declined', 'declined')}
                          className="flex-1 btn-outline py-3"
                        >
                          Decline
                        </button>
                      </>
                    ) : match.status === 'pending' && profile?.role === 'nurse' ? (
                      <>
                        <button 
                          onClick={() => handleStatusUpdate(match.id, 'accepted')}
                          className="flex-1 btn-primary py-3"
                        >
                          Accept Job
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(match.id, 'declined')}
                          className="flex-1 btn-outline py-3"
                        >
                          Decline
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => setActiveTab('messages')}
                        className="w-full btn-primary py-4 flex items-center justify-center space-x-2"
                      >
                        <MessageCircle className="h-5 w-5" />
                        <span>Secure Messaging</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {userMatches.length === 0 && (
                <div className="col-span-full card py-20 text-center bg-slate-50/50 dark:bg-slate-900/30 border-dashed">
                  <div className="bg-slate-100 dark:bg-slate-800 h-20 w-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Users className="h-10 w-10 text-slate-400" />
                  </div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">No matches found yet</p>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">New matches will appear here based on our AI algorithm</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'messages' && profile && (
            <MessageSystem 
              currentUserId={profile.id} 
              currentUserRole={profile.role as 'nurse' | 'client'} 
            />
          )}

          {activeTab === 'payments' && profile && (
            <PaymentSystem 
              userId={profile.id}
              userRole={profile.role as 'nurse' | 'client'}
            />
          )}

          {activeTab === 'request' && profile?.role === 'client' && (
            <div className="max-w-4xl mx-auto">
              <div className="card overflow-hidden">
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-8 -mx-6 -mt-6 mb-10 text-white">
                  <h3 className="text-2xl font-bold mb-2">Create New Care Request</h3>
                  <p className="text-primary-100 font-medium">Fill in the details below to find your perfect professional match.</p>
                </div>
                
                <form className="space-y-10" onSubmit={handleCreateRequest}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                    <div className="space-y-2">
                      <label className="block text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Request Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        required
                        className="input-field"
                        placeholder="e.g., Post-surgery recovery care"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Care Type *
                      </label>
                      <select name="care_type" required className="input-field appearance-none">
                        <option value="">Select Category</option>
                        <option value="elder">Elder Care</option>
                        <option value="child">Child Care</option>
                        <option value="medical">Medical Support</option>
                        <option value="general">General Care</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Urgency Level
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {['low', 'medium', 'high'].map(level => (
                          <button 
                            key={level} 
                            type="button" 
                            name="urgency"
                            value={level}
                            onClick={(e) => {
                              const buttons = e.currentTarget.parentElement?.querySelectorAll('button') || []
                              buttons.forEach(btn => {
                                btn.classList.remove('border-primary-500', 'bg-primary-50', 'dark:bg-primary-900/20')
                                btn.classList.add('border-slate-100', 'dark:border-slate-800')
                              })
                              e.currentTarget.classList.remove('border-slate-100', 'dark:border-slate-800')
                              e.currentTarget.classList.add('border-primary-500', 'bg-primary-50', 'dark:bg-primary-900/20')
                              // Store value in hidden input
                              let hiddenInput = document.querySelector('input[name="urgency"]') as HTMLInputElement
                              if (!hiddenInput) {
                                hiddenInput = document.createElement('input')
                                hiddenInput.type = 'hidden'
                                hiddenInput.name = 'urgency'
                                e.currentTarget.parentElement?.parentElement?.appendChild(hiddenInput)
                              }
                              hiddenInput.value = level
                            }} 
                            className="py-3 px-1 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold uppercase tracking-tighter hover:border-primary-500 transition-all"
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                      <input type="hidden" name="urgency" value="medium" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Preferred Start Date
                      </label>
                      <input
                        type="date"
                        name="start_date"
                        className="input-field"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Budget (XAF)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                          type="number"
                          name="budget"
                          className="input-field pl-12"
                          placeholder="Amount per hour"
                          min="1000"
                          defaultValue="5000"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Service Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                          type="text"
                          name="location_address"
                          className="input-field pl-12"
                          placeholder="e.g. Akwa, Douala"
                          defaultValue={profile?.location_address || ''}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Detailed Description *
                    </label>
                    <textarea
                      name="description"
                      required
                      rows={4}
                      className="input-field"
                      placeholder="Please provide specific details about the patient and care requirements..."
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <label className="block text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Required Qualifications
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        'Professional Nursing License',
                        'First Aid & CPR Certified',
                        'Experience with elderly care',
                        'Available for night shifts'
                      ].map(req => (
                        <label key={req} className="flex items-center p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-white dark:hover:bg-slate-900 transition-all">
                          <input type="checkbox" name="requirements" value={req} className="h-5 w-5 rounded-lg border-slate-300 text-primary-600 focus:ring-primary-500" />
                          <span className="ml-4 text-sm font-bold text-slate-700 dark:text-slate-300">{req}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <button type="submit" className="w-full btn-primary py-6 text-xl font-black shadow-soft-lg hover:shadow-primary-500/30 flex items-center justify-center space-x-3">
                    <span>Publish Request</span>
                    <Plus className="h-6 w-6" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="space-y-8">
              {/* Calendar Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 flex items-center space-x-3">
                    <CalendarDays className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                    <span>Appointment Calendar</span>
                    <Sparkles className="h-6 w-6 text-purple-500 animate-pulse" />
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">Schedule and manage your appointments</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex bg-white dark:bg-slate-800 rounded-xl shadow-lg p-1">
                    {(['month', 'week', 'day'] as const).map(view => (
                      <button
                        key={view}
                        onClick={() => setCurrentView(view)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                          currentView === view
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {view}
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => setShowBookingModal(true)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-green-500/30 transition-all flex items-center space-x-2"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Book Appointment</span>
                  </button>
                </div>
              </div>

              {/* Functional Calendar */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div 
                    ref={calendarRef}
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden"
                    style={{
                      transform: `translateY(${Math.sin(mousePosition.y * 0.01) * 1}px)`,
                      transition: 'transform 0.3s ease-out'
                    }}
                  >
                    {/* Calendar Navigation */}
                    <div className="bg-gradient-to-r from-primary-600 to-cyan-500 p-6 text-white">
                      <div className="flex items-center justify-between">
                        <button 
                          onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
                          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <h3 className="text-xl font-bold">
                          {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h3>
                        <button 
                          onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
                          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Calendar Days */}
                    <div className="p-6">
                      <div className="grid grid-cols-7 gap-2 mb-4">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                          <div key={day} className="text-center text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider py-2">
                            {day}
                          </div>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 42 }, (_, i) => {
                          const firstDay = getFirstDayOfMonth(selectedDate)
                          const daysInMonth = getDaysInMonth(selectedDate)
                          const day = i - firstDay + 1
                          const isToday = day === new Date().getDate() && 
                                         selectedDate.getMonth() === new Date().getMonth() && 
                                         selectedDate.getFullYear() === new Date().getFullYear()
                          const isCurrentMonth = day >= 1 && day <= daysInMonth
                          const hasAppointment = [5, 8, 12, 15, 18, 22, 28].includes(day)
                          
                          if (!isCurrentMonth) {
                            return <div key={i} className="p-4"></div>
                          }
                          
                          return (
                            <div
                              key={i}
                              onClick={() => handleDateClick(day)}
                              className={`relative p-4 rounded-2xl cursor-pointer transition-all transform hover:scale-105 ${
                                isToday 
                                  ? 'bg-gradient-to-br from-primary-600 to-cyan-500 text-white shadow-lg' 
                                  : hasAppointment
                                  ? 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-primary-200 dark:border-primary-800'
                                  : 'bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900'
                              } ${selectedBookingDate?.getDate() === day ? 'ring-2 ring-primary-500' : ''}`}
                            >
                              <div className="text-sm font-bold">{day}</div>
                              {hasAppointment && (
                                <div className="mt-1">
                                  <div className={`h-1 rounded-full animate-pulse ${
                                    isToday ? 'bg-white' : 'bg-gradient-to-r from-primary-600 to-cyan-500'
                                  }`}></div>
                                </div>
                              )}
                              {isToday && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Side Panel */}
                <div className="space-y-6">
                  {/* Selected Date Info */}
                  {selectedBookingDate && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-4">
                        {selectedBookingDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </h3>
                      
                      {availableHours.length > 0 ? (
                        <div className="space-y-3">
                          <p className="text-sm text-slate-600 dark:text-slate-400">Available Time Slots:</p>
                          <div className="grid grid-cols-2 gap-2">
                            {availableHours.map(hour => (
                              <button
                                key={hour}
                                onClick={() => handleTimeSlotSelect(hour)}
                                className={`p-2 rounded-xl text-sm font-medium transition-all ${
                                  selectedTimeSlot === hour
                                    ? 'bg-gradient-to-r from-primary-600 to-cyan-500 text-white'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                }`}
                              >
                                {hour}
                              </button>
                            ))}
                          </div>
                          
                          {selectedTimeSlot && (
                            <button
                              onClick={handleBookingConfirm}
                              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-green-500/30 transition-all"
                            >
                              Confirm Booking
                            </button>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400">No available time slots for this date</p>
                      )}
                    </div>
                  )}

                  {/* Upcoming Appointments */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Upcoming Appointments</h3>
                    <div className="space-y-3">
                      {[
                        { date: 'Dec 15', time: '09:00 AM', doctor: 'Dr. Sarah Mbarga', type: 'Cardiology' },
                        { date: 'Dec 18', time: '02:00 PM', doctor: 'Dr. Jean Tondo', type: 'Pediatrics' },
                        { date: 'Dec 22', time: '11:00 AM', doctor: 'Dr. Marie Ekotto', type: 'Orthopedics' },
                      ].map((apt, index) => (
                        <div key={index} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">{apt.doctor}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{apt.type}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{apt.date}</p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">{apt.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Booking Modal */}
          {showBookingModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-primary-600 to-cyan-500 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Book Appointment</h3>
                    <button
                      onClick={() => setShowBookingModal(false)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { name: 'Dr. Sarah Mbarga', specialty: 'Cardiology', time: '09:00 AM', patients: 8, color: 'from-primary-600 to-cyan-500', available: true },
                      { name: 'Dr. Jean Tondo', specialty: 'Pediatrics', time: '10:30 AM', patients: 5, color: 'from-blue-600 to-cyan-600', available: true },
                      { name: 'Dr. Marie Ekotto', specialty: 'Orthopedics', time: '02:00 PM', patients: 12, color: 'from-green-600 to-emerald-600', available: false },
                      { name: 'Dr. Paul Fotso', specialty: 'Neurology', time: '03:30 PM', patients: 6, color: 'from-orange-600 to-red-600', available: true },
                    ].map((doctor, index) => (
                      <div
                        key={index}
                        onClick={() => doctor.available && handleDoctorBooking(doctor)}
                        className={`relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden ${
                          doctor.available ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${doctor.color} opacity-5`}></div>
                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${doctor.color}`}></div>
                        
                        <div className="p-6 relative z-10">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${doctor.color} flex items-center justify-center text-white font-bold shadow-lg`}>
                                <Stethoscope className="h-6 w-6" />
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 dark:text-white">{doctor.name}</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{doctor.specialty}</p>
                              </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                              doctor.available 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {doctor.available ? 'Available' : 'Busy'}
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                                <Clock3 className="h-4 w-4" />
                                <span className="text-sm font-medium">{doctor.time}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                                <Users className="h-4 w-4" />
                                <span className="text-sm font-medium">{doctor.patients} patients</span>
                              </div>
                            </div>
                            
                            {doctor.available && (
                              <button className={`w-full py-2 px-3 rounded-lg text-sm font-bold transition-all bg-gradient-to-r ${doctor.color} text-white shadow-md hover:shadow-lg transform hover:scale-105`}>
                                Select Doctor
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
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
