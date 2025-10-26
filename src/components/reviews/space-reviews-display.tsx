'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star, User, Calendar } from 'lucide-react'

interface Review {
  id: string
  rating: number
  comment: string
  overallExperience: number
  cleanliness: number
  restroomHygiene: number
  amenities: number
  staffService: number
  wifiQuality: number
  createdAt: string
  user: {
    firstName: string | null
    lastName: string | null
    professionalRole: string | null
  }
}

interface SpaceReviewsDisplayProps {
  spaceId: string
  spaceName?: string
}

export function SpaceReviewsDisplay({ spaceId, spaceName }: SpaceReviewsDisplayProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReviews()
  }, [spaceId])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/spaces/${spaceId}/reviews`)
      const data = await response.json()
      
      if (response.ok && data.success) {
        setReviews(data.reviews || [])
      } else {
        setError(data.error || 'Failed to fetch reviews')
      }
    } catch (err) {
      console.error('Error fetching reviews:', err)
      setError('Failed to fetch reviews')
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const getProfessionalRoleColor = (role: string | null) => {
    if (!role) return 'bg-gray-500'
    
    const roleColors: { [key: string]: string } = {
      'visionary': 'bg-purple-500',
      'industrialist': 'bg-indigo-500',
      'marketer': 'bg-blue-500',
      'green_ev': 'bg-green-500',
      'young_entrepreneur': 'bg-yellow-500',
      'oracle': 'bg-orange-500',
      'real_estate': 'bg-red-500',
      'nomad': 'bg-gray-500',
      'policy_maker': 'bg-white text-black',
      'prefer_not_to_say': 'bg-black'
    }
    
    return roleColors[role] || 'bg-gray-500'
  }

  const getProfessionalRoleName = (role: string | null) => {
    if (!role) return 'Professional'
    
    const roleNames: { [key: string]: string } = {
      'visionary': 'Visionary',
      'industrialist': 'Industrialist',
      'marketer': 'Marketer',
      'green_ev': 'Green & EV',
      'young_entrepreneur': 'Young Entrepreneur',
      'oracle': 'Oracle',
      'real_estate': 'Real Estate',
      'nomad': 'Nomad',
      'policy_maker': 'Policy Maker',
      'prefer_not_to_say': 'Prefer Not to Say'
    }
    
    return roleNames[role] || 'Professional'
  }

  if (loading) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Reviews & Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            <span className="ml-2 text-white">Loading reviews...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Reviews & Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-400">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white">
          Reviews & Ratings
          {spaceName && <span className="text-sm font-normal text-gray-300 ml-2">for {spaceName}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No reviews yet</h3>
            <p className="text-gray-400">Be the first to share your experience with this space!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-white">
                            {review.user.firstName && review.user.lastName 
                              ? `${review.user.firstName} ${review.user.lastName}`
                              : 'Anonymous User'
                            }
                          </h4>
                          {review.user.professionalRole && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProfessionalRoleColor(review.user.professionalRole)}`}>
                              {getProfessionalRoleName(review.user.professionalRole)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {renderStars(review.rating)}
                      <div className="text-sm text-gray-400 mt-1">{review.rating}/5</div>
                    </div>
                  </div>
                  
                  <p className="text-gray-200 leading-relaxed">{review.comment}</p>
                  
                  {/* Detailed Ratings */}
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Overall:</span>
                      <span className="text-white">{review.overallExperience}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cleanliness:</span>
                      <span className="text-white">{review.cleanliness}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Restroom:</span>
                      <span className="text-white">{review.restroomHygiene}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Amenities:</span>
                      <span className="text-white">{review.amenities}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Staff:</span>
                      <span className="text-white">{review.staffService}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">WiFi:</span>
                      <span className="text-white">{review.wifiQuality}/5</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Summary Stats */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Average Rating</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    {renderStars(Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length))}
                    <span className="text-white font-medium">
                      {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}/5
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{reviews.length}</div>
                  <div className="text-sm text-gray-400">Total Reviews</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
