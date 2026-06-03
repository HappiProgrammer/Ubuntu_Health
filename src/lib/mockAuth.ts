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
    const chain: any = {
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
      
      select: (columns?: string) => {
        return chain
      },

      eq: (column: string, value: any) => {
        chain._filter = { column, value }
        return chain
      },

      match: (filters: Record<string, any>) => {
        chain._matches = filters
        return chain
      },

      order: (column: string, { ascending = true } = {}) => {
        chain._order = { column, ascending }
        return chain
      },

      limit: (count: number) => {
        chain._limit = count
        return chain
      },

      range: (from: number, to: number) => {
        chain._range = { from, to }
        return chain
      },

      single: async () => {
        await new Promise(resolve => setTimeout(resolve, 300))
        const data = await chain._execute()
        return { data: Array.isArray(data) ? data[0] : data, error: null }
      },

      then: (onfulfilled?: (value: any) => any) => {
        return chain._execute().then(onfulfilled)
      },

      _execute: async () => {
        await new Promise(resolve => setTimeout(resolve, 300))
        let result: any[] = []

        if (table === 'profiles') {
          result = getMockProfiles()
        } else if (table === 'nurse_profiles') {
          result = getMockNurseProfiles()
        } else if (table === 'care_requests') {
          const storedRequests = localStorage.getItem('mock_care_requests')
          result = storedRequests ? JSON.parse(storedRequests) : []
          
          if (result.length === 0) {
            // Default mock data if empty
            result = [
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
              }
            ]
            localStorage.setItem('mock_care_requests', JSON.stringify(result))
          }
        }

        // Apply filters
        if (chain._filter) {
          result = result.filter(item => item[chain._filter.column] === chain._filter.value)
        }

        if (chain._matches) {
          result = result.filter(item => 
            Object.entries(chain._matches).every(([col, val]) => item[col] === val)
          )
        }

        // Apply order
        if (chain._order) {
          result.sort((a, b) => {
            const valA = a[chain._order.column]
            const valB = b[chain._order.column]
            if (valA < valB) return chain._order.ascending ? -1 : 1
            if (valA > valB) return chain._order.ascending ? 1 : -1
            return 0
          })
        }

        // Apply range/limit
        if (chain._range) {
          result = result.slice(chain._range.from, chain._range.to + 1)
        } else if (chain._limit) {
          result = result.slice(0, chain._limit)
        }

        // Reset state for next query
        chain._filter = null
        chain._matches = null
        chain._order = null
        chain._limit = null
        chain._range = null

        return result
      },

      update: async (data: any) => {
        await new Promise(resolve => setTimeout(resolve, 400))
        // Basic update implementation using existing filters
        if (chain._filter && table === 'profiles') {
          const profiles = getMockProfiles()
          const index = profiles.findIndex((p: any) => p[chain._filter.column] === chain._filter.value)
          
          if (index >= 0) {
            profiles[index] = { ...profiles[index], ...data }
            localStorage.setItem(MOCK_PROFILES_KEY, JSON.stringify(profiles))
            return { data: profiles[index], error: null }
          }
        }
        return { data: null, error: new Error('Update failed or not implemented for this table') }
      }
    }

    return chain
  }
}
