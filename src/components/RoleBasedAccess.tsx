'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Shield, AlertCircle } from 'lucide-react'

type UserRole = 'admin' | 'nurse' | 'patient' | null

interface Profile {
  id: string
  role: UserRole
  applicationStatus?: string
}

interface RoleBasedAccessProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  fallback?: React.ReactNode
}

export default function RoleBasedAccess({ children, allowedRoles, fallback }: RoleBasedAccessProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const isMockMode = (supabase as any).isMockMode

  useEffect(() => {
    checkAccess()
  }, [pathname])

  const checkAccess = async () => {
    if (isMockMode) {
      const mockProfile = JSON.parse(localStorage.getItem('mock_user') || 'null')
      if (mockProfile) {
        setProfile(mockProfile)
        setAuthorized(allowedRoles.includes(mockProfile.role))
      } else {
        setAuthorized(false)
      }
      setLoading(false)
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setAuthorized(false)
        router.push('/auth/login')
        return
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      setProfile(profile)
      setAuthorized(allowedRoles.includes(profile?.role))
    } catch (error) {
      console.error('Error checking access:', error)
      setAuthorized(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF2E1] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A79277] mx-auto mb-4"></div>
          <p className="text-[#8B7355] font-medium">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (!authorized) {
    if (fallback) return <>{fallback}</>
    
    return (
      <div className="min-h-screen bg-[#FFF2E1] flex items-center justify-center p-4">
        <div className="bg-white rounded-md border border-[#E8DCC8] p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-[#5C4B37] mb-2">Access Denied</h2>
          <p className="text-[#8B7355] mb-6">
            You don't have permission to access this page. This area requires{' '}
            {allowedRoles.join(' or ')} privileges.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-[#A79277] text-white rounded-md hover:bg-[#9A8469] transition-colors font-semibold"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Additional check for nurse approval status
  if (profile?.role === 'nurse' && profile?.applicationStatus !== 'approved' && allowedRoles.includes('nurse')) {
    return (
      <div className="min-h-screen bg-[#FFF2E1] flex items-center justify-center p-4">
        <div className="bg-white rounded-md border border-[#E8DCC8] p-8 max-w-md w-full">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold text-[#5C4B37] mb-2">Profile Pending Approval</h2>
          <p className="text-[#8B7355] mb-4">
            Your nurse profile is currently under review by our admin team. 
            You'll receive a notification once your application is approved.
          </p>
          <div className="bg-[#F7E7CE] rounded-md p-4 border border-[#E8DCC8] mb-4">
            <p className="text-sm text-[#5C4B37]">
              <strong>Status:</strong> {profile.applicationStatus || 'pending'}
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full px-6 py-3 bg-[#A79277] text-white rounded-md hover:bg-[#9A8469] transition-colors font-semibold"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

/**
 * Hook to check user role
 */
export function useUserRole() {
  const [role, setRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState(true)
  const isMockMode = (supabase as any).isMockMode

  useEffect(() => {
    loadRole()
  }, [])

  const loadRole = async () => {
    if (isMockMode) {
      const mockProfile = JSON.parse(localStorage.getItem('mock_user') || 'null')
      setRole(mockProfile?.role || null)
      setLoading(false)
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setRole(null)
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      setRole(profile?.role || null)
    } catch (error) {
      console.error('Error loading role:', error)
      setRole(null)
    } finally {
      setLoading(false)
    }
  }

  return { role, loading, isAdmin: role === 'admin', isNurse: role === 'nurse', isPatient: role === 'patient' }
}

/**
 * Role-based route guard
 */
export function requireRole(allowedRoles: UserRole[]) {
  return function WrappedComponent(Component: React.ComponentType) {
    return function RoleGuardedComponent(props: any) {
      return (
        <RoleBasedAccess allowedRoles={allowedRoles}>
          <Component {...props} />
        </RoleBasedAccess>
      )
    }
  }
}
