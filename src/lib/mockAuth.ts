/**
 * Mock Authentication Service
 * Simulates Supabase authentication for development/testing without real Supabase
 */

export interface MockUser {
  id: string
  email: string
  full_name: string | null
  role: 'nurse' | 'client' | 'admin'
  phone: string | null
  created_at: string
}

export interface MockAuthResponse {
  user: MockUser | null
  error: Error | null
}

export interface MockProfileData {
  id: string
  email: string
  full_name: string
  phone: string
  role: 'nurse' | 'client' | 'admin'
  location_lat?: number | null
  location_lng?: number | null
  location_address: string
  bio?: string | null
  created_at: string
}

// Storage keys
const MOCK_USERS_KEY = 'mock_users'
const MOCK_CURRENT_USER_KEY = 'mock_current_user'
const MOCK_PROFILES_KEY = 'mock_profiles'
const MOCK_NURSE_PROFILES_KEY = 'mock_nurse_profiles'

// Helper functions for localStorage
function getMockUsers(): MockUser[] {
  const users = localStorage.getItem(MOCK_USERS_KEY)
  return users ? JSON.parse(users) : []
}

function saveMockUsers(users: MockUser[]): void {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users))
}

function getCurrentUser(): MockUser | null {
  const user = localStorage.getItem(MOCK_CURRENT_USER_KEY)
  return user ? JSON.parse(user) : null
}

function setCurrentUser(user: MockUser | null): void {
  if (user) {
    localStorage.setItem(MOCK_CURRENT_USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(MOCK_CURRENT_USER_KEY)
  }
}

function getMockProfiles(): MockProfileData[] {
  const profiles = localStorage.getItem(MOCK_PROFILES_KEY)
  return profiles ? JSON.parse(profiles) : []
}

function saveMockProfile(profile: MockProfileData): void {
  const profiles = getMockProfiles()
  const existingIndex = profiles.findIndex(p => p.id === profile.id)
  
  if (existingIndex >= 0) {
    profiles[existingIndex] = profile
  } else {
    profiles.push(profile)
  }
  
  localStorage.setItem(MOCK_PROFILES_KEY, JSON.stringify(profiles))
}

function getMockNurseProfiles(): any[] {
  const profiles = localStorage.getItem(MOCK_NURSE_PROFILES_KEY)
  return profiles ? JSON.parse(profiles) : []
}

function saveMockNurseProfile(profile: any): void {
  const profiles = getMockNurseProfiles()
  profiles.push(profile)
  localStorage.setItem(MOCK_NURSE_PROFILES_KEY, JSON.stringify(profiles))
}

// Mock Supabase auth client
export const mockAuth = {
  signUp: async (data: {
    email: string
    password: string
    options?: {
      data?: {
        full_name?: string
        role?: string
      }
    }
  }): Promise<{ data: { user: MockUser | null; session: any }, error: Error | null }> => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Check if user already exists
      const users = getMockUsers()
      const existingUser = users.find(u => u.email === data.email)
      
      if (existingUser) {
        return {
          data: { user: null, session: null },
          error: new Error('User already registered')
        }
      }
      
      // Validate password
      if (data.password.length < 8) {
        return {
          data: { user: null, session: null },
          error: new Error('Password must be at least 8 characters')
        }
      }
      
      // Create new user
      const newUser: MockUser = {
        id: crypto.randomUUID(),
        email: data.email,
        full_name: data.options?.data?.full_name || null,
        role: (data.options?.data?.role as 'nurse' | 'client' | 'admin') || 'client',
        phone: null,
        created_at: new Date().toISOString()
      }
      
      // Save user (in real app, password would be hashed)
      users.push(newUser)
      saveMockUsers(users)
      
      // Set current user
      setCurrentUser(newUser)
      
      // Create mock session
      const session = {
        user: newUser,
        access_token: 'mock_token_' + Date.now(),
        refresh_token: 'mock_refresh_' + Date.now(),
        expires_in: 3600
      }
      
      return {
        data: { user: newUser, session },
        error: null
      }
    } catch (error: any) {
      return {
        data: { user: null, session: null },
        error: new Error(error.message || 'Registration failed')
      }
    }
  },

  signIn: async (data: {
    email: string
    password: string
  }): Promise<{ data: { user: MockUser | null; session: any }, error: Error | null }> => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const users = getMockUsers()
      const user = users.find(u => u.email === data.email)
      
      if (!user) {
        return {
          data: { user: null, session: null },
          error: new Error('Invalid email or password')
        }
      }
      
      setCurrentUser(user)
      
      // Create mock session
      const session = {
        user,
        access_token: 'mock_token_' + Date.now(),
        refresh_token: 'mock_refresh_' + Date.now(),
        expires_in: 3600
      }
      
      return {
        data: { user, session },
        error: null
      }
    } catch (error: any) {
      return {
        data: { user: null, session: null },
        error: new Error(error.message || 'Login failed')
      }
    }
  },

  signOut: async (): Promise<{ error: Error | null }> => {
    setCurrentUser(null)
    return { error: null }
  },

  getUser: (): { user: MockUser | null } => {
    const user = getCurrentUser()
    return { user }
  },

  onAuthStateChange: (callback: (user: MockUser | null) => void) => {
    // Immediately call with current user
    callback(getCurrentUser())
    
    // Return unsubscribe function
    return {
      data: {
        subscription: {
          unsubscribe: () => {}
        }
      }
    }
  }
}

// Mock database operations
export const mockDb = {
  from: (table: string) => {
    return {
      insert: async (data: any | any[]) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        try {
          const dataArray = Array.isArray(data) ? data : [data]
          
          if (table === 'profiles') {
            dataArray.forEach((profile: MockProfileData) => {
              saveMockProfile(profile)
            })
          } else if (table === 'nurse_profiles') {
            dataArray.forEach((profile: any) => {
              saveMockNurseProfile(profile)
            })
          } else if (table === 'care_requests') {
            // Store care requests in localStorage
            const storedRequests = localStorage.getItem('mock_care_requests')
            const allRequests = storedRequests ? JSON.parse(storedRequests) : []
            allRequests.push(...dataArray)
            localStorage.setItem('mock_care_requests', JSON.stringify(allRequests))
          }
          
          return { data: dataArray, error: null }
        } catch (error: any) {
          return { data: null, error: new Error(error.message) }
        }
      },
      
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            await new Promise(resolve => setTimeout(resolve, 300))
            
            if (table === 'profiles') {
              const profiles = getMockProfiles()
              const result = profiles.find((p: any) => (p as any)[column] === value)
              return { data: result || null, error: null }
            } else if (table === 'nurse_profiles') {
              const profiles = getMockNurseProfiles()
              const result = profiles.find((p: any) => (p as any)[column] === value)
              return { data: result || null, error: null }
            }
            
            return { data: null, error: null }
          }
        }),
        order: () => ({
          ascending: async (ascending: boolean) => {
            await new Promise(resolve => setTimeout(resolve, 300))
            
            if (table === 'care_requests') {
              // Load care requests from localStorage
              const storedRequests = localStorage.getItem('mock_care_requests')
              let mockRequests = storedRequests ? JSON.parse(storedRequests) : []
              
              // If no requests exist, create default ones including John's requests
              if (mockRequests.length === 0) {
                mockRequests = [
                  {
                    id: 'req_john_1',
                    client_id: 'user1',
                    client_name: 'John Doe',
                    title: 'Elderly Father Needs Daily Care Assistance',
                    description: 'Looking for an experienced nurse to help my 78-year-old father with daily activities including medication management, meal preparation, and light exercise. He has mild diabetes and needs someone patient and compassionate.',
                    care_type: 'elder',
                    urgency: 'high',
                    location_address: 'Akwa, Douala',
                    start_date: new Date().toISOString(),
                    budget: 25000,
                    status: 'open',
                    created_at: new Date(Date.now() - 86400000).toISOString()
                  },
                  {
                    id: 'req_john_2',
                    client_id: 'user1',
                    client_name: 'John Doe',
                    title: 'Post-Surgery Recovery Care Needed',
                    description: 'My wife recently underwent knee replacement surgery and requires professional nursing care for the next 3 weeks. Tasks include wound care, physical therapy assistance, and medication administration. Must have post-surgery experience.',
                    care_type: 'medical',
                    urgency: 'medium',
                    location_address: 'Bonanjo, Douala',
                    start_date: new Date(Date.now() + 86400000 * 2).toISOString(),
                    budget: 35000,
                    status: 'open',
                    created_at: new Date(Date.now() - 172800000).toISOString()
                  },
                  {
                    id: 'req_3',
                    client_id: 'user3',
                    client_name: 'Jean Dupont',
                    title: 'Child Care - Infant Monitoring',
                    description: 'Need a pediatric nurse to monitor our 6-month-old baby during the day while both parents work. Must have experience with infant care and CPR certification.',
                    care_type: 'child',
                    urgency: 'medium',
                    location_address: 'Bali, Douala',
                    start_date: new Date(Date.now() + 86400000 * 7).toISOString(),
                    budget: 20000,
                    status: 'open',
                    created_at: new Date(Date.now() - 259200000).toISOString()
                  },
                  {
                    id: 'req_4',
                    client_id: 'user4',
                    client_name: 'Marie Ekotto',
                    title: 'General Home Care for Disabled Adult',
                    description: 'Seeking a compassionate nurse to provide daily care for my 45-year-old brother who has mobility challenges. Assistance needed with bathing, dressing, meals, and companionship.',
                    care_type: 'general',
                    urgency: 'low',
                    location_address: 'Deido, Douala',
                    start_date: new Date(Date.now() + 86400000 * 5).toISOString(),
                    budget: 18000,
                    status: 'open',
                    created_at: new Date(Date.now() - 345600000).toISOString()
                  },
                  {
                    id: 'req_5',
                    client_id: 'user3',
                    client_name: 'Jean Dupont',
                    title: 'Emergency Diabetes Management Care',
                    description: 'Urgent need for a nurse experienced in diabetes management to help stabilize my mother\'s blood sugar levels. She was recently diagnosed and needs immediate professional guidance.',
                    care_type: 'medical',
                    urgency: 'high',
                    location_address: 'New Bell, Douala',
                    start_date: new Date().toISOString(),
                    budget: 30000,
                    status: 'open',
                    created_at: new Date(Date.now() - 43200000).toISOString()
                  }
                ]
                // Save to localStorage
                localStorage.setItem('mock_care_requests', JSON.stringify(mockRequests))
              }
              
              return { data: ascending ? mockRequests : mockRequests.reverse(), error: null }
            }
            
            return { data: [], error: null }
          }
        })
      }),
      
      update: (data: any) => ({
        eq: async (column: string, value: any) => {
          await new Promise(resolve => setTimeout(resolve, 400))
          
          if (table === 'profiles') {
            const profiles = getMockProfiles()
            const index = profiles.findIndex((p: any) => (p as any)[column] === value)
            
            if (index >= 0) {
              profiles[index] = { ...profiles[index], ...data }
              localStorage.setItem(MOCK_PROFILES_KEY, JSON.stringify(profiles))
            }
            
            return { data: profiles[index] || null, error: null }
          }
          
          return { data: null, error: new Error('Not implemented') }
        }
      })
    }
  }
}
