'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Star, Send, ThumbsUp } from 'lucide-react'

interface Review {
  id: string
  nurse_id: string
  patient_id: string
  patient_name: string
  rating: number
  comment: string
  created_at: string
  helpful_count: number
}

interface RatingReviewProps {
  nurseId: string
  nurseName: string
  currentRating?: number
  onReviewSubmitted?: () => void
}

export default function RatingReview({ nurseId, nurseName, currentRating, onReviewSubmitted }: RatingReviewProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [showReviewForm, setShowReviewForm] = useState(false)
  const isMockMode = (supabase as any).isMockMode

  const loadReviews = async () => {
    if (isMockMode) {
      const mockReviews: Review[] = [
        {
          id: 'r1',
          nurse_id: nurseId,
          patient_id: 'p1',
          patient_name: 'John M.',
          rating: 5,
          comment: 'Excellent care! Very professional and compassionate. Made my recovery much smoother.',
          created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          helpful_count: 12
        },
        {
          id: 'r2',
          nurse_id: nurseId,
          patient_id: 'p2',
          patient_name: 'Sarah K.',
          rating: 4,
          comment: 'Very attentive and knowledgeable. Highly recommend for elderly care.',
          created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
          helpful_count: 8
        }
      ]
      setReviews(mockReviews)
      return
    }

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('nurse_id', nurseId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReviews(data || [])
    } catch (error) {
      console.error('Error loading reviews:', error)
    }
  }

  useState(() => {
    loadReviews()
  })

  const handleSubmitReview = async () => {
    if (rating === 0) {
      alert('Please select a rating')
      return
    }
    if (!comment.trim()) {
      alert('Please write a comment')
      return
    }

    setLoading(true)

    if (isMockMode) {
      const newReview: Review = {
        id: `r_${Date.now()}`,
        nurse_id: nurseId,
        patient_id: 'current_user',
        patient_name: 'You',
        rating,
        comment,
        created_at: new Date().toISOString(),
        helpful_count: 0
      }
      
      setReviews(prev => [newReview, ...prev])
      setLoading(false)
      setShowReviewForm(false)
      setRating(0)
      setComment('')
      
      if (onReviewSubmitted) onReviewSubmitted()
      return
    }

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          nurse_id: nurseId,
          rating,
          comment,
          patient_name: 'Anonymous' // In real app, get from auth
        })

      if (error) throw error

      // Update nurse's average rating
      const { data: allReviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('nurse_id', nurseId)

      if (allReviews && allReviews.length > 0) {
        const avgRating = allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length
        await supabase
          .from('profiles')
          .update({ rating: avgRating, reviewCount: allReviews.length })
          .eq('id', nurseId)
      }

      setLoading(false)
      setShowReviewForm(false)
      setRating(0)
      setComment('')
      await loadReviews()
      
      if (onReviewSubmitted) onReviewSubmitted()
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  const getRatingLabel = (rating: number) => {
    if (rating >= 5) return 'Exceptional'
    if (rating >= 4) return 'Very Good'
    if (rating >= 3) return 'Good'
    if (rating >= 2) return 'Fair'
    return 'Poor'
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 5) return 'text-green-600'
    if (rating >= 4) return 'text-[#A79277]'
    if (rating >= 3) return 'text-yellow-600'
    return 'text-red-600'
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : currentRating || 0

  return (
    <div className="bg-white rounded-md border border-[#E8DCC8] overflow-hidden">
      {/* Rating Summary */}
      <div className="bg-gradient-to-r from-[#A79277] to-[#8B7355] p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold mb-2">Reviews & Ratings</h3>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 ${
                      star <= Math.round(averageRating)
                        ? 'fill-white text-white'
                        : 'text-white/30'
                    }`}
                  />
                ))}
              </div>
              <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
            </div>
            <p className="text-sm text-white/80 mt-1">Based on {reviews.length} reviews</p>
          </div>

          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-4 py-2 bg-white text-[#A79277] rounded-md hover:bg-[#F7E7CE] transition-colors font-semibold"
          >
            {showReviewForm ? 'Cancel' : 'Write Review'}
          </button>
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="p-6 border-b border-[#E8DCC8] bg-[#F7E7CE]/50">
          <h4 className="text-sm font-bold text-[#5C4B37] mb-4">Write a Review for {nurseName}</h4>
          
          {/* Star Rating */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#5C4B37] mb-2">Your Rating</label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-[#A79277] text-[#A79277]'
                        : 'text-[#E8DCC8]'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className={`ml-3 font-semibold ${getRatingColor(rating)}`}>
                  {getRatingLabel(rating)}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#5C4B37] mb-2">Your Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-3 border border-[#E8DCC8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A79277] focus:border-transparent"
              rows={4}
              placeholder="Share your experience with this nurse..."
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmitReview}
            disabled={loading || rating === 0}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-[#A79277] text-white rounded-md hover:bg-[#9A8469] transition-colors font-semibold disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
            <span>{loading ? 'Submitting...' : 'Submit Review'}</span>
          </button>
        </div>
      )}

      {/* Reviews List */}
      <div className="divide-y divide-[#E8DCC8]">
        {reviews.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[#8B7355]">No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="p-6 hover:bg-[#F7E7CE]/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#F7E7CE] rounded-md flex items-center justify-center border border-[#E8DCC8]">
                    <span className="text-sm font-bold text-[#5C4B37]">
                      {review.patient_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#5C4B37]">{review.patient_name}</p>
                    <p className="text-xs text-[#8B7355]">
                      {new Date(review.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating
                          ? 'fill-[#A79277] text-[#A79277]'
                          : 'text-[#E8DCC8]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-sm text-[#5C4B37] leading-relaxed mb-3">{review.comment}</p>

              <button className="flex items-center space-x-2 text-xs text-[#8B7355] hover:text-[#A79277] transition-colors">
                <ThumbsUp className="h-3 w-3" />
                <span>Helpful ({review.helpful_count})</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
