import { createClient } from '@supabase/supabase-js'
import { mockAuth, mockDb } from './mockAuth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if we should use mock mode (when Supabase is not configured)
const isMockMode = !supabaseUrl || 
  supabaseUrl === 'https://your-actual-project-id.supabase.co' || 
  supabaseUrl.includes('placeholder') ||
  !supabaseAnonKey ||
  supabaseAnonKey === 'your-actual-anon-key-here' ||
  supabaseAnonKey.includes('placeholder')

// Log mode on initialization
if (isMockMode) {
  console.log('🔧 Running in MOCK MODE - Supabase not configured')
  console.log('📝 Authentication will use localStorage for testing')
} else {
  console.log('✅ Running in PRODUCTION MODE - Connected to Supabase')
}

// Create Supabase client only if configured
let supabaseClient: any = null

if (!isMockMode && supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 2
      }
    }
  })
}

// Export a unified client that works in both modes
export const supabase = {
  auth: isMockMode ? mockAuth : supabaseClient.auth,
  from: isMockMode ? mockDb.from : supabaseClient.from,
  isMockMode
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          role: 'nurse' | 'client' | 'admin'
          avatar_url: string | null
          created_at: string
          updated_at: string
          is_verified: boolean
          verification_status: 'pending' | 'approved' | 'rejected'
          location_lat: number | null
          location_lng: number | null
          location_address: string | null
          bio: string | null
        }
        Insert: {
          id: string
          email: string
          role: 'nurse' | 'client' | 'admin'
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          is_verified?: boolean
          verification_status?: 'pending' | 'approved' | 'rejected'
          location_lat?: number | null
          location_lng?: number | null
          location_address?: string | null
          bio?: string | null
        }
        Update: {
          email?: string
          full_name?: string | null
          phone?: string | null
          role?: 'nurse' | 'client' | 'admin'
          avatar_url?: string | null
          is_verified?: boolean
          verification_status?: 'pending' | 'approved' | 'rejected'
          location_lat?: number | null
          location_lng?: number | null
          location_address?: string | null
          bio?: string | null
        }
      }
      nurse_profiles: {
        Row: {
          id: string
          user_id: string
          license_number: string
          specialization: string[]
          experience_years: number
          education: string
          certifications: string[]
          id_document_hash: string
          certification_hashes: string[]
          ai_score: number
          rating: number
          jobs_completed: number
          created_at: string
          updated_at: string
          availability: boolean
          hourly_rate: number
        }
        Insert: {
          id: string
          user_id: string
          license_number: string
          specialization: string[]
          experience_years: number
          education: string
          certifications: string[]
          id_document_hash: string
          certification_hashes: string[]
          hourly_rate: number
          availability?: boolean
          ai_score?: number
          rating?: number
          jobs_completed?: number
        }
        Update: {
          license_number?: string
          specialization?: string[]
          experience_years?: number
          education?: string
          certifications?: string[]
          id_document_hash?: string
          certification_hashes?: string[]
          hourly_rate?: number
          availability?: boolean
          ai_score?: number
          rating?: number
          jobs_completed?: number
        }
      }
      care_requests: {
        Row: {
          id: string
          client_id: string
          title: string
          description: string
          care_type: string
          urgency: 'low' | 'medium' | 'high'
          location_lat: number
          location_lng: number
          location_address: string
          start_date: string
          end_date: string | null
          budget: number | null
          status: 'open' | 'matched' | 'in_progress' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
          requirements: string[]
        }
        Insert: {
          id: string
          client_id: string
          title: string
          description: string
          care_type: string
          urgency: 'low' | 'medium' | 'high'
          location_lat: number
          location_lng: number
          location_address: string
          start_date: string
          end_date?: string | null
          budget?: number | null
          requirements?: string[]
          status?: 'open' | 'matched' | 'in_progress' | 'completed' | 'cancelled'
        }
        Update: {
          title?: string
          description?: string
          care_type?: string
          urgency?: 'low' | 'medium' | 'high'
          location_lat?: number
          location_lng?: number
          location_address?: string
          start_date?: string
          end_date?: string | null
          budget?: number | null
          requirements?: string[]
          status?: 'open' | 'matched' | 'in_progress' | 'completed' | 'cancelled'
        }
      }
      matches: {
        Row: {
          id: string
          care_request_id: string
          nurse_id: string
          ai_score: number
          status: 'pending' | 'approved' | 'rejected' | 'accepted' | 'declined'
          admin_approved: boolean
          created_at: string
          updated_at: string
          client_response: 'pending' | 'accepted' | 'declined' | null
        }
        Insert: {
          id: string
          care_request_id: string
          nurse_id: string
          ai_score: number
          status?: 'pending' | 'approved' | 'rejected' | 'accepted' | 'declined'
          admin_approved?: boolean
          client_response?: 'pending' | 'accepted' | 'declined' | null
        }
        Update: {
          ai_score?: number
          status?: 'pending' | 'approved' | 'rejected' | 'accepted' | 'declined'
          admin_approved?: boolean
          client_response?: 'pending' | 'accepted' | 'declined' | null
        }
      }
      messages: {
        Row: {
          id: string
          match_id: string
          sender_id: string
          receiver_id: string
          content: string
          message_type: 'text' | 'image' | 'document'
          file_url: string | null
          is_read: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          match_id: string
          sender_id: string
          receiver_id: string
          content: string
          message_type?: 'text' | 'image' | 'document'
          file_url?: string | null
          is_read?: boolean
        }
        Update: {
          content?: string
          message_type?: 'text' | 'image' | 'document'
          file_url?: string | null
          is_read?: boolean
        }
      }
      reviews: {
        Row: {
          id: string
          match_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          match_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment?: string | null
        }
        Update: {
          rating?: number
          comment?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          match_id: string
          amount: number
          currency: string
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_method: 'momo' | 'cash' | 'bank'
          transaction_id: string | null
          momo_phone: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id: string
          match_id: string
          amount: number
          currency: string
          payment_method: 'momo' | 'cash' | 'bank'
          momo_phone?: string | null
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_method?: 'momo' | 'cash' | 'bank'
          transaction_id?: string | null
          momo_phone?: string | null
          completed_at?: string | null
        }
      }
    }
  }
}
