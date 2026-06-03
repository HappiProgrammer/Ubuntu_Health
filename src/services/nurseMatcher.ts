'use client'

interface Nurse {
  id: string
  full_name: string
  specialties: string[]
  availableDays: string[]
  availableTimeSlots: string[]
  location_address: string
  yearsOfExperience: number
  rating: number
  applicationStatus: 'approved'
  lat?: number
  lng?: number
}

interface CareRequest {
  symptoms: string
  urgency: 'low' | 'medium' | 'high' | 'emergency'
  location: string
  preferredDate?: string
  preferredTime?: string
}

interface MatchedNurse extends Nurse {
  matchScore: number
  matchReasons: string[]
  distance?: number
}

/**
 * Smart Nurse Matching Algorithm
 * Matches patients with nurses based on:
 * 1. Specialty match (40% weight)
 * 2. Availability match (30% weight)
 * 3. Proximity/Location (20% weight)
 * 4. Experience & Rating (10% weight)
 */
export function matchNursesWithRequest(
  nurses: Nurse[],
  request: CareRequest
): MatchedNurse[] {
  // Only consider approved nurses
  const approvedNurses = nurses.filter(n => n.applicationStatus === 'approved')

  const matchedNurses = approvedNurses.map(nurse => {
    let matchScore = 0
    const matchReasons: string[] = []

    // 1. Specialty Match (40 points)
    const requestKeywords = extractKeywords(request.symptoms)
    const specialtyMatches = calculateSpecialtyMatch(nurse.specialties, requestKeywords)
    matchScore += specialtyMatches * 40
    if (specialtyMatches > 0.5) {
      matchReasons.push(`Specializes in ${getMatchingSpecialties(nurse.specialties, requestKeywords)}`)
    }

    // 2. Availability Match (30 points)
    const availabilityScore = calculateAvailability(
      nurse.availableDays,
      nurse.availableTimeSlots,
      request.preferredDate,
      request.preferredTime
    )
    matchScore += availabilityScore * 30
    if (availabilityScore > 0.7) {
      matchReasons.push('Available at your preferred time')
    }

    // 3. Location Proximity (20 points)
    const locationScore = calculateLocationMatch(nurse.location_address, request.location)
    matchScore += locationScore * 20
    if (locationScore > 0.6) {
      matchReasons.push(`Located near ${request.location}`)
    }

    // 4. Experience & Rating (10 points)
    const qualityScore = calculateQualityScore(nurse.yearsOfExperience, nurse.rating)
    matchScore += qualityScore * 10
    if (nurse.yearsOfExperience >= 5) {
      matchReasons.push(`${nurse.yearsOfExperience}+ years experience`)
    }
    if (nurse.rating >= 4.5) {
      matchReasons.push(`Highly rated (${nurse.rating}★)`)
    }

    // Emergency priority boost
    if (request.urgency === 'emergency') {
      // Boost nurses with more experience for emergencies
      const emergencyBoost = (nurse.yearsOfExperience / 20) * 10
      matchScore = Math.min(100, matchScore + emergencyBoost)
    }

    return {
      ...nurse,
      matchScore: Math.round(matchScore),
      matchReasons
    }
  })

  // Sort by match score (highest first)
  return matchedNurses
    .filter(n => n.matchScore > 30) // Only show nurses with >30% match
    .sort((a, b) => b.matchScore - a.matchScore)
}

/**
 * Extract keywords from symptoms description
 */
function extractKeywords(symptoms: string): string[] {
  const keywordMap: Record<string, string[]> = {
    'elder': ['elder', 'elderly', 'senior', 'aged', 'old'],
    'pediatric': ['child', 'children', 'baby', 'infant', 'pediatric', 'kid'],
    'post-surgery': ['surgery', 'post-surgery', 'recovery', 'operation'],
    'emergency': ['emergency', 'urgent', 'critical', 'severe', 'acute'],
    'maternity': ['pregnancy', 'maternity', 'prenatal', 'postnatal', 'baby'],
    'diabetes': ['diabetes', 'blood sugar', 'insulin', 'glucose'],
    'cardiac': ['heart', 'cardiac', 'chest pain', 'cardiovascular'],
    'general': ['general', 'checkup', 'routine', 'fever', 'cold', 'flu']
  }

  const symptomsLower = symptoms.toLowerCase()
  const matchedKeywords: string[] = []

  Object.entries(keywordMap).forEach(([category, keywords]) => {
    if (keywords.some(keyword => symptomsLower.includes(keyword))) {
      matchedKeywords.push(category)
    }
  })

  return matchedKeywords
}

/**
 * Calculate specialty match score
 */
function calculateSpecialtyMatch(
  nurseSpecialties: string[],
  requestKeywords: string[]
): number {
  if (requestKeywords.length === 0) return 0.5 // Default match if no keywords
  if (nurseSpecialties.length === 0) return 0

  let matchCount = 0
  nurseSpecialties.forEach(specialty => {
    const specialtyLower = specialty.toLowerCase()
    if (requestKeywords.some(keyword => specialtyLower.includes(keyword))) {
      matchCount++
    }
  })

  return Math.min(1, matchCount / Math.max(1, requestKeywords.length))
}

/**
 * Get matching specialty names
 */
function getMatchingSpecialties(
  nurseSpecialties: string[],
  requestKeywords: string[]
): string {
  const matches = nurseSpecialties.filter(specialty => {
    const specialtyLower = specialty.toLowerCase()
    return requestKeywords.some(keyword => specialtyLower.includes(keyword))
  })
  return matches.slice(0, 2).join(', ')
}

/**
 * Calculate availability match
 */
function calculateAvailability(
  availableDays: string[],
  availableTimeSlots: string[],
  preferredDate?: string,
  preferredTime?: string
): number {
  if (!preferredDate && !preferredTime) return 0.7 // Default if no preference

  let score = 0
  let factors = 0

  // Day match
  if (preferredDate) {
    const date = new Date(preferredDate)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const preferredDay = dayNames[date.getUTCDay()]
    
    if (availableDays.includes(preferredDay)) {
      score += 1
    }
    factors++
  }

  // Time match
  if (preferredTime && availableTimeSlots.length > 0) {
    const timeMatch = availableTimeSlots.some(slot => {
      const [start, end] = slot.split('-')
      return preferredTime >= start && preferredTime <= end
    })
    
    if (timeMatch) score += 1
    factors++
  }

  return factors > 0 ? score / factors : 0.5
}

/**
 * Calculate location match (simple string similarity)
 */
function calculateLocationMatch(
  nurseLocation: string,
  requestLocation: string
): number {
  if (!nurseLocation || !requestLocation) return 0.3

  const nurseLower = nurseLocation.toLowerCase()
  const requestLower = requestLocation.toLowerCase()

  // Exact match
  if (nurseLower === requestLower) return 1.0

  // Contains match
  if (nurseLower.includes(requestLower) || requestLower.includes(nurseLower)) {
    return 0.8
  }

  // Partial match (same city/area)
  const nurseWords = nurseLower.split(',').map(w => w.trim())
  const requestWords = requestLower.split(',').map(w => w.trim())

  const commonWords = nurseWords.filter(word =>
    requestWords.some(rw => rw.includes(word) || word.includes(rw))
  )

  return commonWords.length > 0 ? 0.6 : 0.3
}

/**
 * Calculate quality score based on experience and rating
 */
function calculateQualityScore(
  yearsOfExperience: number,
  rating: number
): number {
  // Experience score (0-10 years = 0-1, capped at 10)
  const experienceScore = Math.min(1, yearsOfExperience / 10)

  // Rating score (0-5 stars = 0-1)
  const ratingScore = rating / 5

  // Weighted average
  return (experienceScore * 0.4) + (ratingScore * 0.6)
}

/**
 * Calculate match score between a nurse and a care request
 */
export function calculateMatchScore(nurse: any, request: any): number {
  let matchScore = 0

  // 1. Specialty Match (40 points)
  const requestKeywords = extractKeywords(request.description || '')
  const specialtyMatches = calculateSpecialtyMatch(nurse.specialties || [], requestKeywords)
  matchScore += specialtyMatches * 40

  // 2. Availability Match (30 points)
  const availabilityScore = calculateAvailability(
    nurse.availableDays || [],
    nurse.availableTimeSlots || [],
    request.start_date,
    request.preferredTime
  )
  matchScore += availabilityScore * 30

  // 3. Location Proximity (20 points)
  const locationScore = calculateLocationMatch(nurse.location_address || '', request.location_address || '')
  matchScore += locationScore * 20

  // 4. Experience & Rating (10 points)
  const qualityScore = calculateQualityScore(nurse.yearsOfExperience || 0, nurse.rating || 0)
  matchScore += qualityScore * 10

  return Math.round(matchScore)
}

/**
 * Find and save potential matches for a care request
 */
export async function findAndSaveMatches(requestId: string, supabase: any) {
  try {
    // 1. Fetch the care request
    const { data: request, error: requestError } = await supabase
      .from('care_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (requestError) throw requestError

    // 2. Fetch verified nurses
    const { data: nurses, error: nursesError } = await supabase
      .from('profiles')
      .select('*, nurse_profile:nurse_profiles(*)')
      .eq('role', 'nurse')
      .eq('verification_status', 'approved')

    if (nursesError) throw nursesError

    // 3. Score and filter nurses
    const potentialMatches = (nurses || [])
      .map((nurse: any) => {
        const score = calculateMatchScore(
          {
            specialties: nurse.nurse_profile?.specialization || [],
            availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], // Placeholder availability
            location_address: nurse.location_address || '',
            yearsOfExperience: nurse.nurse_profile?.experience_years || 0,
            rating: nurse.nurse_profile?.rating || 0
          },
          {
            care_type: request.care_type,
            urgency: request.urgency,
            location_address: request.location_address,
            start_date: request.start_date,
            description: request.description
          }
        )
        return { nurse, score }
      })
      .filter((m: any) => m.score >= 50) // Only keep matches with score >= 50
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 5) // Keep top 5

    // 4. Save matches to the database
    if (potentialMatches.length > 0) {
      const matchInserts = potentialMatches.map((m: any) => ({
        id: crypto.randomUUID(),
        care_request_id: requestId,
        nurse_id: m.nurse.id,
        ai_score: m.score,
        status: 'pending',
        admin_approved: false
      }))

      const { error: insertError } = await supabase
        .from('matches')
        .insert(matchInserts)

      if (insertError) {
        // Ignore duplicate key errors if some matches already exist
        if (!insertError.message.includes('unique constraint')) {
          throw insertError
        }
      }
    }

    return potentialMatches
  } catch (error) {
    console.error('Error finding and saving matches:', error)
    throw error
  }
}

